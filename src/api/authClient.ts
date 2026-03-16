import { BaseClient } from './baseClient';
import { z } from 'zod';
import { logger } from '../utils/logger';

/**
 * Auth API Contracts
 */
export const UserSchema = z.object({
  userId: z.string(),
  email: z.string().email().nullable(), // Email might be nullable depending on Pi permissions
  username: z.string(),
  createdAt: z.string().transform((s) => new Date(s)),
  updatedAt: z.string().transform((s) => new Date(s)),
});

export const LoginResponseSchema = z.object({
  token: z.string(),
  user: UserSchema,
});

export type User = z.infer<typeof UserSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

/**
 * AuthClient — SDK wrapper for Identity & Authentication
 */
export class AuthClient extends BaseClient {
  constructor(baseURL: string, apiKey: string) {
    super(baseURL, apiKey);
  }

  /**
   * Authenticate using Pi Network Access Token
   * This is the primary login method for the ecosystem
   */
  async loginWithPi(piAccessToken: string): Promise<LoginResponse> {
    try {
      const response = await this.post<LoginResponse>(
        '/auth/pi-login', 
        { accessToken: piAccessToken }, 
        LoginResponseSchema
      );

      // Auto-save token for subsequent SDK requests
      if (typeof window !== 'undefined') {
        localStorage.setItem('tec_token', response.token);
      }

      return response;
    } catch (error: any) {
      logger.error('Login failed in AuthClient', { error: error.message });
      throw error;
    }
  }

  /**
   * Get current authenticated user profile
   */
  async getCurrentUser(): Promise<User> {
    return this.get<User>('/auth/me', UserSchema);
  }

  /**
   * Clear local session
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tec_token');
    }
  }
}
