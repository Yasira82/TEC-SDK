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

// ✅ بدل Function — نعرّف type صريح
type AxiosCallWithSchema = (
  path: string,
  dataOrSchema?: unknown,
  schema?: unknown,
) => Promise<{ data: unknown }>;

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

  protected async get<T>(path: string): Promise<T>;
  protected async get<T>(
    path: string,
    schema: z.ZodSchema<T, z.ZodTypeDef, unknown>,
  ): Promise<T>;
  protected async get<T>(
    path: string,
    schema?: z.ZodSchema<T, z.ZodTypeDef, unknown>,
  ): Promise<T> {
    if (schema) {
      const caller = this.client.get as unknown as AxiosCallWithSchema;
      const res = await caller(path, schema);
      return schema.parse(res.data ?? res);
    }
    const res = await this.client.get<T>(path);
    return res.data;
  }

  protected async post<T>(path: string, data?: unknown): Promise<T>;
  protected async post<T>(
    path: string,
    data: unknown,
    schema: z.ZodSchema<T, z.ZodTypeDef, unknown>,
  ): Promise<T>;
  protected async post<T>(
    path: string,
    data?: unknown,
    schema?: z.ZodSchema<T, z.ZodTypeDef, unknown>,
  ): Promise<T> {
    if (schema) {
      const caller = this.client.post as unknown as AxiosCallWithSchema;
      const res = await caller(path, data, schema);
      return schema.parse(res.data ?? res);
    }
    const res = await this.client.post<T>(path, data);
    return res.data;
  }

  protected async put<T>(
    path: string,
    data?: unknown,
    schema?: z.ZodSchema<T, z.ZodTypeDef, unknown>,
  ): Promise<T> {
    if (schema) {
      const caller = this.client.put as unknown as AxiosCallWithSchema;
      const res = await caller(path, data, schema);
      return schema.parse(res.data ?? res);
    }
    const res = await this.client.put<T>(path, data);
    return res.data;
  }

  protected async patch<T>(
    path: string,
    data?: unknown,
    schema?: z.ZodSchema<T, z.ZodTypeDef, unknown>,
  ): Promise<T> {
    if (schema) {
      const caller = this.client.patch as unknown as AxiosCallWithSchema;
      const res = await caller(path, data, schema);
      return schema.parse(res.data ?? res);
    }
    const res = await this.client.patch<T>(path, data);
    return res.data;
  }

  protected async delete<T>(
    path: string,
    schema?: z.ZodSchema<T, z.ZodTypeDef, unknown>,
  ): Promise<T> {
    if (schema) {
      const caller = this.client.delete as unknown as AxiosCallWithSchema;
      const res = await caller(path, schema);
      return schema.parse(res.data ?? res);
    }
    const res = await this.client.delete<T>(path);
    return res.data;
  }
  }
