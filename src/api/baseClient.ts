import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
} from 'axios';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { TokenStore, createTokenStore } from '../core/token-store';

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
  protected readonly tokens: TokenStore;

  constructor(
    protected baseURL: string,
    protected apiKey?: string,
    tokenStore?: TokenStore,
  ) {
    if (this.baseURL.endsWith('/')) {
      this.baseURL = this.baseURL.slice(0, -1);
    }

    // Use injected store (for tests / SSR) or auto-detect
    this.tokens = tokenStore ?? createTokenStore();

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'x-api-key': apiKey }),
      },
      timeout: 15000,
    });

    // ─── Request interceptor — attach Bearer token ────────────
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.tokens.get('tec_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
    );

    // ─── Response interceptor — normalise errors ──────────────
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

  // ─── Token helpers ────────────────────────────────────────────
  setToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    this.tokens.set('tec_token', token);
  }

  clearToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
    this.tokens.remove('tec_token');
  }

  // ─── HTTP methods ─────────────────────────────────────────────
  protected async get<T>(path: string): Promise<T>;
  protected async get<T>(
    path: string,
    schema: z.ZodSchema<T, z.ZodTypeDef, unknown>,
  ): Promise<T>;
  protected async get<T>(
    path: string,
    schema?: z.ZodSchema<T, z.ZodTypeDef, unknown>,
  ): Promise<T> {
    const res = await this.client.get<T>(path);
    return schema ? schema.parse(res.data) : res.data;
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
    const res = await this.client.post<T>(path, data);
    return schema ? schema.parse(res.data) : res.data;
  }

  protected async put<T>(
    path: string,
    data?: unknown,
    schema?: z.ZodSchema<T, z.ZodTypeDef, unknown>,
  ): Promise<T> {
    const res = await this.client.put<T>(path, data);
    return schema ? schema.parse(res.data) : res.data;
  }

  protected async patch<T>(
    path: string,
    data?: unknown,
    schema?: z.ZodSchema<T, z.ZodTypeDef, unknown>,
  ): Promise<T> {
    const res = await this.client.patch<T>(path, data);
    return schema ? schema.parse(res.data) : res.data;
  }

  protected async delete<T>(
    path: string,
    schema?: z.ZodSchema<T, z.ZodTypeDef, unknown>,
  ): Promise<T> {
    const res = await this.client.delete<T>(path);
    return schema ? schema.parse(res.data) : res.data;
  }
    }
