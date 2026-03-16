import { BaseClient } from './baseClient';
import { z } from 'zod';
import { logger } from '../utils/logger';

/**
 * Wallet API Contracts
 */
export const WalletBalanceSchema = z.object({
  userId: z.string(),
  balance: z.number(),
  currency: z.string(),
});

export const WalletTransactionSchema = z.object({
  transactionId: z.string(),
  userId: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.enum(['pending', 'completed', 'failed']),
  createdAt: z.string().transform((s) => new Date(s)),
  updatedAt: z.string().transform((s) => new Date(s)),
});

export type WalletBalance = z.infer<typeof WalletBalanceSchema>;
export type WalletTransaction = z.infer<typeof WalletTransactionSchema>;

/**
 * WalletClient — SDK wrapper for Wallet Service (Enhanced with Resiliency)
 */
export class WalletClient extends BaseClient {
  constructor(baseURL: string, apiKey: string) {
    super(baseURL, apiKey);
  }

  /**
   * Internal helper to execute requests with exponential backoff retries
   */
  private async safeRequest<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    path: string,
    data?: unknown,
    schema?: z.ZodSchema<T>,
    retries = 3,
    delayMs = 500
  ): Promise<T> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        switch (method) {
          case 'get': return await this.get<T>(path, schema);
          case 'post': return await this.post<T>(path, data, schema);
          case 'put': return await this.put<T>(path, data, schema);
          case 'delete': return await this.delete<T>(path, schema);
        }
      } catch (err: any) {
        logger.warn(`[WalletClient] Attempt ${attempt} failed`, {
          method, path, error: err?.message || err,
        });

        if (attempt === retries) throw err;
        await new Promise((r) => setTimeout(r, delayMs * Math.pow(2, attempt - 1)));
      }
    }
    throw new Error('TEC_SDK_INTERNAL_ERROR: SafeRequest reached unreachable state');
  }

  async getBalance(userId: string): Promise<WalletBalance> {
    return this.safeRequest<WalletBalance>('get', `/wallets/${userId}/balance`, undefined, WalletBalanceSchema);
  }

  async creditWallet(userId: string, amount: number, referenceId: string): Promise<WalletTransaction> {
    return this.safeRequest<WalletTransaction>(
      'post',
      `/wallets/${userId}/credit`,
      { amount, referenceId },
      WalletTransactionSchema
    );
  }

  async debitWallet(userId: string, amount: number, referenceId: string): Promise<WalletTransaction> {
    return this.safeRequest<WalletTransaction>(
      'post',
      `/wallets/${userId}/debit`,
      { amount, referenceId },
      WalletTransactionSchema
    );
  }

  async getTransactions(userId: string): Promise<WalletTransaction[]> {
    return this.safeRequest<WalletTransaction[]>(
      'get',
      `/wallets/${userId}/transactions`,
      undefined,
      z.array(WalletTransactionSchema)
    );
  }
}
