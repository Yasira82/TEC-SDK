import { BaseClient } from './baseClient';
import { z } from 'zod';

export const ServiceHealthSchema = z.object({
  service: z.string(),
  status: z.enum(['up', 'down', 'degraded']),
  version: z.string().optional(),
  uptime: z.number().optional(),
  latency: z.number(),
  lastChecked: z.string().transform((s) => new Date(s)),
});

export const SystemHealthSchema = z.object({
  overallStatus: z.enum(['healthy', 'unhealthy', 'warning']),
  services: z.array(ServiceHealthSchema),
  timestamp: z.string().transform((s) => new Date(s)),
});

export type ServiceHealth = z.infer<typeof ServiceHealthSchema>;
export type SystemHealth = z.infer<typeof SystemHealthSchema>;

export class HealthClient extends BaseClient {
  constructor(baseURL: string, apiKey?: string) {
    super(baseURL, apiKey);
  }

  // ✅ get بياخد (path, schema) بس — مش 3 arguments
  async getSystemStatus(): Promise<SystemHealth> {
    return this.get<SystemHealth>('/health/status', SystemHealthSchema);
  }

  async checkService(serviceName: string): Promise<ServiceHealth> {
    return this.get<ServiceHealth>(
      `/health/check/${serviceName}`,
      ServiceHealthSchema
    );
  }

  async ping(): Promise<{ message: string; timestamp: Date }> {
    const response = await this.get<{ message: string; timestamp: string }>(
      '/health/ping'
    );
    return {
      message: response.message,
      timestamp: new Date(response.timestamp),
    };
  }
      }
