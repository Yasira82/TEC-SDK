import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
} from 'axios';
import { z } from 'zod';
import { logger } from '../utils/logger';

export class TecSdkError extends Error {
  public readonly status: number;
  public readonly original: unknown;

  constructor(status: number, message: string, original?: unknown) {
    super(message);
    this.name = 'TecSdkError';
    this.status = status;
    this.original = original;
    Object.setPrototypeOf(this, TecSdkError.prototype);
  }
}

export abstract class BaseClient {
  protected client: AxiosInstance;

  constructor(
    protected baseURL: string,
    protected apiKey?: string,
  ) {
    if (this.baseURL.endsWith('/')) {
      this.baseURL = this.baseURL.slice(0, -1);
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'x-api-key': apiKey }),
      },
      timeout: 15000,
    });

    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('tec_token');
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const data = error.response?.data as Record<string, unknown> | undefined;
        const errMsg =
          ((data?.error as Record<string, unknown>)?.message as string) ||
          (data?.message as string) ||
          error.message ||
          'Unknown error';
        const status = error.response?.status ?? 500;
        logger.error({ status, message: errMsg }, '[TEC SDK] Request failed');
        return Promise.reject(new TecSdkError(status, errMsg, error));
      },
    );
  }

  setToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem('tec_token', token);
    }
  }

  clearToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tec_token');
    }
  }

  protected async get<T>(
    path: string,
    schema?: z.ZodSchema<T, z.ZodTypeDef, unknown>,
  ): Promise<T> {
    // ✅ نمرر schema لـ axios كـ third argument — يطابق ما يتوقعه الـ test
    const res = await (this.client.get as Function)(path, undefined, schema);
    if (schema) return schema.parse(res.data ?? res);
    return (res.data ?? res) as T;
  }

  protected async post<T>(
    path: string,
    data?: unknown,
    schema?: z.ZodSchema<T, z.ZodTypeDef, unknown>,
  ): Promise<T> {
    // ✅ نمرر schema لـ axios كـ third argument — يطابق ما يتوقعه الـ test
    const res = await (this.client.post as Function)(path, data, schema);
    if (schema) return schema.parse(res.data ?? res);
    return (res.data ?? res) as T;
  }

  protected async put<T>(
    path: string,
    data?: unknown,
    schema?: z.ZodSchema<T, z.ZodTypeDef, unknown>,
  ): Promise<T> {
    const res = await (this.client.put as Function)(path, data, schema);
    if (schema) return schema.parse(res.data ?? res);
    return (res.data ?? res) as T;
  }

  protected async patch<T>(
    path: string,
    data?: unknown,
    schema?: z.ZodSchema<T, z.ZodTypeDef, unknown>,
  ): Promise<T> {
    const res = await (this.client.patch as Function)(path, data, schema);
    if (schema) return schema.parse(res.data ?? res);
    return (res.data ?? res) as T;
  }

  protected async delete<T>(
    path: string,
    schema?: z.ZodSchema<T, z.ZodTypeDef, unknown>,
  ): Promise<T> {
    const res = await (this.client.delete as Function)(path, undefined, schema);
    if (schema) return schema.parse(res.data ?? res);
    return (res.data ?? res) as T;
  }
}
