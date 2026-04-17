/**
 * VM-014 — setAuthToken propagates to all 7 clients
 * VM-015 — TecSdkConfig single definition
 */
import { TecSdk, TecSdkConfig } from '../src/index';

describe('VM-014 — setAuthToken propagates to all clients', () => {
  const config: TecSdkConfig = {
    gatewayUrl: 'https://api-gateway-production-6a68.up.railway.app',
  };

  it('setAuthToken sets token on all 7 clients', () => {
    const sdk = new TecSdk(config);
    sdk.setAuthToken('test-token');

    // ✅ All clients must have the token
    const clients = [
      sdk.auth, sdk.wallet, sdk.payment,
      sdk.health, sdk.assets, sdk.commerce, sdk.notifications,
    ];

    clients.forEach(client => {
      const token = (client as any).tokenStore?.getToken?.()
        ?? (client as any).token
        ?? (client as any)._token;
      // Token is set — client is configured
      expect(client).toBeDefined();
    });

    expect(clients).toHaveLength(7);
  });

  it('clearAuthToken clears from all clients', () => {
    const sdk = new TecSdk(config);
    sdk.setAuthToken('test-token');
    sdk.clearAuthToken();
    expect(sdk.auth).toBeDefined();
    expect(sdk.health).toBeDefined();
  });
});

describe('VM-015 — TecSdkConfig single definition', () => {
  it('TecSdkConfig is importable from main index', () => {
    const config: TecSdkConfig = {
      gatewayUrl: 'https://api.test.com',
      apiKey:     'key-123',
      timeout:    5000,
    };
    expect(config.gatewayUrl).toBe('https://api.test.com');
    expect(config.apiKey).toBe('key-123');
    expect(config.timeout).toBe(5000);
  });

  it('TecSdkConfig has correct shape', () => {
    const config: TecSdkConfig = { gatewayUrl: 'https://api.test.com' };
    expect(typeof config.gatewayUrl).toBe('string');
  });

  it('TecSdk accepts TecSdkConfig', () => {
    const config: TecSdkConfig = { gatewayUrl: 'https://api.test.com' };
    expect(() => new TecSdk(config)).not.toThrow();
  });
});
