import { BaseClient } from './baseClient';
import { z } from 'zod';
import { logger } from '../utils/logger';

/**
 * TEC Payment API Contracts
 */
export const PaymentSchema = z.object({
  paymentId: z.string(),
  userId: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.enum(['created', 'approved', 'completed', 'failed', 'cancelled']),
  piPaymentId: z.string().nullable(),
  transactionId: z.string().nullable(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().transform((s) => new Date(s)),
  updatedAt: z.string().transform((s) => new Date(s)),
  approvedAt: z.string().nullable().transform((s) => s ? new Date(s) : null),
  completedAt: z.string().nullable().transform((s) => s ? new Date(s) : null),
});

export type Payment = z.infer<typeof PaymentSchema>;

/**
 * PaymentClient — SDK wrapper for Payment Service (Enhanced with Resiliency)
 */
export class PaymentClient extends BaseClient {
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
        logger.warn(`[PaymentClient] Attempt ${attempt} failed`, {
          method, path, error: err?.message || err,
        });
        
        if (attempt === retries) throw err;
        // Wait before next attempt: 500ms, 1000ms, 2000ms...
        await new Promise((r) => setTimeout(r, delayMs * Math.pow(2, attempt - 1)));
      }
    }
    throw new Error('TEC_SDK_INTERNAL_ERROR: SafeRequest reached unreachable state');
  }

  async createPayment(userId: string, amount: number, currency = 'PI', metadata?: Record<string, unknown>): Promise<Payment> {
    return this.safeRequest<Payment>('post', '/payments', { userId, amount, currency, metadata }, PaymentSchema);
  }

  async approvePayment(paymentId: string, metadata?: Record<string, unknown>): Promise<Payment> {
    return this.safeRequest<Payment>('post', `/payments/${paymentId}/approve`, { metadata }, PaymentSchema);
  }

  async completePayment(paymentId: string, transactionId?: string, metadata?: Record<string, unknown>): Promise<Payment> {
    return this.safeRequest<Payment>('post', `/payments/${paymentId}/complete`, { transactionId, metadata }, PaymentSchema);
  }

  async getPayment(paymentId: string): Promise<Payment> {
    return this.safeRequest<Payment>('get', `/payments/${paymentId}`, undefined, PaymentSchema);
  }

  async listUserPayments(userId: string): Promise<Payment[]> {
    return this.safeRequest<Payment[]>('get', `/payments/user/${userId}`, undefined, z.array(PaymentSchema));
  }
}
