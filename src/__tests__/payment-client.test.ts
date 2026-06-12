import { PaymentClient } from '../api/paymentClient';

const mockGet    = jest.fn();
const mockPost   = jest.fn();
const mockPut    = jest.fn();
const mockPatch  = jest.fn();
const mockDelete = jest.fn();

const mockAxiosInstance = {
  get:    mockGet,
  post:   mockPost,
  put:    mockPut,
  patch:  mockPatch,
  delete: mockDelete,
  interceptors: {
    request:  { use: jest.fn() },
    response: { use: jest.fn() },
  },
};

jest.mock('axios', () => ({
  create: jest.fn(() => mockAxiosInstance),
}));

const NOW = '2024-06-01T00:00:00.000Z';

function makePayment(overrides?: object) {
  return {
    paymentId:     'pay-123',
    userId:        'user-456',
    amount:        3.14159265,
    currency:      'PI',
    status:        'created',
    piPaymentId:   null,
    transactionId: null,
    metadata:      {},
    createdAt:     NOW,
    updatedAt:     NOW,
    ...overrides,
  };
}

let client: PaymentClient;

beforeEach(() => {
  jest.clearAllMocks();
  client = new PaymentClient('https://gw.test', 'api-key');
});

describe('PaymentClient.createPayment', () => {
  it('calls POST /payments with correct payload', async () => {
    const payload = makePayment();
    mockPost.mockResolvedValueOnce({ data: payload });

    const result = await client.createPayment('user-456', 3.14159265, 'PI', {});

    expect(mockPost).toHaveBeenCalledWith(
      '/payments',
      { userId: 'user-456', amount: 3.14159265, currency: 'PI', metadata: {} },
    );
    expect(result.paymentId).toBe('pay-123');
    expect(result.amount).toBe(3.14159265);
  });

  it('defaults currency to PI when not provided', async () => {
    mockPost.mockResolvedValueOnce({ data: makePayment() });
    await client.createPayment('user-456', 1);
    const call = mockPost.mock.calls[0] as unknown[];
    expect((call[1] as Record<string, unknown>).currency).toBe('PI');
  });

  it('parses createdAt string to Date', async () => {
    mockPost.mockResolvedValueOnce({ data: makePayment() });
    const result = await client.createPayment('u', 1);
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it('handles null createdAt', async () => {
    mockPost.mockResolvedValueOnce({ data: makePayment({ createdAt: null }) });
    const result = await client.createPayment('u', 1);
    expect(result.createdAt).toBeNull();
  });
});

describe('PaymentClient.approvePayment', () => {
  it('calls POST /payments/:id/approve', async () => {
    mockPost.mockResolvedValueOnce({ data: makePayment({ status: 'approved' }) });
    const result = await client.approvePayment('pay-123');
    expect(mockPost).toHaveBeenCalledWith(
      '/payments/pay-123/approve',
      { metadata: undefined },
    );
    expect(result.status).toBe('approved');
  });

  it('URL-encodes special characters in paymentId', async () => {
    mockPost.mockResolvedValueOnce({ data: makePayment() });
    await client.approvePayment('pay/with/slashes');
    expect(mockPost.mock.calls[0][0]).toBe('/payments/pay%2Fwith%2Fslashes/approve');
  });
});

describe('PaymentClient.completePayment', () => {
  it('calls POST /payments/:id/complete with transactionId', async () => {
    mockPost.mockResolvedValueOnce({ data: makePayment({ status: 'completed', transactionId: 'txn-789' }) });
    const result = await client.completePayment('pay-123', 'txn-789');
    expect(mockPost).toHaveBeenCalledWith(
      '/payments/pay-123/complete',
      { transactionId: 'txn-789', metadata: undefined },
    );
    expect(result.status).toBe('completed');
  });
});

describe('PaymentClient.cancelPayment', () => {
  it('calls POST /payments/:id/cancel', async () => {
    mockPost.mockResolvedValueOnce({ data: makePayment({ status: 'cancelled' }) });
    const result = await client.cancelPayment('pay-123');
    expect(mockPost).toHaveBeenCalledWith(
      '/payments/pay-123/cancel',
      {},
    );
    expect(result.status).toBe('cancelled');
  });
});

describe('PaymentClient.getPayment', () => {
  it('calls GET /payments/:id', async () => {
    mockGet.mockResolvedValueOnce({ data: makePayment() });
    const result = await client.getPayment('pay-123');
    expect(mockGet).toHaveBeenCalledWith('/payments/pay-123');
    expect(result.paymentId).toBe('pay-123');
  });
});

describe('PaymentClient.listUserPayments', () => {
  it('calls GET /payments/user/:userId', async () => {
    mockGet.mockResolvedValueOnce({ data: [makePayment()] });
    const result = await client.listUserPayments('user-456');
    expect(mockGet).toHaveBeenCalledWith('/payments/user/user-456');
    expect(result).toHaveLength(1);
    expect(result[0].userId).toBe('user-456');
  });

  it('returns empty array when no payments', async () => {
    mockGet.mockResolvedValueOnce({ data: [] });
    const result = await client.listUserPayments('user-456');
    expect(result).toEqual([]);
  });
});

describe('PaymentClient.resolveIncomplete', () => {
  it('calls POST /payments/resolve-incomplete', async () => {
    mockPost.mockResolvedValueOnce({ data: makePayment({ status: 'completed' }) });
    const result = await client.resolveIncomplete('pi-pay-999');
    expect(mockPost).toHaveBeenCalledWith(
      '/payments/resolve-incomplete',
      { piPaymentId: 'pi-pay-999' },
    );
    expect(result.status).toBe('completed');
  });
});
