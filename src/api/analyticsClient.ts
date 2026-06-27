import { BaseClient } from './baseClient';
import { TokenStore } from '../core/token-store';
import { z }          from 'zod';

// Shapes mirror tec-analytics-service (analytics.controller + analytics.service).
// All endpoints return the envelope { success, data }.

export const DailyMetricSchema = z.object({
  date:           z.string(),
  total_payments: z.number().optional(),
  total_volume:   z.number().optional(),
  new_users:      z.number().optional(),
  active_users:   z.number().optional(),
  kyc_submitted:  z.number().optional(),
  kyc_verified:   z.number().optional(),
  orders_created: z.number().optional(),
  orders_volume:  z.number().optional(),
}).passthrough();

export const AnalyticsOverviewSchema = z.object({
  totalEvents:   z.number(),
  totalPayments: z.number(),
  totalUsers:    z.number(),
  recentMetrics: z.array(DailyMetricSchema),
});

export const PaymentAnalyticsSchema = z.object({
  metrics: z.array(z.object({
    date:           z.string(),
    total_payments: z.number(),
    total_volume:   z.number(),
  })),
  totalVolume: z.number(),
  totalCount:  z.number(),
});

export const UserAnalyticsSchema = z.object({
  metrics: z.array(z.object({
    date:          z.string(),
    new_users:     z.number(),
    active_users:  z.number(),
    kyc_submitted: z.number(),
    kyc_verified:  z.number(),
  })),
});

export const AnalyticsEventSchema = z.object({
  id:         z.string(),
  type:       z.string(),
  payload:    z.record(z.unknown()).nullable().optional(),
  user_id:    z.string().nullable().optional(),
  created_at: z.string(),
}).passthrough();

export type AnalyticsOverview = z.infer<typeof AnalyticsOverviewSchema>;
export type PaymentAnalytics  = z.infer<typeof PaymentAnalyticsSchema>;
export type UserAnalytics     = z.infer<typeof UserAnalyticsSchema>;
export type AnalyticsEvent    = z.infer<typeof AnalyticsEventSchema>;

// All analytics endpoints wrap their payload in { success, data }.
const envelope = <T>(schema: z.ZodSchema<T, z.ZodTypeDef, unknown>) =>
  z.object({ success: z.boolean(), data: schema });

/**
 * Read-only analytics client → tec-analytics-service via the gateway.
 * Endpoints require a verified JWT (or x-internal-key); the BFF forwards the
 * caller's bearer token. Analytics is read-only — there are no mutations here.
 */
export class AnalyticsClient extends BaseClient {
  constructor(baseURL: string, apiKey?: string, tokenStore?: TokenStore, timeout?: number) {
    super(baseURL, apiKey, tokenStore, timeout);
  }

  async getOverview(): Promise<AnalyticsOverview> {
    return this.withRetry(async () => {
      const res = await this.get<unknown>('/api/analytics/overview');
      return envelope(AnalyticsOverviewSchema).parse(res).data;
    });
  }

  async getPayments(): Promise<PaymentAnalytics> {
    return this.withRetry(async () => {
      const res = await this.get<unknown>('/api/analytics/payments');
      return envelope(PaymentAnalyticsSchema).parse(res).data;
    });
  }

  async getUsers(): Promise<UserAnalytics> {
    return this.withRetry(async () => {
      const res = await this.get<unknown>('/api/analytics/users');
      return envelope(UserAnalyticsSchema).parse(res).data;
    });
  }

  async getEvents(limit = 20): Promise<AnalyticsEvent[]> {
    return this.withRetry(async () => {
      const res = await this.get<unknown>(`/api/analytics/events?limit=${encodeURIComponent(String(limit))}`);
      return envelope(z.array(AnalyticsEventSchema)).parse(res).data;
    });
  }
}
