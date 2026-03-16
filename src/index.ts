// ─── Core SDK Entry Point ───────────────────────────────────────────────────

/**
 * TEC SDK Configuration Interface
 */
export interface TecSdkConfig {
  apiKey: string;
  gatewayUrl: string;
}

// ─── Export Base & Clients ──────────────────────────────────────────────────
export { BaseClient } from './api/baseClient';
export { AuthClient } from './api/authClient';
export { WalletClient } from './api/walletClient';
export { PaymentClient } from './api/paymentClient';
export { HealthClient } from './api/healthClient';

// ─── Export Types & Schemas ─────────────────────────────────────────────────
/**
 * Exporting all centralized types and module-specific schemas
 */
export * from './types';
export * from './api/authClient';
export * from './api/walletClient';
export * from './api/paymentClient';

// ─── Export Utilities ───────────────────────────────────────────────────────
export { logger, logInfo, logWarn, logError } from './utils/logger';

// ─── Global SDK Orchestrator ────────────────────────────────────────────────
import { AuthClient } from './api/authClient';
import { WalletClient } from './api/walletClient';
import { PaymentClient } from './api/paymentClient';
import { HealthClient } from './api/healthClient';

/**
 * TecSdk Class
 * The main orchestrator for all TEC services. 
 * Use this class to initialize all clients with a single configuration.
 */
export class TecSdk {
  public readonly auth: AuthClient;
  public readonly wallet: WalletClient;
  public readonly payment: PaymentClient;
  public readonly health: HealthClient;

  constructor(config: TecSdkConfig) {
    const { gatewayUrl, apiKey } = config;

    this.auth = new AuthClient(gatewayUrl, apiKey);
    this.wallet = new WalletClient(gatewayUrl, apiKey);
    this.payment = new PaymentClient(gatewayUrl, apiKey);
    this.health = new HealthClient(gatewayUrl, apiKey);
  }
}
