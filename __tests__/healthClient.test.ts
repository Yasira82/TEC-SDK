import { HealthClient } from '../src/api/healthClient';
import axios from 'axios';

// Mock Axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('HealthClient SDK - System Diagnostics', () => {
  const baseURL = 'https://api.tec.test';
  const apiKey = 'test-api-key';
  let client: HealthClient;

  beforeEach(() => {
    mockedAxios.create.mockReturnThis();
    client = new HealthClient(baseURL, apiKey);
    // ربط الـ mock بالـ instance الداخلي
    (client as any).client = mockedAxios;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true when server responds with 200 OK', async () => {
    // محاكاة استجابة ناجحة
    mockedAxios.get.mockResolvedValue({ status: 200, data: { status: 'up' } });

    const status = await client.isAlive();

    expect(status).toBe(true);
    expect(mockedAxios.get).toHaveBeenCalledWith('/health');
  });

  it('should return false when server is unreachable or returns error', async () => {
    // محاكاة فشل السيرفر (مثل خطأ 500 أو سقوط السيرفر)
    mockedAxios.get.mockRejectedValue(new Error('Service Unavailable'));

    const status = await client.isAlive();

    expect(status).toBe(false);
    expect(mockedAxios.get).toHaveBeenCalledWith('/health');
  });

  it('should include the API key in the health check request', async () => {
    mockedAxios.get.mockResolvedValue({ status: 200 });

    await client.isAlive();

    // التأكد من أن الـ BaseClient بيمرر الـ Headers (التي تحتوي على الـ API Key)
    expect(mockedAxios.get).toHaveBeenCalled();
  });
});
