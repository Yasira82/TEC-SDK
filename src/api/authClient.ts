import { BaseClient } from './baseClient';
import { z } from 'zod';

// ✅ Schema يطابق auth-service response الحقيقي
export const AuthUserSchema = z.object({
  id: z.string(),
  piId: z.string(),
  piUsername: z.string(),
  role: z.string().default('user'),
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

export class AuthClient extends BaseClient {
  constructor(baseURL: string, apiKey?: string) {
    super(baseURL, apiKey);
  }

  // POST /api/auth/pi-login
  async loginWithPi(piAccessToken: string): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>(
      '/api/auth/pi-login',
      { accessToken: piAccessToken },
      LoginResponseSchema
    );

    // ✅ Auto-save token بعد الـ login
    this.setToken(response.tokens.accessToken);

    if (typeof window !== 'undefined') {
      localStorage.setItem('tec_refresh_token', response.tokens.refreshToken);
      localStorage.setItem('tec_user', JSON.stringify(response.user));
    }

    return response;
  }

  // POST /api/auth/refresh
  async refreshToken(): Promise<{ token: string }> {
    const refreshToken =
      typeof window !== 'undefined'
        ? localStorage.getItem('tec_refresh_token')
        : null;

    if (!refreshToken) throw new Error('No refresh token found');

    const res = await this.post<{ success: boolean; token: string }>(
      '/api/auth/refresh',
      { refreshToken }
    );

    this.setToken(res.token);
    return res;
  }

  // GET /api/auth/me
  async getProfile(): Promise<AuthUser> {
    return this.get<AuthUser>('/api/auth/me', AuthUserSchema);
  }

  // GET /api/auth/health
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
