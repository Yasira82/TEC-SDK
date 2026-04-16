import { TokenStore } from '../core/token-store';
import { BaseClient, TecSdkError } from './baseClient';
import { TokenStore }               from '../core/token-store';
import { z } from 'zod';

export const AuthUserSchema = z.object({
  id:               z.string(),
  piId:             z.string(),
  piUsername:       z.string(),
  role:             z.string(),
  subscriptionPlan: z.string().nullable(),
  createdAt:        z.string(),
});

export const AuthTokensSchema = z.object({
  accessToken:  z.string(),
  refreshToken: z.string(),
});

export const LoginResponseSchema = z.object({
  success:   z.boolean(),
  isNewUser: z.boolean(),
  user:      AuthUserSchema,
  tokens:    AuthTokensSchema,
});

export type AuthUser      = z.infer<typeof AuthUserSchema>;
export type AuthTokens    = z.infer<typeof AuthTokensSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const UserSchema = AuthUserSchema;
export type User = AuthUser;

const TOKEN_KEYS = {
  ACCESS:  'tec_token',
  REFRESH: 'tec_refresh_token',
  USER:    'tec_user',
} as const;

export class AuthClient extends BaseClient {
  constructor(baseURL: string, apiKey?: string, tokenStore?: TokenStore, timeout?: number) {
  super(baseURL, apiKey, tokenStore, timeout);
  }

  async loginWithPi(piAccessToken: string): Promise<LoginResponse> {
    let raw: unknown;
    try {
      raw = await this.post<unknown>('/api/auth/pi-login', { accessToken: piAccessToken });
    } catch (err: unknown) {
      if (err instanceof TecSdkError) throw err;
      const anyErr   = err as Record<string, unknown>;
      const response = anyErr?.response as Record<string, unknown> | undefined;
      const status   = (response?.status as number) ?? 500;
      const message  =
        ((response?.data as Record<string, unknown>)?.message as string) ??
        (anyErr?.message as string) ??
        'Authentication failed';
      throw new TecSdkError(status, message, err);
    }

    const result = LoginResponseSchema.parse(raw);
    this.tokens.set(TOKEN_KEYS.ACCESS,  result.tokens.accessToken);
    this.tokens.set(TOKEN_KEYS.REFRESH, result.tokens.refreshToken);
    this.tokens.set(TOKEN_KEYS.USER,    JSON.stringify(result.user));
    return result;
  }

  async refreshToken(): Promise<{ token: string }> {
    const refreshToken = this.tokens.get(TOKEN_KEYS.REFRESH);
    if (!refreshToken) throw new TecSdkError(401, 'No refresh token found');
    const res = await this.post<{ success: boolean; token: string }>(
      '/api/auth/refresh',
      { refreshToken },
    );
    this.tokens.set(TOKEN_KEYS.ACCESS, res.token);
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
    this.tokens.remove(TOKEN_KEYS.ACCESS);
    this.tokens.remove(TOKEN_KEYS.REFRESH);
    this.tokens.remove(TOKEN_KEYS.USER);
    this.clearToken();
  }
}
