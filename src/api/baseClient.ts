import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { z } from 'zod';

export abstract class BaseClient {
  protected client: AxiosInstance;

  constructor(protected baseURL: string, protected apiKey?: string) {
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

    // ✅ Auto-inject token
    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('tec_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    // ✅ Centralized error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const data = error.response?.data as any;
        const errMsg =
          data?.error?.message ||
          data?.message ||
          error.message;
        const status = error.response?.status || 500;
        console.error(`[TEC SDK] ${status} — ${errMsg}`);
        return Promise.reject({ status, message: errMsg, original: error });
      }
    );
  }

  // ✅ setToken — بيشتغل server-side كمان
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

  // ✅ methods محدثة — schema آخر param دايمًا
  protected async get<T>(path: string, schema?: z.ZodSchema<T>): Promise<T> {
    const res = await this.client.get(path);
    if (schema) return schema.parse(res.data);
    return res.data;
  }

  protected async post<T>(path: string, data?: unknown, schema?: z.ZodSchema<T>): Promise<T> {
    const res = await this.client.post(path, data);
    if (schema) return schema.parse(res.data);
    return res.data;
  }

  protected async put<T>(path: string, data?: unknown, schema?: z.ZodSchema<T>): Promise<T> {
    const res = await this.client.put(path, data);
    if (schema) return schema.parse(res.data);
    return res.data;
  }

  protected async patch<T>(path: string, data?: unknown, schema?: z.ZodSchema<T>): Promise<T> {
    const res = await this.client.patch(path, data);
    if (schema) return schema.parse(res.data);
    return res.data;
  }

  protected async delete<T>(path: string, schema?: z.ZodSchema<T>): Promise<T> {
    const res = await this.client.delete(path);
    if (schema) return schema.parse(res.data);
    return res.data;
  }
  }
