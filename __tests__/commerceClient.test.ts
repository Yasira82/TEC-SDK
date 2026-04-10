import { CommerceClient } from '../src/api/commerceClient';
import axios              from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockProduct = {
  id:        'prod-1',
  name:      'Pi Widget',
  price:     10,
  currency:  'PI',
  isActive:  true,
  sellerId:  'seller-1',
  createdAt: '2026-04-10T00:00:00Z',
  updatedAt: '2026-04-10T00:00:00Z',
};

const mockOrder = {
  id:          'order-1',
  userId:      'user-1',
  status:      'pending' as const,
  items:       [{ productId: 'prod-1', quantity: 2, unitPrice: 10, totalPrice: 20 }],
  totalAmount: 20,
  currency:    'PI',
  createdAt:   '2026-04-10T00:00:00Z',
  updatedAt:   '2026-04-10T00:00:00Z',
};

const mockSubscription = {
  id:        'sub-1',
  userId:    'user-1',
  planId:    'pro',
  planName:  'Pro',
  status:    'active' as const,
  price:     10,
  currency:  'PI',
  interval:  'monthly' as const,
  startDate: '2026-04-10T00:00:00Z',
  createdAt: '2026-04-10T00:00:00Z',
  updatedAt: '2026-04-10T00:00:00Z',
};

type ClientWithInternals = CommerceClient & {
  client: jest.Mocked<typeof axios>;
};

describe('CommerceClient', () => {
  const baseURL = 'https://api.tec.test';
  let client: ClientWithInternals;

  beforeEach(() => {
    mockedAxios.create.mockReturnThis();
    client = new CommerceClient(baseURL) as ClientWithInternals;
    client.client = mockedAxios;
    jest.clearAllMocks();
  });

  // ── getProducts ────────────────────────────────────────────
  describe('getProducts', () => {
    it('returns products list', async () => {
      mockedAxios.get.mockResolvedValue({ data: [mockProduct] });

      const result = await client.getProducts();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Pi Widget');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/commerce/products'),
      );
    });

    it('sends category filter in query', async () => {
      mockedAxios.get.mockResolvedValue({ data: [mockProduct] });

      await client.getProducts({ category: 'electronics', page: 1, limit: 10 });

      const url = mockedAxios.get.mock.calls[0][0] as string;
      expect(url).toContain('category=electronics');
      expect(url).toContain('page=1');
      expect(url).toContain('limit=10');
    });

    it('throws on malformed response', async () => {
      mockedAxios.get.mockResolvedValue({ data: [{ id: 'only-id' }] });

      await expect(client.getProducts()).rejects.toThrow();
    });
  });

  // ── getProductById ─────────────────────────────────────────
  describe('getProductById', () => {
    it('returns single product', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockProduct });

      const result = await client.getProductById('prod-1');

      expect(result.id).toBe('prod-1');
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/commerce/products/prod-1');
    });
  });

  // ── createOrder ────────────────────────────────────────────
  describe('createOrder', () => {
    it('creates order successfully', async () => {
      mockedAxios.post.mockResolvedValue({ data: mockOrder });

      const result = await client.createOrder({
        items: [{ productId: 'prod-1', quantity: 2 }],
      });

      expect(result.id).toBe('order-1');
      expect(result.status).toBe('pending');
      expect(result.totalAmount).toBe(20);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/commerce/orders',
        { items: [{ productId: 'prod-1', quantity: 2 }] },
      );
    });

    it('throws on invalid order data (Zod)', async () => {
      await expect(
        client.createOrder({ items: [{ productId: 'p', quantity: 0 }] })
      ).rejects.toThrow();
    });
  });

  // ── getOrder ───────────────────────────────────────────────
  describe('getOrder', () => {
    it('returns order by ID', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockOrder });

      const result = await client.getOrder('order-1');

      expect(result.id).toBe('order-1');
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/commerce/orders/order-1');
    });
  });

  // ── getUserOrders ──────────────────────────────────────────
  describe('getUserOrders', () => {
    it('returns orders for user', async () => {
      mockedAxios.get.mockResolvedValue({ data: [mockOrder] });

      const result = await client.getUserOrders('user-1');

      expect(result).toHaveLength(1);
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/commerce/orders/user/user-1');
    });

    it('returns empty array when user has no orders', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });

      const result = await client.getUserOrders('user-1');
      expect(result).toHaveLength(0);
    });
  });

  // ── cancelOrder ────────────────────────────────────────────
  describe('cancelOrder', () => {
    it('cancels order', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { ...mockOrder, status: 'cancelled' },
      });

      const result = await client.cancelOrder('order-1');

      expect(result.status).toBe('cancelled');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/commerce/orders/order-1/cancel',
        {},
      );
    });
  });

  // ── getSubscription ────────────────────────────────────────
  describe('getSubscription', () => {
    it('returns subscription when exists', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockSubscription });

      const result = await client.getSubscription('user-1');

      expect(result?.planId).toBe('pro');
      expect(result?.status).toBe('active');
    });

    it('returns null when subscription not found', async () => {
      mockedAxios.get.mockRejectedValue({ response: { status: 404 } });

      const result = await client.getSubscription('user-1');
      expect(result).toBeNull();
    });
  });

  // ── createSubscription ─────────────────────────────────────
  describe('createSubscription', () => {
    it('creates subscription', async () => {
      mockedAxios.post.mockResolvedValue({ data: mockSubscription });

      const result = await client.createSubscription({
        planId:   'pro',
        interval: 'monthly',
      });

      expect(result.planId).toBe('pro');
      expect(result.interval).toBe('monthly');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/commerce/subscriptions',
        { planId: 'pro', interval: 'monthly' },
      );
    });
  });

  // ── cancelSubscription ─────────────────────────────────────
  describe('cancelSubscription', () => {
    it('cancels subscription', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { ...mockSubscription, status: 'cancelled' },
      });

      const result = await client.cancelSubscription('sub-1');

      expect(result.status).toBe('cancelled');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/commerce/subscriptions/sub-1/cancel',
        {},
      );
    });
  });

  // ── withRetry ──────────────────────────────────────────────
  describe('withRetry', () => {
    it('retries on 500 error', async () => {
      mockedAxios.get
        .mockRejectedValueOnce({ response: { status: 500 }, message: 'Server Error' })
        .mockResolvedValueOnce({ data: [mockProduct] });

      const result = await client.getProducts();

      expect(result).toHaveLength(1);
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });
  });
});
