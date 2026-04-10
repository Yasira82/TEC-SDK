import { BaseClient } from './baseClient';
import { z }          from 'zod';

export const CreateAssetSchema = z.object({
  transactionId: z.string(),
  ownerId:       z.string(),
  category:      z.string(),
  metadata:      z.record(z.unknown()).optional(),
});

export type CreateAssetDto = z.infer<typeof CreateAssetSchema>;

export const AssetSchema = z.object({
  id:            z.string(),
  transactionId: z.string(),
  ownerId:       z.string(),
  category:      z.string(),
  metadata:      z.record(z.unknown()).optional(),
  createdAt:     z.string(),
  updatedAt:     z.string(),
});

export type Asset = z.infer<typeof AssetSchema>;

export class AssetClient extends BaseClient {
  constructor(baseURL: string, apiKey?: string) {
    super(baseURL, apiKey);
  }

  async getHealth(): Promise<{ status: string }> {
    return this.withRetry(() => this.get('/api/assets/health'));
  }

  async getMyAssets(userId: string): Promise<Asset[]> {
    return this.withRetry(async () => {
      const res = await this.get<unknown>(`/api/assets/user/${userId}`);
      return z.array(AssetSchema).parse(res);
    });
  }

  async getAssetById(assetId: string): Promise<Asset> {
    return this.withRetry(async () => {
      const res = await this.get<unknown>(`/api/assets/${assetId}`);
      return AssetSchema.parse(res);
    });
  }

  async createAsset(data: CreateAssetDto): Promise<Asset> {
    return this.withRetry(async () => {
      const parsed = CreateAssetSchema.parse(data);
      const res    = await this.post<unknown>('/api/assets', parsed);
      return AssetSchema.parse(res);
    });
  }

  async updateAsset(assetId: string, metadata: Record<string, unknown>): Promise<Asset> {
    return this.withRetry(async () => {
      const res = await this.put<unknown>(`/api/assets/${assetId}`, { metadata });
      return AssetSchema.parse(res);
    });
  }

  async deleteAsset(assetId: string): Promise<{ success: boolean }> {
    return this.withRetry(async () => {
      const res = await this.delete<unknown>(`/api/assets/${assetId}`);
      return z.object({ success: z.boolean() }).parse(res);
    });
  }
}
