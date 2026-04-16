import { BaseClient, TecSdkError } from './baseClient';
import { TokenStore }               from '../core/token-store';
import { z }                        from 'zod';

export const ProductSchema = z.object({
  id:          z.string(),
  name:        z.string(),
  description: z.string().optional(),
  price:       z.number(),
  currency:    z.string().default('PI'),
  category:    z.string().optional(),
  stock:       z.number().optional(),
  isActive:    z.boolean().default(true),
  sellerId:    z.string(),
  metadata:    z.record(z.unknown()).optional(),
  createdAt:   z.string(),
  updatedAt:   z.string(),
});

export const OrderItemSchema = z.object({
  productId:  z.string(),
  quantity:   z.number().int().positive(),
  unitPrice:  z.number(),
  totalPrice: z.number(),
});

export const OrderSchema = z.object({
  id:          z.string(),
  userId:      z.string(),
  status:      z.enum(['pending','confirmed','processing','shipped','delivered','cancelled','refunded']),
  items:       z.array(OrderItemSchema),
  totalAmount: z.number(),
  currency:    z.string().default('PI'),
  paymentId:   z.string().nullable().optional(),
  metadata:    z.record(z.unknown()).optional(),
  createdAt:   z.string(),
  updatedAt:   z.string(),
});

export const SubscriptionSchema = z.object({
  id:        z.string(),
  userId:    z.string(),
  planId:    z.string(),
  planName:  z.string(),
  status:    z.enum(['active','cancelled','expired','paused']),
  price:     z.number(),
  currency:  z.string().default('PI'),
  interval:  z.enum(['monthly','yearly']),
  startDate: z.string(),
  endDate:   z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity:  z.number().int().positive(),
  })),
  metadata: z.record(z.unknown()).optional(),
});

export type Product        = z.infer<typeof ProductSchema>;
export type Order          = z.infer<typeof OrderSchema>;
export type OrderItem      = z.infer<typeof OrderItemSchema>;
export type Subscription   = z.infer<typeof SubscriptionSchema>;
export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;

export class CommerceClient extends BaseClient {
  constructor(baseURL: string, apiKey?: string, tokenStore?: TokenStore, timeout?: number) {
    super(baseURL, apiKey, tokenStore, timeout);
  }

  async getProducts(params?: { category?: string; page?: number; limit?: number }): Promise<Product[]> {
    return this.withRetry(async () => {
      const query = new URLSearchParams();
      if (params?.category) query.set('category', params.category);
      if (params?.page)     query.set('page',     String(params.page));
      if (params?.limit)    query.set('limit',    String(params.limit));
      const res = await this.get<unknown>(`/api/commerce/products?${query.toString()}`);
      return z.array(ProductSchema).parse(res);
    });
  }

  async getProductById(productId: string): Promise<Product> {
    return this.withRetry(async () => {
      const res = await this.get<unknown>(`/api/commerce/products/${encodeURIComponent(productId)}`);
      return ProductSchema.parse(res);
    });
  }

  async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    return this.withRetry(async () => {
      const res = await this.post<unknown>('/api/commerce/products', data);
      return ProductSchema.parse(res);
    });
  }

  async createOrder(data: CreateOrderDto): Promise<Order> {
    return this.withRetry(async () => {
      const parsed = CreateOrderSchema.parse(data);
      const res    = await this.post<unknown>('/api/commerce/orders', parsed);
      return OrderSchema.parse(res);
    });
  }

  async getOrder(orderId: string): Promise<Order> {
    return this.withRetry(async () => {
      const res = await this.get<unknown>(`/api/commerce/orders/${encodeURIComponent(orderId)}`);
      return OrderSchema.parse(res);
    });
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return this.withRetry(async () => {
      const res = await this.get<unknown>(`/api/commerce/orders/user/${encodeURIComponent(userId)}`);
      return z.array(OrderSchema).parse(res);
    });
  }

  async cancelOrder(orderId: string): Promise<Order> {
    return this.withRetry(async () => {
      const res = await this.post<unknown>(`/api/commerce/orders/${encodeURIComponent(orderId)}/cancel`, {});
      return OrderSchema.parse(res);
    });
  }

  async getSubscription(userId: string): Promise<Subscription | null> {
    return this.withRetry(async () => {
      try {
        const res = await this.get<unknown>(`/api/commerce/subscriptions/user/${encodeURIComponent(userId)}`);
        return SubscriptionSchema.parse(res);
      } catch (err: unknown) {
        if (err instanceof TecSdkError && err.status === 404) return null;
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404) return null;
        throw err;
      }
    });
  }

  async createSubscription(data: { planId: string; interval: 'monthly' | 'yearly' }): Promise<Subscription> {
    return this.withRetry(async () => {
      const res = await this.post<unknown>('/api/commerce/subscriptions', data);
      return SubscriptionSchema.parse(res);
    });
  }

  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    return this.withRetry(async () => {
      const res = await this.post<unknown>(`/api/commerce/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`, {});
      return SubscriptionSchema.parse(res);
    });
  }
}
