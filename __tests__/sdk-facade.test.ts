import { TecSdk, TecSdkConfig } from '../src/index';

// ── Mocks ──────────────────────────────────────────────────
jest.mock('../src/api/authClient', () => ({
  AuthClient: jest.fn().mockImplementation(() => ({
    setToken:   jest.fn(),
    clearToken: jest.fn(),
    logout:     jest.fn(),
  })),
}));

jest.mock('../src/api/walletClient', () => ({
  WalletClient: jest.fn().mockImplementation(() => ({
    setToken:   jest.fn(),
    clearToken: jest.fn(),
  })),
}));

jest.mock('../src/api/paymentClient', () => ({
  PaymentClient: jest.fn().mockImplementation(() => ({
    setToken:   jest.fn(),
    clearToken: jest.fn(),
  })),
}));

jest.mock('../src/api/healthClient', () => ({
  HealthClient: jest.fn().mockImplementation(() => ({
    setToken:   jest.fn(),
    clearToken: jest.fn(),
  })),
}));

jest.mock('../src/api/assetClient', () => ({
  AssetClient: jest.fn().mockImplementation(() => ({
    setToken:   jest.fn(),
    clearToken: jest.fn(),
  })),
}));

jest.mock('../src/api/commerceClient', () => ({
  CommerceClient: jest.fn().mockImplementation(() => ({
    setToken:   jest.fn(),
    clearToken: jest.fn(),
  })),
}));

jest.mock('../src/api/notificationClient', () => ({
  NotificationClient: jest.fn().mockImplementation(() => ({
    setToken:   jest.fn(),
    clearToken: jest.fn(),
  })),
}));

// ── Config ─────────────────────────────────────────────────
const CONFIG: TecSdkConfig = {
  gatewayUrl: 'https://api-gateway-production-6a68.up.railway.app',
  timeout:    15000,
};

// ══════════════════════════════════════════════════════════
describe('TecSdk — facade', () => {
  let sdk: TecSdk;

  beforeEach(() => {
    jest.clearAllMocks();
    sdk = new TecSdk(CONFIG);
  });

  // ── Initialization ────────────────────────────────────────
  describe('initialization', () => {
    it('creates all 7 clients', () => {
      expect(sdk.auth).toBeDefined();
      expect(sdk.wallet).toBeDefined();
      expect(sdk.payment).toBeDefined();
      expect(sdk.health).toBeDefined();
      expect(sdk.assets).toBeDefined();
      expect(sdk.commerce).toBeDefined();
      expect(sdk.notifications).toBeDefined();
    });

    it('accepts gatewayUrl config', () => {
      const customSdk = new TecSdk({ gatewayUrl: 'https://custom.api.com' });
      expect(customSdk).toBeInstanceOf(TecSdk);
    });

    it('accepts optional timeout config', () => {
      const customSdk = new TecSdk({ gatewayUrl: 'https://api.com', timeout: 5000 });
      expect(customSdk).toBeInstanceOf(TecSdk);
    });

    it('accepts optional apiKey config', () => {
      const customSdk = new TecSdk({ gatewayUrl: 'https://api.com', apiKey: 'my-key' });
      expect(customSdk).toBeInstanceOf(TecSdk);
    });
  });

  // ── setAuthToken ──────────────────────────────────────────
  describe('setAuthToken', () => {
    it('sets token on all 7 clients', () => {
      sdk.setAuthToken('test-token-123');

      expect(sdk.auth.setToken).toHaveBeenCalledWith('test-token-123');
      expect(sdk.health.setToken).toHaveBeenCalledWith('test-token-123');
      expect(sdk.wallet.setToken).toHaveBeenCalledWith('test-token-123');
      expect(sdk.payment.setToken).toHaveBeenCalledWith('test-token-123');
      expect(sdk.assets.setToken).toHaveBeenCalledWith('test-token-123');
      expect(sdk.commerce.setToken).toHaveBeenCalledWith('test-token-123');
      expect(sdk.notifications.setToken).toHaveBeenCalledWith('test-token-123');
    });

    it('sets token once per client', () => {
      sdk.setAuthToken('test-token-123');
      expect(sdk.auth.setToken).toHaveBeenCalledTimes(1);
      expect(sdk.wallet.setToken).toHaveBeenCalledTimes(1);
    });

    it('handles empty string token', () => {
      expect(() => sdk.setAuthToken('')).not.toThrow();
    });
  });

  // ── clearAuthToken ────────────────────────────────────────
  describe('clearAuthToken', () => {
    it('clears token on all 7 clients', () => {
      sdk.clearAuthToken();

      expect(sdk.auth.logout).toHaveBeenCalled();
      expect(sdk.health.clearToken).toHaveBeenCalled();
      expect(sdk.wallet.clearToken).toHaveBeenCalled();
      expect(sdk.payment.clearToken).toHaveBeenCalled();
      expect(sdk.assets.clearToken).toHaveBeenCalled();
      expect(sdk.commerce.clearToken).toHaveBeenCalled();
      expect(sdk.notifications.clearToken).toHaveBeenCalled();
    });

    it('clears token once per client', () => {
      sdk.clearAuthToken();
      expect(sdk.health.clearToken).toHaveBeenCalledTimes(1);
      expect(sdk.wallet.clearToken).toHaveBeenCalledTimes(1);
    });
  });

  // ── token lifecycle ───────────────────────────────────────
  describe('token lifecycle', () => {
    it('set then clear works without error', () => {
      expect(() => {
        sdk.setAuthToken('token-abc');
        sdk.clearAuthToken();
      }).not.toThrow();
    });

    it('multiple setAuthToken calls work', () => {
      sdk.setAuthToken('token-1');
      sdk.setAuthToken('token-2');
      expect(sdk.auth.setToken).toHaveBeenCalledTimes(2);
      expect(sdk.auth.setToken).toHaveBeenLastCalledWith('token-2');
    });
  });

  // ── TecSdkConfig ──────────────────────────────────────────
  describe('TecSdkConfig', () => {
    it('single config definition — no duplicate', () => {
      const config: TecSdkConfig = {
        gatewayUrl: 'https://api.com',
        apiKey:     'key-123',
        timeout:    10000,
      };
      expect(config.gatewayUrl).toBe('https://api.com');
      expect(config.apiKey).toBe('key-123');
      expect(config.timeout).toBe(10000);
    });

    it('apiKey is optional', () => {
      const config: TecSdkConfig = { gatewayUrl: 'https://api.com' };
      expect(config.apiKey).toBeUndefined();
    });

    it('timeout is optional', () => {
      const config: TecSdkConfig = { gatewayUrl: 'https://api.com' };
      expect(config.timeout).toBeUndefined();
    });
  });
});
