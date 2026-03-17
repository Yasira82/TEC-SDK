import { BaseClient } from '../api/baseClient';
import { z } from 'zod';

/** DTOs & Types */
export const CreateAssetSchema = z.object({
  transactionId: z.string(),
  ownerId: z.string(),
  category: z.string(),
  metadata: z.record(z.any()).optional(),
});

export type CreateAssetDto = z.infer<typeof CreateAssetSchema>;

export const AssetSchema = z.object({
  id: z.string(),
  transactionId: z.string(),
  ownerId: z.string(),
  category: z.string(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Asset = z.infer<typeof AssetSchema>;

/** AssetsModule */
export class AssetsModule extends BaseClient {
  constructor(baseURL: string, apiKey?: string) {
    super(baseURL, apiKey || '');
  }

  /** Health check for Asset Service */
  async getHealth(): Promise<{ status: string }> {
    return this.request<{ status: string }>('assets', '/health', 'GET');
  }

  /** Fetch all assets of a user */
  async getMyAssets(userId: string): Promise<Asset[]> {
    const res = await this.request<unknown>('assets', `/user/${userId}`, 'GET');
    return z.array(AssetSchema).parse(res);
  }

  /** Fetch a single asset by ID */
  async getAssetById(assetId: string): Promise<Asset> {
    const res = await this.request<unknown>('assets', `/${assetId}`, 'GET');
    return AssetSchema.parse(res);
  }

  /** Create a new asset */
  async createAsset(data: CreateAssetDto): Promise<Asset> {
    const parsed = CreateAssetSchema.parse(data);
    const res = await this.request<unknown>('assets', '/', 'POST', parsed);
    return AssetSchema.parse(res);
  }

  /** Update asset metadata */
  async updateAsset(assetId: string, metadata: Record<string, any>): Promise<Asset> {
    const res = await this.request<unknown>('assets', `/${assetId}`, 'PUT', { metadata });
    return AssetSchema.parse(res);
  }

  /** Delete an asset */
  async deleteAsset(assetId: string): Promise<{ success: boolean }> {
    const res = await this.request<unknown>('assets', `/${assetId}`, 'DELETE');
    return z.object({ success: z.boolean() }).parse(res);
  }
}
