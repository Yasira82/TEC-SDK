import { z } from 'zod';
import { UserSchema } from '../api/authClient';
import { WalletBalanceSchema, WalletTransactionSchema } from '../api/walletClient';
import { PaymentSchema } from '../api/paymentClient';

/**
 * TEC Auth Types
 */
export type TecUser = z.infer<typeof UserSchema>;

/**
 * TEC Wallet Types
 */
export type TecWalletBalance = z.infer<typeof WalletBalanceSchema>;
export type TecWalletTransaction = z.infer<typeof WalletTransactionSchema>;

/**
 * TEC Payment Types
 */
export type TecPayment = z.infer<typeof PaymentSchema>;

/**
 * General SDK Configuration
 */
export interface TecSdkConfig {
  apiKey: string;
  gatewayUrl: string;
  timeout?: number;
}

/**
 * Standard API Response Wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: string;
}
