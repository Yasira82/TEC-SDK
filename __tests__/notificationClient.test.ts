import axios from 'axios';
import { NotificationClient } from '../src/api/notificationClient';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const BASE_URL = 'https://api-gateway-production-6a68.up.railway.app';

const mockAxiosInstance = {
  get:       jest.fn(),
  post:      jest.fn(),
  put:       jest.fn(),
  patch:     jest.fn(),
  delete:    jest.fn(),
  defaults:  { headers: { common: {} } },
  interceptors: {
    request:  { use: jest.fn() },
    response: { use: jest.fn() },
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockedAxios.create.mockReturnValue(mockAxiosInstance as never);
});

// ── Mock data ──────────────────────────────────────────────
const MOCK_NOTIFICATION = {
  id:        'notif-1',
  userId:    'user-uuid',
  title:     'Payment received',
  body:      'You received 5π',
  type:      'payment',
  isRead:    false,
  createdAt: '2026-05-01T10:00:00.000Z',
};

const MOCK_PREFERENCES = {
  userId:          'user-uuid',
  pushEnabled:     true,
  emailEnabled:    false,
  paymentAlerts:   true,
  orderAlerts:     true,
  promotionAlerts: false,
  securityAlerts:  true,
};

// ══════════════════════════════════════════════════════════
describe('NotificationClient', () => {
  let client: NotificationClient;

  beforeEach(() => {
    client = new NotificationClient(BASE_URL);
  });

  // ── getNotifications ──────────────────────────────────────
  describe('getNotifications', () => {
    it('returns notifications array', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: [MOCK_NOTIFICATION] });
      const result = await client.getNotifications('user-uuid');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('notif-1');
      expect(result[0].type).toBe('payment');
    });

    it('passes unreadOnly param', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: [] });
      await client.getNotifications('user-uuid', { unreadOnly: true });
      const url = mockAxiosInstance.get.mock.calls[0][0];
      expect(url).toContain('unreadOnly=true');
    });

    it('passes limit param', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: [] });
      await client.getNotifications('user-uuid', { limit: 10 });
      const url = mockAxiosInstance.get.mock.calls[0][0];
      expect(url).toContain('limit=10');
    });

    it('throws on invalid response schema', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: [{ invalid: 'data' }] });
      await expect(client.getNotifications('user-uuid')).rejects.toThrow();
    });
  });

  // ── getUnreadCount ────────────────────────────────────────
  describe('getUnreadCount', () => {
    it('returns unread count', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: { count: 5 } });
      const result = await client.getUnreadCount('user-uuid');
      expect(result).toBe(5);
    });

    it('returns 0 when no unread', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: { count: 0 } });
      const result = await client.getUnreadCount('user-uuid');
      expect(result).toBe(0);
    });

    it('calls correct endpoint', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: { count: 3 } });
      await client.getUnreadCount('user-uuid');
      expect(mockAxiosInstance.get.mock.calls[0][0]).toContain('unread-count');
    });
  });

  // ── markAsRead ────────────────────────────────────────────
  describe('markAsRead', () => {
    it('returns updated notification', async () => {
      const read = { ...MOCK_NOTIFICATION, isRead: true };
      mockAxiosInstance.post.mockResolvedValue({ data: read });
      const result = await client.markAsRead('notif-1');
      expect(result.isRead).toBe(true);
      expect(result.id).toBe('notif-1');
    });

    it('calls correct endpoint', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { ...MOCK_NOTIFICATION, isRead: true } });
      await client.markAsRead('notif-1');
      expect(mockAxiosInstance.post.mock.calls[0][0]).toContain('notif-1/read');
    });
  });

  // ── markAllAsRead ─────────────────────────────────────────
  describe('markAllAsRead', () => {
    it('returns updated count', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { updated: 5 } });
      const result = await client.markAllAsRead('user-uuid');
      expect(result.updated).toBe(5);
    });

    it('calls correct endpoint', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { updated: 0 } });
      await client.markAllAsRead('user-uuid');
      expect(mockAxiosInstance.post.mock.calls[0][0]).toContain('read-all');
    });
  });

  // ── getPreferences ────────────────────────────────────────
  describe('getPreferences', () => {
    it('returns preferences', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: MOCK_PREFERENCES });
      const result = await client.getPreferences('user-uuid');
      expect(result.pushEnabled).toBe(true);
      expect(result.emailEnabled).toBe(false);
      expect(result.paymentAlerts).toBe(true);
    });

    it('calls correct endpoint', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: MOCK_PREFERENCES });
      await client.getPreferences('user-uuid');
      expect(mockAxiosInstance.get.mock.calls[0][0]).toContain('preferences/user-uuid');
    });

    it('throws on invalid schema', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: { invalid: true } });
      await expect(client.getPreferences('user-uuid')).rejects.toThrow();
    });
  });

  // ── updatePreferences ─────────────────────────────────────
  describe('updatePreferences', () => {
    it('returns updated preferences', async () => {
      const updated = { ...MOCK_PREFERENCES, pushEnabled: false };
      mockAxiosInstance.patch.mockResolvedValue({ data: updated });
      const result = await client.updatePreferences('user-uuid', { pushEnabled: false });
      expect(result.pushEnabled).toBe(false);
    });

    it('calls correct endpoint', async () => {
      mockAxiosInstance.patch.mockResolvedValue({ data: MOCK_PREFERENCES });
      await client.updatePreferences('user-uuid', { emailEnabled: true });
      expect(mockAxiosInstance.patch.mock.calls[0][0]).toContain('preferences/user-uuid');
    });

    it('sends only changed fields', async () => {
      mockAxiosInstance.patch.mockResolvedValue({ data: MOCK_PREFERENCES });
      await client.updatePreferences('user-uuid', { promotionAlerts: true });
      const body = mockAxiosInstance.patch.mock.calls[0][1];
      expect(body).toEqual({ promotionAlerts: true });
    });
  });

  // ── registerPushToken ─────────────────────────────────────
  describe('registerPushToken', () => {
    it('returns success true', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { success: true } });
      const result = await client.registerPushToken('user-uuid', 'fcm-token-123', 'web');
      expect(result.success).toBe(true);
    });

    it('sends correct platform', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { success: true } });
      await client.registerPushToken('user-uuid', 'fcm-token-123', 'android');
      const body = mockAxiosInstance.post.mock.calls[0][1];
      expect(body.platform).toBe('android');
    });

    it('sends userId and token', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { success: true } });
      await client.registerPushToken('user-uuid', 'fcm-token-123', 'ios');
      const body = mockAxiosInstance.post.mock.calls[0][1];
      expect(body.userId).toBe('user-uuid');
      expect(body.token).toBe('fcm-token-123');
    });

    it('calls correct endpoint', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { success: true } });
      await client.registerPushToken('user-uuid', 'token', 'web');
      expect(mockAxiosInstance.post.mock.calls[0][0]).toContain('push/register');
    });
  });
});
