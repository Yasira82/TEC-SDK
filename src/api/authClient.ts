import { BaseClient, TecSdkError } from './baseClient';
import { z } from 'zod';

export const AuthUserSchema = z.object({
  id: z.string(),
  piId: z.string(),
  piUsername: z.string(),
  role: z.string(),
  subscriptionPlan: z.string().nullable(),
  createdAt: z.string(),
});

export const AuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const LoginResponseSchema = z.object({
  success: z.boolean(),
  isNewUser: z.boolean(),
  user: AuthUserSchema,
  tokens: AuthTokensSchema,
});

export type AuthUser = z.infer<typeof AuthUserSchema>;
export type AuthTokens = z.infer<typeof AuthTokensSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const UserSchema = AuthUserSchema;
export type User = AuthUser;

export class AuthClient extends BaseClient {
  constructor(baseURL: string, apiKey?: string) {
    super(baseURL, apiKey);
  }

  async loginWithPi(piAccessToken: string): Promise<LoginResponse> {
    let raw: unknown;

    try {
      raw = await this.post<unknown>('/api/auth/pi-login', {
        accessToken: piAccessToken,
      });
    } catch (err: unknown) {
      if (err instanceof TecSdkError) throw err;

      const anyErr = err as Record<string, unknown>;
      const response = anyErr?.response as Record<string, unknown> | undefined;
      const status = (response?.status as number) ?? 500;
      const message =
        ((response?.data as Record<string, unknown>)?.message as string) ??
        (anyErr?.message as string) ??
        'Authentication failed';

      throw new TecSdkError(status, message, err);
    }

    const response = LoginResponseSchema.parse(raw);

    this.setToken(response.tokens.accessToken);

    if (typeof window !== 'undefined') {
      localStorage.setItem('tec_refresh_token', response.tokens.refreshToken);
      localStorage.setItem('tec_user', JSON.stringify(response.user));
    }

    return response;
  }

  async refreshToken(): Promise<{ token: string }> {
    const refreshToken =
      typeof window !== 'undefined'
        ? localStorage.getItem('tec_refresh_token')
        : null;

    if (!refreshToken) throw new TecSdkError(401, 'No refresh token found');

    const res = await this.post<{ success: boolean; token: string }>(
      '/api/auth/refresh',
      { refreshToken },
    );

    this.setToken(res.token);
    return res;
  }

  async getProfile(): Promise<AuthUser> {
    const res = await this.get<unknown>('/api/auth/me');
    return AuthUserSchema.parse(res);
  }

  async health(): Promise<{ status: string }> {
    return this.get('/api/auth/health');
  }

  logout(): void {
    this.clearToken();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tec_refresh_token');
      localStorage.removeItem('tec_user');
    }
  }
}
