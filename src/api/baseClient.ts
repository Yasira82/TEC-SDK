import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError, AxiosRequestHeaders } from 'axios';
import { z } from 'zod';

/**
 * BaseClient — Core SDK HTTP client
 * Updates: Optional API Key, unified request method, enhanced logging
 */
export abstract class BaseClient {
  protected client: AxiosInstance;

  constructor(protected baseURL: string, protected apiKey?: string) {
    // Normalize baseURL
    if (this.baseURL.endsWith('/')) {
      this.baseURL = this.baseURL.slice(0, -1);
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'x-api-key': apiKey }),
      },
      timeout: 10000,
    });

    // Request Interceptor: Add token automatically if available
    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('tec_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    // Response Interceptor: centralized error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const data = error.response?.data as any;
        const errMsg = data?.message || error.message;
        const status = error.response?.status || 500;
        console.error(`[TEC SDK][HTTP ERROR] ${status} — ${errMsg}`);
        return Promise.reject({ status, message: errMsg, original: error });
      }
    );
  }

  /**
   * Unified request method for modules using service + endpoint pattern
   */
  protected async request<T>(
    service: string,
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any,
    headers?: AxiosRequestHeaders
  ): Promise<T> {
    const path = `/${service}${endpoint}`;
    console.log(`[TEC SDK] Request: ${method} ${path}`);

    switch (method) {
      case 'GET': return this.get<T>(path, headers);
      case 'POST': return this.post<T>(path, data, headers);
      case 'PUT': return this.put<T>(path, data, headers);
      case 'DELETE': return this.delete<T>(path, headers);
      default: throw new Error(`Method ${method} not supported`);
    }
  }

  protected async get<T>(path: string, headers?: AxiosRequestHeaders, schema?: z.ZodSchema<T>): Promise<T> {
    const res = await this.client.get(path, { headers });
    if (schema) return schema.parse(res.data);
    return res.data;
  }

  protected async post<T>(path: string, data?: unknown, headers?: AxiosRequestHeaders, schema?: z.ZodSchema<T>): Promise<T> {
    const res = await this.client.post(path, data, { headers });
    if (schema) return schema.parse(res.data);
    return res.data;
  }

  protected async put<T>(path: string, data?: unknown, headers?: AxiosRequestHeaders, schema?: z.ZodSchema<T>): Promise<T> {
    const res = await this.client.put(path, data, { headers });
    if (schema) return schema.parse(res.data);
    return res.data;
  }

  protected async delete<T>(path: string, headers?: AxiosRequestHeaders, schema?: z.ZodSchema<T>): Promise<T> {
    const res = await this.client.delete(path, { headers });
    if (schema) return schema.parse(res.data);
    return res.data;
  }
}
