// ─── Imports ────────────────────────────────────────────────────────────────
import { BaseClient } from './baseClient';
import { z } from 'zod';
import { logger } from '../utils/logger';

// ─── Zod Schemas ────────────────────────────────────────────────────────────

/**
 * Represents the health status of a single service
 */
export const ServiceHealthSchema = z.object({
  service: z.string(),
  status: z.enum(['up', 'down', 'degraded']),
  version: z.string().optional(),
  uptime: z.number().optional(),       // in milliseconds
  latency: z.number(),                 // in milliseconds
  lastChecked: z.string().transform((s) => new Date(s)),
});

/**
 * Represents the overall system health
 */
export const SystemHealthSchema = z.object({
  overallStatus: z.enum(['healthy', 'unhealthy', 'warning']),
  services: z.array(ServiceHealthSchema),
  timestamp: z.string().transform((s) => new Date(s)),
});

// ─── TypeScript Types ───────────────────────────────────────────────────────
export type ServiceHealth = z.infer<typeof ServiceHealthSchema>;
export type SystemHealth = z.infer<typeof SystemHealthSchema>;

// ─── HealthClient ───────────────────────────────────────────────────────────

/**
 * HealthClient — SDK wrapper for monitoring the TEC Ecosystem health
 */
export class HealthClient extends BaseClient {
  constructor(baseURL: string, apiKey?: string) {
    super(baseURL, apiKey);
  }

  /**
   * Fetch the overall system health (all microservices)
   */
  async getSystemStatus(): Promise<SystemHealth> {
    try {
      return await this.get<SystemHealth>('/health/status', undefined, SystemHealthSchema);
    } catch (err) {
      logger.error('[HealthClient] Failed to fetch system status', err);
      throw err;
    }
  }

  /**
   * Check the health of a specific service by name (e.g., 'wallet', 'auth')
   */
  async checkService(serviceName: string): Promise<ServiceHealth> {
    return this.get<ServiceHealth>(
      `/health/check/${serviceName}`,
      undefined,
      ServiceHealthSchema
    );
  }

  /**
   * Simple ping method to verify connectivity to the Gateway
   */
  async ping(): Promise<{ message: string; timestamp: Date }> {
    const response = await this.get<{ message: string; timestamp: string }>('/health/ping');
    return {
      message: response.message,
      timestamp: new Date(response.timestamp),
    };
  }
}
