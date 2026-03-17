import axios, { AxiosInstance, Method } from 'axios';

export class TECHttpClient {
  private client: AxiosInstance;

  constructor(baseURL: string = process.env.TEC_GATEWAY_URL || 'https://api-gateway-production-6a68.up.railway.app/api') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async request(
    service: string,
    endpoint: string,
    method: Method = 'GET',
    data?: any,
    headers?: Record<string, string>
  ) {
    try {
      const response = await this.client.request({
        url: `/${service}${endpoint}`,
        method,
        data,
        headers,
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.error(`[TEC-SDK Error] ${service} Service:`, error.response.data);
      } else {
        console.error(`[TEC-SDK Error] ${service} Service:`, error.message);
      }
      throw error;
    }
  }
}
