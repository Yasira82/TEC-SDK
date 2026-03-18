import { BaseClient } from './baseClient';
import { z } from 'zod';

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

// ✅ اسم الـ class اتغير لـ AssetClient
export class AssetClient extends BaseClient {
  constructor(baseURL: string, apiKey?: string) {
    super(baseURL, apiKey);
  }

  async getHealth(): Promise<{ status: string }> {
    return this.get('/api/assets/health');
  }

  async getMyAssets(userId: string): Promise<Asset[]> {
    const res = await this.get<any>(`/api/assets/user/${userId}`);
    return z.array(AssetSchema).parse(res?.data ?? res);
  }

  async getAssetById(assetId: string): Promise<Asset> {
    const res = await this.get<any>(`/api/assets/${assetId}`);
    return AssetSchema.parse(res?.data ?? res);
  }

  async createAsset(data: CreateAssetDto): Promise<Asset> {
    const parsed = CreateAssetSchema.parse(data);
    const res = await this.post<any>('/api/assets', parsed);
    return AssetSchema.parse(res?.data ?? res);
  }

  async updateAsset(assetId: string, metadata: Record<string, any>): Promise<Asset> {
    const res = await this.put<any>(`/api/assets/${assetId}`, { metadata });
    return AssetSchema.parse(res?.data ?? res);
  }

  async deleteAsset(assetId: string): Promise<{ success: boolean }> {
    const res = await this.delete<any>(`/api/assets/${assetId}`);
    return z.object({ success: z.boolean() }).parse(res?.data ?? res);
  }
      }
