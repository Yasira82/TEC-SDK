// src/index.ts

import { BaseClient } from './api/baseClient';
import { AuthClient } from './api/authClient';
import { WalletClient } from './api/walletClient';
import { PaymentClient } from './api/paymentClient';
import { HealthClient } from './api/healthClient';
import { AssetsModule } from './modules/asset.module';

export interface TecSdkConfig {
  gatewayUrl: string;
  apiKey?: string;
}

export class TecSdk {
  public readonly auth: AuthClient;
  public readonly wallet: WalletClient;
  public readonly payment: PaymentClient;
  public readonly health: HealthClient;
  public readonly assets: AssetsModule;

  constructor(config: TecSdkConfig) {
    const { gatewayUrl, apiKey } = config;

    // BaseClient instance for shared configuration
    const baseClient = new BaseClient(gatewayUrl, apiKey);

    // All services now extend BaseClient or use it
    this.auth = new AuthClient(gatewayUrl, apiKey);
    this.wallet = new WalletClient(gatewayUrl, apiKey);
    this.payment = new PaymentClient(gatewayUrl, apiKey);
    this.health = new HealthClient(gatewayUrl, apiKey);

    // AssetsModule now inherits from BaseClient
    this.assets = new AssetsModule(gatewayUrl, apiKey);
  }
}

// Export types & utils
export * from './types';
export * from './modules/asset.module';
export { logger, logInfo, logWarn, logError } from './utils/logger';
