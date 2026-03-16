// ─── Core SDK Entry Point ───────────────────────────────────────────────────

/**
 * TEC SDK Configuration Interface
 */
export interface TecSdkConfig {
  apiKey: string;
  gatewayUrl: string;
}

// ─── Export Clients ─────────────────────────────────────────────────────────
export { BaseClient } from './api/baseClient';
export { AuthClient } from './api/authClient';
export { WalletClient } from './api/walletClient';
export { PaymentClient } from './api/paymentClient';

// ─── Export Types & Schemas ─────────────────────────────────────────────────
// We export everything from these files (Schemas + Types)
export * from './api/authClient';
export * from './api/walletClient';
export * from './api/paymentClient';

// ─── Export Utilities ───────────────────────────────────────────────────────
export { logger, logInfo, logWarn, logError } from './utils/logger';

/**
 * Global SDK Orchestrator (Optional helper class)
 * Use this to initialize all clients at once
 */
import { AuthClient } from './api/authClient';
import { WalletClient } from './api/walletClient';
import { PaymentClient } from './api/paymentClient';

export class TecSdk {
  public readonly auth: AuthClient;
  public readonly wallet: WalletClient;
  public readonly payment: PaymentClient;

  constructor(config: TecSdkConfig) {
    this.auth = new AuthClient(config.gatewayUrl, config.apiKey);
    this.wallet = new WalletClient(config.gatewayUrl, config.apiKey);
    this.payment = new PaymentClient(config.gatewayUrl, config.apiKey);
  }
}
