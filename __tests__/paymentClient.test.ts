import { PaymentClient, PaymentSchema } from '../src/api/paymentClient';
import axios from 'axios';
import { z } from 'zod';

// Mock Axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PaymentClient SDK - Comprehensive Tests', () => {
  const baseURL = 'https://api.tec.test';
  const apiKey = 'test-api-key';
  let client: PaymentClient;

  beforeEach(() => {
    mockedAxios.create.mockReturnThis();
    client = new PaymentClient(baseURL, apiKey);
    (client as any).client = mockedAxios;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a payment successfully', async () => {
    const rawPayment = {
      paymentId: 'pay123',
      userId: 'user123',
      amount: 100,
      currency: 'PI',
      status: 'created',
      piPaymentId: null,
      transactionId: null,
      createdAt: '2026-03-16T00:00:00Z',
      updatedAt: '2026-03-16T00:00:00Z',
      approvedAt: null,
      completedAt: null,
    };

    mockedAxios.post.mockResolvedValue({ data: rawPayment });

    const payment = await client.createPayment('user123', 100);

    expect(payment.paymentId).toBe('pay123');
    expect(payment.amount).toBe(100);
    expect(payment.createdAt).toBeInstanceOf(Date);
    expect(mockedAxios.post).toHaveBeenCalledWith('/payments', { userId: 'user123', amount: 100, currency: 'PI', metadata: undefined }, PaymentSchema);
  });

  it('should approve a payment successfully', async () => {
    const rawPayment = {
      paymentId: 'pay123',
      userId: 'user123',
      amount: 100,
      currency: 'PI',
      status: 'approved',
      piPaymentId: 'pi789',
      transactionId: null,
      createdAt: '2026-03-16T00:00:00Z',
      updatedAt: '2026-03-16T01:00:00Z',
      approvedAt: '2026-03-16T01:00:00Z',
      completedAt: null,
    };

    mockedAxios.post.mockResolvedValue({ data: rawPayment });

    const payment = await client.approvePayment('pay123');

    expect(payment.status).toBe('approved');
    expect(payment.approvedAt).toBeInstanceOf(Date);
    expect(mockedAxios.post).toHaveBeenCalledWith('/payments/pay123/approve', { metadata: undefined }, PaymentSchema);
  });

  it('should complete a payment successfully', async () => {
    const rawPayment = {
      paymentId: 'pay123',
      userId: 'user123',
      amount: 100,
      currency: 'PI',
      status: 'completed',
      piPaymentId: 'pi789',
      transactionId: 'tx123',
      createdAt: '2026-03-16T00:00:00Z',
      updatedAt: '2026-03-16T02:00:00Z',
      approvedAt: '2026-03-16T01:00:00Z',
      completedAt: '2026-03-16T02:00:00Z',
    };

    mockedAxios.post.mockResolvedValue({ data: rawPayment });

    const payment = await client.completePayment('pay123', 'tx123');

    expect(payment.status).toBe('completed');
    expect(payment.completedAt).toBeInstanceOf(Date);
    expect(mockedAxios.post).toHaveBeenCalledWith('/payments/pay123/complete', { transactionId: 'tx123', metadata: undefined }, PaymentSchema);
  });

  it('should fetch a payment by ID', async () => {
    const rawPayment = {
      paymentId: 'pay123',
      userId: 'user123',
      amount: 100,
      currency: 'PI',
      status: 'completed',
      piPaymentId: 'pi789',
      transactionId: 'tx123',
      createdAt: '2026-03-16T00:00:00Z',
      updatedAt: '2026-03-16T02:00:00Z',
      approvedAt: '2026-03-16T01:00:00Z',
      completedAt: '2026-03-16T02:00:00Z',
    };

    mockedAxios.get.mockResolvedValue({ data: rawPayment });

    const payment = await client.getPayment('pay123');

    expect(payment.paymentId).toBe('pay123');
    expect(payment.completedAt).toBeInstanceOf(Date);
    expect(mockedAxios.get).toHaveBeenCalledWith('/payments/pay123');
  });

  it('should list all payments for a user', async () => {
    const rawPayments = [
      {
        paymentId: 'pay123',
        userId: 'user123',
        amount: 100,
        currency: 'PI',
        status: 'completed',
        piPaymentId: 'pi789',
        transactionId: 'tx123',
        createdAt: '2026-03-16T00:00:00Z',
        updatedAt: '2026-03-16T02:00:00Z',
        approvedAt: '2026-03-16T01:00:00Z',
        completedAt: '2026-03-16T02:00:00Z',
      }
    ];

    mockedAxios.get.mockResolvedValue({ data: rawPayments });

    const payments = await client.listUserPayments('user123');

    expect(Array.isArray(payments)).toBe(true);
    expect(payments[0].completedAt).toBeInstanceOf(Date);
    expect(mockedAxios.get).toHaveBeenCalledWith('/payments/user/user123');
  });

  it('should retry on transient errors (safeRequest)', async () => {
    const rawPayment = {
      paymentId: 'pay999',
      userId: 'user999',
      amount: 500,
      currency: 'PI',
      status: 'completed',
      piPaymentId: 'pi999',
      transactionId: 'tx999',
      createdAt: '2026-03-16T03:00:00Z',
      updatedAt: '2026-03-16T03:00:00Z',
      approvedAt: null,
      completedAt: '2026-03-16T03:00:00Z',
    };

    // أول محاولة تفشل، الثانية تنجح
    mockedAxios.post
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockResolvedValueOnce({ data: rawPayment });

    const payment = await client.completePayment('pay999', 'tx999');

    expect(payment.paymentId).toBe('pay999');
    expect(payment.completedAt).toBeInstanceOf(Date);
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
  });
});
