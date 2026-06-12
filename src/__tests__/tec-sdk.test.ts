import { TecSdk } from '../index';
import { AuthClient }     from '../api/authClient';
import { WalletClient }   from '../api/walletClient';
import { PaymentClient }  from '../api/paymentClient';

const mockAxiosInstance = {
  get:    jest.fn(),
  post:   jest.fn(),
  put:    jest.fn(),
  patch:  jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request:  { use: jest.fn() },
    response: { use: jest.fn() },
  },
};

jest.mock('axios', () => ({
  create: jest.fn(() => mockAxiosInstance),
}));

describe('TecSdk', () => {
  let sdk: TecSdk;

  beforeEach(() => {
    jest.clearAllMocks();
    sdk = new TecSdk({ gatewayUrl: 'https://gw.test', apiKey: 'k' });
  });

  it('instantiates all sub-clients', () => {
    expect(sdk.auth).toBeDefined();
    expect(sdk.wallet).toBeDefined();
    expect(sdk.payment).toBeDefined();
    expect(sdk.health).toBeDefined();
    expect(sdk.assets).toBeDefined();
    expect(sdk.commerce).toBeDefined();
    expect(sdk.notifications).toBeDefined();
  });

  it('auth is an instance of AuthClient', () => {
    expect(sdk.auth).toBeInstanceOf(AuthClient);
  });

  it('wallet is an instance of WalletClient', () => {
    expect(sdk.wallet).toBeInstanceOf(WalletClient);
  });

  it('payment is an instance of PaymentClient', () => {
    expect(sdk.payment).toBeInstanceOf(PaymentClient);
  });

  describe('setAuthToken', () => {
    it('propagates token to all clients', () => {
      const setTokenSpy = jest.spyOn(sdk.auth,          'setToken');
      const walletSpy   = jest.spyOn(sdk.wallet,        'setToken');
      const paymentSpy  = jest.spyOn(sdk.payment,       'setToken');
      const healthSpy   = jest.spyOn(sdk.health,        'setToken');
      const assetsSpy   = jest.spyOn(sdk.assets,        'setToken');
      const commerceSpy = jest.spyOn(sdk.commerce,      'setToken');
      const notifSpy    = jest.spyOn(sdk.notifications, 'setToken');

      sdk.setAuthToken('test-token');

      expect(setTokenSpy).toHaveBeenCalledWith('test-token');
      expect(walletSpy).toHaveBeenCalledWith('test-token');
      expect(paymentSpy).toHaveBeenCalledWith('test-token');
      expect(healthSpy).toHaveBeenCalledWith('test-token');
      expect(assetsSpy).toHaveBeenCalledWith('test-token');
      expect(commerceSpy).toHaveBeenCalledWith('test-token');
      expect(notifSpy).toHaveBeenCalledWith('test-token');
    });
  });

  describe('clearAuthToken', () => {
    it('calls logout on auth and clearToken on other clients', () => {
      const logoutSpy   = jest.spyOn(sdk.auth,          'logout').mockImplementation(() => {});
      const walletSpy   = jest.spyOn(sdk.wallet,        'clearToken');
      const paymentSpy  = jest.spyOn(sdk.payment,       'clearToken');
      const healthSpy   = jest.spyOn(sdk.health,        'clearToken');
      const assetsSpy   = jest.spyOn(sdk.assets,        'clearToken');
      const commerceSpy = jest.spyOn(sdk.commerce,      'clearToken');
      const notifSpy    = jest.spyOn(sdk.notifications, 'clearToken');

      sdk.clearAuthToken();

      expect(logoutSpy).toHaveBeenCalledTimes(1);
      expect(walletSpy).toHaveBeenCalledTimes(1);
      expect(paymentSpy).toHaveBeenCalledTimes(1);
      expect(healthSpy).toHaveBeenCalledTimes(1);
      expect(assetsSpy).toHaveBeenCalledTimes(1);
      expect(commerceSpy).toHaveBeenCalledTimes(1);
      expect(notifSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('can be constructed without apiKey', () => {
    expect(() => new TecSdk({ gatewayUrl: 'https://gw.test' })).not.toThrow();
  });

  it('can be constructed with custom timeout', () => {
    expect(() => new TecSdk({ gatewayUrl: 'https://gw.test', timeout: 5000 })).not.toThrow();
  });
});
