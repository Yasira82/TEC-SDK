import axios, { AxiosInstance, AxiosError, Method } from 'axios';
import { logger } from '../utils/logger';

export class TECHttpClient {
  private client: AxiosInstance;

  constructor(baseURL?: string) {
    const resolvedURL =
      baseURL ??
      process.env['TEC_GATEWAY_URL'] ??
      process.env['API_GATEWAY_URL'];

    if (!resolvedURL) {
      throw new Error(
        'FATAL: TEC_GATEWAY_URL or API_GATEWAY_URL must be configured',
      );
    }

    const secret = process.env['INTERNAL_SECRET'];

    this.client = axios.create({
      baseURL: resolvedURL,
      headers: {
        'Content-Type': 'application/json',
        ...(secret ? { 'x-internal-key': secret } : {}),
      },
      timeout: 15000,
    });
  }

  async request<T = unknown>(
    service: string,
    endpoint: string,
    method: Method = 'GET',
    data?: unknown,
    headers?: Record<string, string>,
  ): Promise<T> {
    try {
      const response = await this.client.request<T>({
        url: `/${service}${endpoint}`,
        method,
        data,
        headers,
      });
      return response.data;
    } catch (error: unknown) {
      const axiosErr = error as AxiosError;

      if (axiosErr.response) {
        logger.error(
          {
            service,
            status: axiosErr.response.status,
            data: axiosErr.response.data,
          },
          '[TEC-SDK] Service request failed',
        );
      } else {
        logger.error(
          {
            service,
            message: axiosErr.message,
          },
          '[TEC-SDK] Network error',
        );
      }

      throw error;
    }
  }
}
