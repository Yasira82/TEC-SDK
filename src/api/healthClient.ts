import { BaseClient } from './baseClient';
import { z } from 'zod';

export const ServiceHealthSchema = z.object({
  service: z.string(),
  status: z.enum(['up', 'down', 'degraded']),
  version: z.string().optional(),
  uptime: z.number().optional(),
  latency: z.number().optional(),
  lastChecked: z.string().optional(),
});

export const SystemHealthSchema = z.object({
  overallStatus: z.enum(['healthy', 'unhealthy', 'warning']),
  services: z.array(ServiceHealthSchema),
  timestamp: z.string(),
});

export type ServiceHealth = z.infer<typeof ServiceHealthSchema>;
export type SystemHealth = z.infer<typeof SystemHealthSchema>;

export class HealthClient extends BaseClient {
  constructor(baseURL: string, apiKey?: string) {
    super(baseURL, apiKey);
  }

  async isAlive(): Promise<boolean> {
    try {
      await this.get<unknown>('/health');
      return true;
    } catch {
      return false;
    }
  }

  async getSystemStatus(): Promise<SystemHealth> {
    return this.get('/health/status', SystemHealthSchema);
  }

  async checkService(serviceName: string): Promise<ServiceHealth> {
    return this.get(`/health/check/${serviceName}`, ServiceHealthSchema);
  }

  async ping(): Promise<{ message: string; timestamp: string }> {
    return this.get('/health/ping');
  }
}
