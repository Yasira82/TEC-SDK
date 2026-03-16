import { WalletClient, WalletBalanceSchema, WalletTransactionSchema } from '../src/api/walletClient';
import axios from 'axios';

// Mock Axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WalletClient SDK - Comprehensive Tests', () => {
  const baseURL = 'https://api.tec.test';
  const apiKey = 'test-api-key';
  let client: WalletClient;

  beforeEach(() => {
    mockedAxios.create.mockReturnThis();
    client = new WalletClient(baseURL, apiKey);
    (client as any).client = mockedAxios;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch wallet balance correctly', async () => {
    const mockBalance = { userId: 'user123', balance: 1000, currency: 'PI' };
    mockedAxios.get.mockResolvedValue({ data: mockBalance });

    const balance = await client.getBalance('user123');

    expect(balance.balance).toBe(1000);
    expect(balance.userId).toBe('user123');
    expect(mockedAxios.get).toHaveBeenCalledWith('/wallets/user123/balance');
  });

  it('should credit wallet and transform dates correctly', async () => {
    const rawResponse = {
      transactionId: 'tx123',
      userId: 'user123',
      amount: 500,
      currency: 'PI',
      status: 'completed',
      createdAt: '2026-03-16T00:00:00Z',
      updatedAt: '2026-03-16T00:00:00Z',
    };
    mockedAxios.post.mockResolvedValue({ data: rawResponse });

    const result = await client.creditWallet('user123', 500, 'ref123');

    expect(result.amount).toBe(500);
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(mockedAxios.post).toHaveBeenCalledWith('/wallets/user123/credit', { amount: 500, referenceId: 'ref123' });
  });

  it('should debit wallet and transform dates correctly', async () => {
    const rawResponse = {
      transactionId: 'tx456',
      userId: 'user123',
      amount: 200,
      currency: 'PI',
      status: 'completed',
      createdAt: '2026-03-16T01:00:00Z',
      updatedAt: '2026-03-16T01:00:00Z',
    };
    mockedAxios.post.mockResolvedValue({ data: rawResponse });

    const result = await client.debitWallet('user123', 200, 'ref456');

    expect(result.amount).toBe(200);
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(mockedAxios.post).toHaveBeenCalledWith('/wallets/user123/debit', { amount: 200, referenceId: 'ref456' });
  });

  it('should fetch transaction history and validate array schema', async () => {
    const mockResponse = [
      {
        transactionId: 'tx123',
        userId: 'user123',
        amount: 500,
        currency: 'PI',
        status: 'completed',
        createdAt: '2026-03-16T00:00:00Z',
        updatedAt: '2026-03-16T00:00:00Z',
      },
    ];
    mockedAxios.get.mockResolvedValue({ data: mockResponse });

    const transactions = await client.getTransactions('user123');

    expect(Array.isArray(transactions)).toBe(true);
    expect(transactions[0].createdAt).toBeInstanceOf(Date);
    expect(mockedAxios.get).toHaveBeenCalledWith('/wallets/user123/transactions');
  });

  it('should retry on transient errors (safeRequest)', async () => {
    const rawResponse = {
      transactionId: 'tx789',
      userId: 'user123',
      amount: 300,
      currency: 'PI',
      status: 'completed',
      createdAt: '2026-03-16T02:00:00Z',
      updatedAt: '2026-03-16T02:00:00Z',
    };

    // أول محاولة تفشل، الثانية تنجح
    mockedAxios.post
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockResolvedValueOnce({ data: rawResponse });

    const result = await client.creditWallet('user123', 300, 'ref789');

    expect(result.amount).toBe(300);
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
  });
});
