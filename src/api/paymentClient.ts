import { BaseClient } from './baseClient';
import { z } from 'zod';

export const PaymentSchema = z.object({
  paymentId: z.string(),
  userId: z.string(),
  amount: z.number(),
  currency: z.string().default('PI'),
  status: z.enum(['created', 'approved', 'completed', 'failed', 'cancelled']),
  piPaymentId: z.string().nullable().optional(),
  transactionId: z.string().nullable().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.preprocess((v) => (v ? new Date(v as string) : null), z.date().nullable()),
  updatedAt: z.preprocess((v) => (v ? new Date(v as string) : null), z.date().nullable()),
  approvedAt: z.preprocess((v) => (v ? new Date(v as string) : null), z.date().nullable()),
  completedAt: z.preprocess((v) => (v ? new Date(v as string) : null), z.date().nullable()),
});

export type Payment = z.infer<typeof PaymentSchema>;

export class PaymentClient extends BaseClient {
  constructor(baseURL: string, apiKey?: string) {
    super(baseURL, apiKey);
  }

  private async withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
    for (let i = 1; i <= retries; i++) {
      try {
        return await fn();
      } catch (err: unknown) {
        if (i === retries) throw err;
        await new Promise((r) => setTimeout(r, 500 * Math.pow(2, i - 1)));
      }
    }
    throw new Error('Unreachable');
  }

  private parsePayment(raw: unknown): Payment {
    return PaymentSchema.parse(raw);
  }

  async createPayment(
    userId: string,
    amount: number,
    currency = 'PI',
    metadata?: Record<string, unknown>,
  ): Promise<Payment> {
    return this.withRetry(async () => {
      const res = await this.post<unknown>('/payments', {
        userId,
        amount,
        currency,
        metadata,
      });
      return this.parsePayment(res);
    });
  }

  async approvePayment(
    paymentId: string,
    metadata?: Record<string, unknown>,
  ): Promise<Payment> {
    return this.withRetry(async () => {
      const res = await this.post<unknown>(`/payments/${paymentId}/approve`, {
        metadata,
      });
      return this.parsePayment(res);
    });
  }

  async completePayment(
    paymentId: string,
    transactionId: string,
    metadata?: Record<string, unknown>,
  ): Promise<Payment> {
    return this.withRetry(async () => {
      const res = await this.post<unknown>(`/payments/${paymentId}/complete`, {
        transactionId,
        metadata,
      });
      return this.parsePayment(res);
    });
  }

  async cancelPayment(paymentId: string): Promise<Payment> {
    return this.withRetry(async () => {
      const res = await this.post<unknown>(`/payments/${paymentId}/cancel`, {});
      return this.parsePayment(res);
    });
  }

  async getPayment(paymentId: string): Promise<Payment> {
    return this.withRetry(async () => {
      const res = await this.get<unknown>(`/payments/${paymentId}`);
      return this.parsePayment(res);
    });
  }

  async listUserPayments(userId: string): Promise<Payment[]> {
    return this.withRetry(async () => {
      const res = await this.get<unknown[]>(`/payments/user/${userId}`);
      return z.array(PaymentSchema).parse(res);
    });
  }

  async resolveIncomplete(piPaymentId: string): Promise<Payment> {
    return this.withRetry(async () => {
      const res = await this.post<unknown>('/payments/resolve-incomplete', {
        piPaymentId,
      });
      return this.parsePayment(res);
    });
  }
                          }
