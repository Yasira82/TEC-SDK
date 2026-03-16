import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { z } from 'zod';

/**
 * BaseClient — Core SDK HTTP client
 */
export abstract class BaseClient {
  protected client: AxiosInstance;

  constructor(protected baseURL: string, protected apiKey: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      timeout: 10000,
    });

    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('tec_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

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

  protected async delete<T>(path: string, schema?: z.ZodSchema<T>): Promise<T> {
    const res = await this.client.delete(path);
    if (schema) return schema.parse(res.data);
    return res.data;
  }
}
