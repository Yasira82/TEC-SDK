import { BaseClient } from './baseClient';
import { z } from 'zod';

/**
 * TEC Wallet API Contracts
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
 * WalletClient — SDK wrapper for Wallet Service
 */
export class WalletClient extends BaseClient {
  constructor(baseURL: string, apiKey: string) {
    super(baseURL, apiKey);
  }

  /**
   * Get user wallet balance from the federated wallet service
   */
  async getBalance(userId: string): Promise<WalletBalance> {
    return this.get<WalletBalance>(`/wallets/${userId}/balance`, WalletBalanceSchema);
  }

  /**
   * Credit user wallet (Add funds)
   */
  async creditWallet(userId: string, amount: number, referenceId: string): Promise<WalletTransaction> {
    return this.post<WalletTransaction>(
      `/wallets/${userId}/credit`,
      { amount, referenceId },
      WalletTransactionSchema
    );
  }

  /**
   * Debit user wallet (Deduct funds)
   */
  async debitWallet(userId: string, amount: number, referenceId: string): Promise<WalletTransaction> {
    return this.post<WalletTransaction>(
      `/wallets/${userId}/debit`,
      { amount, referenceId },
      WalletTransactionSchema
    );
  }

  /**
   * Fetch transaction history for a specific user
   */
  async getTransactions(userId: string): Promise<WalletTransaction[]> {
    return this.get<WalletTransaction[]>(`/wallets/${userId}/transactions`, z.array(WalletTransactionSchema));
  }
}
