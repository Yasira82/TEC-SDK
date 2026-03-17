import { TECHttpClient } from '../core/http-client';

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

export class AssetsModule {
  constructor(private httpClient: TECHttpClient) {}

  /** Health check for Asset Service */
  async getHealth(): Promise<{ status: string }> {
    return this.httpClient.request('assets', '/health', 'GET');
  }

  /** Fetch all assets of a user */
  async getMyAssets(userId: string): Promise<Asset[]> {
    return this.httpClient.request('assets', `/user/${userId}`, 'GET');
  }

  /** Fetch a single asset by ID */
  async getAssetById(assetId: string): Promise<Asset> {
    return this.httpClient.request('assets', `/${assetId}`, 'GET');
  }

  /** Create a new asset */
  async createAsset(data: CreateAssetDto): Promise<Asset> {
    return this.httpClient.request('assets', '/', 'POST', data);
  }

  /** Update asset metadata */
  async updateAsset(assetId: string, metadata: Record<string, any>): Promise<Asset> {
    return this.httpClient.request('assets', `/${assetId}`, 'PUT', { metadata });
  }

  /** Delete an asset */
  async deleteAsset(assetId: string): Promise<{ success: boolean }> {
    return this.httpClient.request('assets', `/${assetId}`, 'DELETE');
  }
}
