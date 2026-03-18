import { BaseClient } from './baseClient';
import { z } from 'zod';

// ✅ مفيش transform — string بس
export const ServiceHealthSchema = z.object({
  service: z.string(),
  status: z.enum(['up', 'down', 'degraded']),
  version: z.string().optional(),
  uptime: z.number().optional(),
  latency: z.number(),
  lastChecked: z.string(),  // ✅ string مش Date
});

export const SystemHealthSchema = z.object({
  overallStatus: z.enum(['healthy', 'unhealthy', 'warning']),
  services: z.array(ServiceHealthSchema),
  timestamp: z.string(),    // ✅ string مش Date
});

export type ServiceHealth = z.infer<typeof ServiceHealthSchema>;
export type SystemHealth = z.infer<typeof SystemHealthSchema>;

export class HealthClient extends BaseClient {
  constructor(baseURL: string, apiKey?: string) {
    super(baseURL, apiKey);
  }

  async getSystemStatus(): Promise<SystemHealth> {
    return this.get<SystemHealth>('/health/status', SystemHealthSchema);
  }

  async checkService(serviceName: string): Promise<ServiceHealth> {
    return this.get<ServiceHealth>(
      `/health/check/${serviceName}`,
      ServiceHealthSchema
    );
  }

  async ping(): Promise<{ message: string; timestamp: string }> {
    return this.get('/health/ping');
  }
}
