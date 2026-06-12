import { WalletClient } from '../api/walletClient';

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

function makeTx(overrides?: object) {
  return {
    transactionId: 'txn-001',
    userId:        'user-123',
    amount:        1.5,
    currency:      'PI',
    type:          'credit',
    status:        'completed',
    createdAt:     NOW,
    updatedAt:     NOW,
    ...overrides,
  };
}

let client: WalletClient;

beforeEach(() => {
  jest.clearAllMocks();
  client = new WalletClient('https://gw.test', 'api-key');
});

describe('WalletClient.getBalance', () => {
  it('calls GET /wallets/:userId/balance', async () => {
    mockGet.mockResolvedValueOnce({ data: { userId: 'user-123', balance: 42.5, currency: 'PI' } });
    const result = await client.getBalance('user-123');
    expect(mockGet).toHaveBeenCalledWith('/wallets/user-123/balance');
    expect(result.balance).toBe(42.5);
    expect(result.currency).toBe('PI');
  });

  it('URL-encodes userId with special chars', async () => {
    mockGet.mockResolvedValueOnce({ data: { userId: 'user@pi', balance: 0, currency: 'PI' } });
    await client.getBalance('user@pi');
    expect(mockGet).toHaveBeenCalledWith('/wallets/user%40pi/balance');
  });
});

describe('WalletClient.creditWallet', () => {
  it('calls POST /wallets/:userId/credit with correct payload', async () => {
    mockPost.mockResolvedValueOnce({ data: makeTx({ type: 'credit' }) });
    const result = await client.creditWallet('user-123', 1.5, 'ref-001');
    expect(mockPost).toHaveBeenCalledWith(
      '/wallets/user-123/credit',
      { amount: 1.5, referenceId: 'ref-001' },
    );
    expect(result.transactionId).toBe('txn-001');
    expect(result.amount).toBe(1.5);
  });

  it('parses createdAt string to Date', async () => {
    mockPost.mockResolvedValueOnce({ data: makeTx() });
    const result = await client.creditWallet('u', 1, 'r');
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it('handles null createdAt', async () => {
    mockPost.mockResolvedValueOnce({ data: makeTx({ createdAt: null }) });
    const result = await client.creditWallet('u', 1, 'r');
    expect(result.createdAt).toBeNull();
  });
});

describe('WalletClient.debitWallet', () => {
  it('calls POST /wallets/:userId/debit', async () => {
    mockPost.mockResolvedValueOnce({ data: makeTx({ type: 'debit' }) });
    const result = await client.debitWallet('user-123', 0.5, 'ref-002');
    expect(mockPost).toHaveBeenCalledWith(
      '/wallets/user-123/debit',
      { amount: 0.5, referenceId: 'ref-002' },
    );
    expect(result.transactionId).toBe('txn-001');
  });
});

describe('WalletClient.getTransactions', () => {
  it('calls GET /wallets/:userId/transactions', async () => {
    mockGet.mockResolvedValueOnce({ data: [makeTx(), makeTx({ transactionId: 'txn-002' })] });
    const result = await client.getTransactions('user-123');
    expect(mockGet).toHaveBeenCalledWith('/wallets/user-123/transactions');
    expect(result).toHaveLength(2);
  });

  it('returns empty array when no transactions', async () => {
    mockGet.mockResolvedValueOnce({ data: [] });
    const result = await client.getTransactions('user-123');
    expect(result).toEqual([]);
  });
});
