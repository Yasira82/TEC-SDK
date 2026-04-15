import { BaseClient } from './baseClient';
import { z }          from 'zod';

export const WalletBalanceSchema = z.object({
  userId:   z.string(),
  balance:  z.number(),
  currency: z.string().default('PI'),
});

export const WalletTransactionSchema = z.object({
  transactionId: z.string(),
  userId:        z.string(),
  amount:        z.number(),
  currency:      z.string(),
  type:          z.string().optional(),
  status:        z.enum(['pending', 'completed', 'failed']).optional(),
  createdAt:     z.preprocess(
    (v) => (v ? new Date(v as string) : null),
    z.date().nullable(),
  ),
  updatedAt:     z.preprocess(
    (v) => (v ? new Date(v as string) : null),
    z.date().nullable(),
  ),
});

export type WalletBalance     = z.infer<typeof WalletBalanceSchema>;
export type WalletTransaction = z.infer<typeof WalletTransactionSchema>;

export class WalletClient extends BaseClient {
  constructor(baseURL: string, apiKey?: string) {
    super(baseURL, apiKey);
  }

  async getBalance(userId: string): Promise<WalletBalance> {
    return this.withRetry(async () => {
      const res = await this.get<unknown>(`/wallets/${encodeURIComponent(userId)}/balance`);
      return WalletBalanceSchema.parse(res);
    });
  }

  async creditWallet(
    userId:      string,
    amount:      number,
    referenceId: string,
  ): Promise<WalletTransaction> {
    return this.withRetry(async () => {
      const res = await this.post<unknown>(`/wallets/${encodeURIComponent(userId)}/credit`, {
        amount,
        referenceId,
      });
      return WalletTransactionSchema.parse(res);
    });
  }

  async debitWallet(
    userId:      string,
    amount:      number,
    referenceId: string,
  ): Promise<WalletTransaction> {
    return this.withRetry(async () => {
      const res = await this.post<unknown>(`/wallets/${encodeURIComponent(userId)}/debit`, {
        amount,
        referenceId,
      });
      return WalletTransactionSchema.parse(res);
    });
  }

  async getTransactions(userId: string): Promise<WalletTransaction[]> {
    return this.withRetry(async () => {
      const res = await this.get<unknown[]>(`/wallets/${encodeURIComponent(userId)}/transactions`);
      return z.array(WalletTransactionSchema).parse(res);
    });
  }
}
