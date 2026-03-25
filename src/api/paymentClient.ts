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
  createdAt: z.preprocess(
    (v) => (v ? new Date(v as string) : null),
    z.date().nullable(),
  ),
  updatedAt: z.preprocess(
    (v) => (v ? new Date(v as string) : null),
    z.date().nullable(),
  ),
  approvedAt: z.preprocess(
    (v) => (v ? new Date(v as string) : null),
    z.date().nullable(),
  ),
  completedAt: z.preprocess(
    (v) => (v ? new Date(v as string) : null),
    z.date().nullable(),
  ),
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

  async createPayment(
    userId: string,
    amount: number,
    currency = 'PI',
    metadata?: Record<string, unknown>,
  ): Promise<Payment> {
    return this.withRetry(() =>
      this.post('/payments', { userId, amount, currency, metadata }, PaymentSchema),
    );
  }

  async approvePayment(
    paymentId: string,
    metadata?: Record<string, unknown>,
  ): Promise<Payment> {
    return this.withRetry(() =>
      this.post(`/payments/${paymentId}/approve`, { metadata }, PaymentSchema),
    );
  }

  async completePayment(
    paymentId: string,
    transactionId: string,
    metadata?: Record<string, unknown>,
  ): Promise<Payment> {
    return this.withRetry(() =>
      this.post(
        `/payments/${paymentId}/complete`,
        { transactionId, metadata },
        PaymentSchema,
      ),
    );
  }

  async cancelPayment(paymentId: string): Promise<Payment> {
    return this.withRetry(() =>
      this.post(`/payments/${paymentId}/cancel`, {}, PaymentSchema),
    );
  }

  async getPayment(paymentId: string): Promise<Payment> {
    return this.withRetry(() =>
      this.get(`/payments/${paymentId}`, PaymentSchema),
    );
  }

  async listUserPayments(userId: string): Promise<Payment[]> {
    return this.withRetry(async () => {
      const res = await this.get<unknown[]>(`/payments/user/${userId}`);
      return z.array(PaymentSchema).parse(res);
    });
  }

  async resolveIncomplete(piPaymentId: string): Promise<Payment> {
    return this.withRetry(() =>
      this.post('/payments/resolve-incomplete', { piPaymentId }, PaymentSchema),
    );
  }
}
