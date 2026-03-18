import { BaseClient } from './baseClient';
import { z } from 'zod';

// ✅ Schema يطابق payment-service response الحقيقي
export const PaymentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  amount: z.number(),
  currency: z.string(),
  payment_method: z.string(),
  status: z.enum(['created', 'approved', 'completed', 'failed', 'cancelled']),
  pi_payment_id: z.string().nullable().optional(),
  transaction_id: z.string().nullable().optional(),
  metadata: z.record(z.any()).optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Payment = z.infer<typeof PaymentSchema>;

export const CreatePaymentResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    payment: PaymentSchema,
  }),
});

export class PaymentClient extends BaseClient {
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

  // POST /api/payments/create
  async create(params: {
    userId: string;
    amount: number;
    currency?: string;
    payment_method?: string;
    metadata?: Record<string, any>;
  }): Promise<Payment> {
    return this.withRetry(async () => {
      const res = await this.post<any>('/api/payments/create', {
        userId: params.userId,
        amount: params.amount,
        currency: params.currency || 'PI',
        payment_method: params.payment_method || 'pi',
        metadata: params.metadata,
      });
      return res?.data?.payment ?? res;
    });
  }

  // POST /api/payments/approve
  async approve(params: {
    payment_id: string;
    pi_payment_id?: string;
  }): Promise<Payment> {
    return this.withRetry(async () => {
      const res = await this.post<any>('/api/payments/approve', params);
      return res?.data?.payment ?? res;
    });
  }

  // POST /api/payments/complete
  async complete(params: {
    payment_id: string;
    transaction_id?: string;
  }): Promise<Payment> {
    return this.withRetry(async () => {
      const res = await this.post<any>('/api/payments/complete', params);
      return res?.data?.payment ?? res;
    });
  }

  // POST /api/payments/cancel
  async cancel(payment_id: string): Promise<Payment> {
    return this.withRetry(async () => {
      const res = await this.post<any>('/api/payments/cancel', { payment_id });
      return res?.data?.payment ?? res;
    });
  }

  // GET /api/payments/:id/status
  async getStatus(paymentId: string): Promise<Payment> {
    return this.withRetry(async () => {
      const res = await this.get<any>(`/api/payments/${paymentId}/status`);
      return res?.data?.payment ?? res;
    });
  }

  // GET /api/payments/history
  async getHistory(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<Payment[]> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.status) query.set('status', params.status);

    const res = await this.get<any>(`/api/payments/history?${query.toString()}`);
    return res?.data?.payments ?? res ?? [];
  }

  // POST /api/payments/resolve-incomplete
  async resolveIncomplete(pi_payment_id: string): Promise<any> {
    return this.post('/api/payments/resolve-incomplete', { pi_payment_id });
  }
        }
