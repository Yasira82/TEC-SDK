import { AuthClient } from './api/authClient';
import { WalletClient } from './api/walletClient';
import { PaymentClient } from './api/paymentClient';
import { HealthClient } from './api/healthClient';
import { AssetClient } from './api/assetClient';
import { CommerceClient } from './api/commerceClient';
import { NotificationClient } from './api/notificationClient';

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
  public readonly commerce: CommerceClient;
  public readonly notifications: NotificationClient;

  constructor(config: TecSdkConfig) {
    const { gatewayUrl, apiKey } = config;
    this.auth          = new AuthClient(gatewayUrl, apiKey);
    this.wallet        = new WalletClient(gatewayUrl, apiKey);
    this.payment       = new PaymentClient(gatewayUrl, apiKey);
    this.health        = new HealthClient(gatewayUrl, apiKey);
    this.assets        = new AssetClient(gatewayUrl, apiKey);
    this.commerce      = new CommerceClient(gatewayUrl, apiKey);
    this.notifications = new NotificationClient(gatewayUrl, apiKey);
  }

  setAuthToken(token: string): void {
    this.wallet.setToken(token);
    this.payment.setToken(token);
    this.assets.setToken(token);
    this.commerce.setToken(token);
    this.notifications.setToken(token);
  }

  clearAuthToken(): void {
    this.auth.logout();
    this.wallet.clearToken();
    this.payment.clearToken();
    this.assets.clearToken();
    this.commerce.clearToken();
    this.notifications.clearToken();
  }
}

// ─── Exports ─────────────────────────────────────────────────
export * from './api/authClient';
export * from './api/walletClient';
export * from './api/paymentClient';
export * from './api/assetClient';
export * from './api/healthClient';
export * from './api/commerceClient';
export * from './api/notificationClient';
export { BaseClient, TecSdkError } from './api/baseClient';
export { logger, logInfo, logWarn, logError } from './utils/logger';
