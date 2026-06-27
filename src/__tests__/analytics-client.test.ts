import { AnalyticsClient } from '../api/analyticsClient';

const mockGet    = jest.fn();
const mockPost   = jest.fn();

const mockAxiosInstance = {
  get:    mockGet,
  post:   mockPost,
  put:    jest.fn(),
  patch:  jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request:  { use: jest.fn() },
    response: { use: jest.fn() },
  },
};

jest.mock('axios', () => ({
  create: jest.fn(() => mockAxiosInstance),
}));

let client: AnalyticsClient;

beforeEach(() => {
  jest.clearAllMocks();
  client = new AnalyticsClient('https://gw.test', 'api-key');
});

describe('AnalyticsClient.getOverview', () => {
  it('calls GET /api/analytics/overview and unwraps the envelope', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          totalEvents: 100, totalPayments: 30, totalUsers: 12,
          recentMetrics: [{ date: '2026-06-26', total_payments: 5, total_volume: 12.5 }],
        },
      },
    });
    const res = await client.getOverview();
    expect(mockGet).toHaveBeenCalledWith('/api/analytics/overview');
    expect(res.totalEvents).toBe(100);
    expect(res.recentMetrics).toHaveLength(1);
  });

  it('rejects a malformed overview (missing required field)', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: { totalEvents: 1 } } });
    await expect(client.getOverview()).rejects.toBeDefined();
  });
});

describe('AnalyticsClient.getPayments', () => {
  it('calls GET /api/analytics/payments and returns metrics + totals', async () => {
    mockGet.mockResolvedValueOnce({
      data: { success: true, data: {
        metrics: [{ date: '2026-06-26', total_payments: 3, total_volume: 9.9 }],
        totalVolume: 9.9, totalCount: 3,
      } },
    });
    const res = await client.getPayments();
    expect(mockGet).toHaveBeenCalledWith('/api/analytics/payments');
    expect(res.totalCount).toBe(3);
    expect(res.totalVolume).toBeCloseTo(9.9);
  });
});

describe('AnalyticsClient.getUsers', () => {
  it('calls GET /api/analytics/users', async () => {
    mockGet.mockResolvedValueOnce({
      data: { success: true, data: { metrics: [
        { date: '2026-06-26', new_users: 4, active_users: 10, kyc_submitted: 2, kyc_verified: 1 },
      ] } },
    });
    const res = await client.getUsers();
    expect(mockGet).toHaveBeenCalledWith('/api/analytics/users');
    expect(res.metrics[0]?.new_users).toBe(4);
  });
});

describe('AnalyticsClient.getEvents', () => {
  it('calls GET /api/analytics/events with default limit 20', async () => {
    mockGet.mockResolvedValueOnce({
      data: { success: true, data: [
        { id: 'ev1', type: 'payment.completed', created_at: '2026-06-26T00:00:00Z', user_id: 'u1', payload: {} },
      ] },
    });
    const res = await client.getEvents();
    expect(mockGet).toHaveBeenCalledWith('/api/analytics/events?limit=20');
    expect(res).toHaveLength(1);
    expect(res[0]?.type).toBe('payment.completed');
  });

  it('passes a custom limit', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: [] } });
    await client.getEvents(5);
    expect(mockGet).toHaveBeenCalledWith('/api/analytics/events?limit=5');
  });
});
