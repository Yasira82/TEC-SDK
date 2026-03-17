// ─── Imports ────────────────────────────────────────────────────────────────
import { AuthClient } from './api/authClient';
import { WalletClient } from './api/walletClient';
import { PaymentClient } from './api/paymentClient';
import { HealthClient } from './api/healthClient';
import { AssetClient } from './api/assetClient'; // Updated: renamed and relocated

// ─── Config Interface ───────────────────────────────────────────────────────
export interface TecSdkConfig {
  gatewayUrl: string;
  apiKey?: string;
}

/**
 * TecSdk Class
 * The central orchestrator for all TEC platform services.
 */
export class TecSdk {
  public readonly auth: AuthClient;
  public readonly wallet: WalletClient;
  public readonly payment: PaymentClient;
  public readonly health: HealthClient;
  public readonly assets: AssetClient; // unified naming with other services

  constructor(config: TecSdkConfig) {
    const { gatewayUrl, apiKey } = config;

    // Initialize all service clients with centralized configuration
    // Each client now inherits from the updated BaseClient with interceptors
    this.auth = new AuthClient(gatewayUrl, apiKey);
    this.wallet = new WalletClient(gatewayUrl, apiKey);
    this.payment = new PaymentClient(gatewayUrl, apiKey);
    this.health = new HealthClient(gatewayUrl, apiKey);
    this.assets = new AssetClient(gatewayUrl, apiKey);
  }
}

// ─── Exports ────────────────────────────────────────────────────────────────
// Export types for developers' convenience
export * from './types';
export * from './api/authClient';
export * from './api/walletClient';
export * from './api/paymentClient';
export * from './api/assetClient'; // export updated AssetClient

// Export logging utilities
export { logger, logInfo, logWarn, logError } from './utils/logger';
