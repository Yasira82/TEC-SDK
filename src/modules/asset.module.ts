import { BaseClient } from '../api/baseClient';

export interface CreateAssetDto {
  transactionId: string;
  ownerId: string;
  category: string;
  metadata?: Record<string, any>;
}

export interface Asset {
  id: string;
  transactionId: string;
  ownerId: string;
  category: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export class AssetsModule extends BaseClient {
  constructor(baseURL: string, apiKey?: string) {
    super(baseURL, apiKey);
  }

  /** Health check for Asset Service */
  async getHealth(): Promise<{ status: string }> {
    return this.request<{ status: string }>('assets', '/health', 'GET');
  }

  /** Fetch all assets of a user */
  async getMyAssets(userId: string): Promise<Asset[]> {
    return this.request<Asset[]>('assets', `/user/${userId}`, 'GET');
  }

  /** Fetch a single asset by ID */
  async getAssetById(assetId: string): Promise<Asset> {
    return this.request<Asset>('assets', `/${assetId}`, 'GET');
  }

  /** Create a new asset */
  async createAsset(data: CreateAssetDto): Promise<Asset> {
    return this.request<Asset>('assets', '/', 'POST', data);
  }

  /** Update asset metadata */
  async updateAsset(assetId: string, metadata: Record<string, any>): Promise<Asset> {
    return this.request<Asset>('assets', `/${assetId}`, 'PUT', { metadata });
  }

  /** Delete an asset */
  async deleteAsset(assetId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('assets', `/${assetId}`, 'DELETE');
  }
}
