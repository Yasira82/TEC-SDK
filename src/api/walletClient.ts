WalletBalanceSchema
import { BaseClient } from './baseClient';
import { z } from 'zod';

export const WalletSchema = z.object({
  id: z.string(),
  userId: z.string(),
  balance: z.number(),
  currency: z.string(),
  is_primary: z.boolean().optional(),
  created_at: z.string().optional(),
});

export const WalletTransactionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  amount: z.number(),
  currency: z.string(),
  type: z.string().optional(),
  status: z.enum(['pending', 'completed', 'failed']).optional(),
  created_at: z.string().optional(),
});

// ✅ ده اللي كان ناقص
export const WalletBalanceSchema = z.object({
  balance: z.number(),
  currency: z.string().optional(),
  userId: z.string().optional(),
});

export type Wallet = z.infer<typeof WalletSchema>;
export type WalletTransaction = z.infer<typeof WalletTransactionSchema>;
export type WalletBalance = z.infer<typeof WalletBalanceSchema>;

export class WalletClient extends BaseClient {
  constructor(baseURL: string, apiKey?: string) {
    super(baseURL, apiKey);
  }

  private async withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
    for (let i = 1; i <= retries; i++) {
      try {
        return await fn();
      } catch (err: any) {
        if (i === retries) throw err;
        await new Promise((r) => setTimeout(r, 500 * Math.pow(2, i - 1)));
      }
    }
    throw new Error('Unreachable');
  }

  async getWallets(userId: string): Promise<Wallet[]> {
    return this.withRetry(async () => {
      const res = await this.get<any>(
        `/api/wallets?userId=${encodeURIComponent(userId)}`
      );
      return res?.data?.wallets ?? res?.wallets ?? [];
    });
  }

  async getBalance(userId: string): Promise<number> {
    return this.withRetry(async () => {
      const wallets = await this.getWallets(userId);
      const primary = wallets.find((w) => w.is_primary) ?? wallets[0];
      return primary?.balance ?? 0;
    });
  }

  async getTransactions(walletId: string): Promise<WalletTransaction[]> {
    return this.withRetry(async () => {
      const res = await this.get<any>(
        `/api/wallets/${walletId}/transactions`
      );
      return res?.data?.transactions ?? res?.transactions ?? [];
    });
  }
  }
