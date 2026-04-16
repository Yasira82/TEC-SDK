import { BaseClient } from './baseClient';
import { TokenStore } from '../core/token-store';
import { z }          from 'zod';

export const NotificationSchema = z.object({
  id:        z.string(),
  userId:    z.string(),
  title:     z.string(),
  body:      z.string(),
  type:      z.enum(['payment','wallet','order','system','promotion','security']),
  isRead:    z.boolean().default(false),
  data:      z.record(z.unknown()).optional(),
  createdAt: z.string(),
});

export const NotificationPreferencesSchema = z.object({
  userId:          z.string(),
  pushEnabled:     z.boolean(),
  emailEnabled:    z.boolean(),
  paymentAlerts:   z.boolean(),
  orderAlerts:     z.boolean(),
  promotionAlerts: z.boolean(),
  securityAlerts:  z.boolean(),
});

export type Notification            = z.infer<typeof NotificationSchema>;
export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;

export class NotificationClient extends BaseClient {
  constructor(baseURL: string, apiKey?: string, tokenStore?: TokenStore, timeout?: number) {
    super(baseURL, apiKey, tokenStore, timeout);
  }

  async getNotifications(userId: string, params?: { unreadOnly?: boolean; limit?: number }): Promise<Notification[]> {
    return this.withRetry(async () => {
      const query = new URLSearchParams();
      if (params?.unreadOnly) query.set('unreadOnly', 'true');
      if (params?.limit)      query.set('limit', String(params.limit));
      const res = await this.get<unknown>(`/api/notifications/user/${encodeURIComponent(userId)}?${query.toString()}`);
      return z.array(NotificationSchema).parse(res);
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.withRetry(async () => {
      const res = await this.get<unknown>(`/api/notifications/user/${encodeURIComponent(userId)}/unread-count`);
      return z.object({ count: z.number() }).parse(res).count;
    });
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    return this.withRetry(async () => {
      const res = await this.post<unknown>(`/api/notifications/${encodeURIComponent(notificationId)}/read`, {});
      return NotificationSchema.parse(res);
    });
  }

  async markAllAsRead(userId: string): Promise<{ updated: number }> {
    return this.withRetry(async () => {
      const res = await this.post<unknown>(`/api/notifications/user/${encodeURIComponent(userId)}/read-all`, {});
      return z.object({ updated: z.number() }).parse(res);
    });
  }

  async getPreferences(userId: string): Promise<NotificationPreferences> {
    return this.withRetry(async () => {
      const res = await this.get<unknown>(`/api/notifications/preferences/${encodeURIComponent(userId)}`);
      return NotificationPreferencesSchema.parse(res);
    });
  }

  async updatePreferences(userId: string, prefs: Partial<Omit<NotificationPreferences, 'userId'>>): Promise<NotificationPreferences> {
    return this.withRetry(async () => {
      const res = await this.patch<unknown>(`/api/notifications/preferences/${encodeURIComponent(userId)}`, prefs);
      return NotificationPreferencesSchema.parse(res);
    });
  }

  async registerPushToken(userId: string, token: string, platform: 'web' | 'android' | 'ios'): Promise<{ success: boolean }> {
    return this.withRetry(async () => {
      const res = await this.post<unknown>('/api/notifications/push/register', { userId, token, platform });
      return z.object({ success: z.boolean() }).parse(res);
    });
  }
  }
