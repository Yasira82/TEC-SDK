import { AuthClient } from './api/authClient';
import { WalletClient } from './api/walletClient';
import { PaymentClient } from './api/paymentClient';
import { HealthClient } from './api/healthClient';
import { AssetClient } from './api/assetClient';

export interface TecSdkConfig {
  gatewayUrl: string;
  apiKey?: string;
}

export class TecSdk {
  public readonly auth: AuthClient;
  public readonly wallet: WalletClient;
  public readonly payment: PaymentClient;
  public readonly health: HealthClient;
  public readonly assets: AssetClient;

  constructor(config: TecSdkConfig) {
    const { gatewayUrl, apiKey } = config;
    this.auth    = new AuthClient(gatewayUrl, apiKey);
    this.wallet  = new WalletClient(gatewayUrl, apiKey);
    this.payment = new PaymentClient(gatewayUrl, apiKey);
    this.health  = new HealthClient(gatewayUrl, apiKey);
    this.assets  = new AssetClient(gatewayUrl, apiKey);
  }

  // ✅ بعد الـ login، set token في كل الـ clients
  setAuthToken(token: string): void {
    this.wallet.setToken(token);
    this.payment.setToken(token);
    this.assets.setToken(token);
  }

  clearAuthToken(): void {
    this.auth.logout();
    this.wallet.clearToken();
    this.payment.clearToken();
    this.assets.clearToken();
  }
}

export * from './types';
export * from './api/authClient';
export * from './api/walletClient';
export * from './api/paymentClient';
export * from './api/assetClient';
export { logger, logInfo, logWarn, logError } from './utils/logger';
