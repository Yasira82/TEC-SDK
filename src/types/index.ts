import { z } from 'zod';
import { UserSchema } from '../api/authClient';
import { WalletBalanceSchema, WalletTransactionSchema } from '../api/walletClient';
import { PaymentSchema } from '../api/paymentClient';
import { AssetSchema } from '../api/assetClient';

// ─── Auth ────────────────────────────────────────────────
export type TecUser = z.infer<typeof UserSchema>;

// ─── Wallet ──────────────────────────────────────────────
export type TecWalletBalance = z.infer<typeof WalletBalanceSchema>;
export type TecWalletTransaction = z.infer<typeof WalletTransactionSchema>;

// ─── Payment ─────────────────────────────────────────────
export type TecPayment = z.infer<typeof PaymentSchema>;

// ─── Asset ───────────────────────────────────────────────
export type TecAsset = z.infer<typeof AssetSchema>;

// ─── SDK Config ──────────────────────────────────────────
export interface TecSdkConfig {
  apiKey: string;
  gatewayUrl: string;
  timeout?: number;
}

// ─── Standard API Response Wrapper ───────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: string;
}

// ─── Pagination ──────────────────────────────────────────
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
