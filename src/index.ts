// ─── Core SDK Entry Point ───────────────────────────────────────────────────

/**
 * TEC SDK Configuration Interface
 */
export interface TecSdkConfig {
  apiKey?: string; // جعلته اختيارياً لضمان التوافق
  gatewayUrl: string;
}

// ─── Export Base & Clients ──────────────────────────────────────────────────
export { BaseClient } from './api/baseClient';
export { AuthClient } from './api/authClient';
export { WalletClient } from './api/walletClient';
export { PaymentClient } from './api/paymentClient';
export { HealthClient } from './api/healthClient';
export { AssetsModule } from './modules/asset.module'; // تصدير الموديول الجديد

// ─── Export Types & Schemas ─────────────────────────────────────────────────
export * from './types';
export * from './api/authClient';
export * from './api/walletClient';
export * from './api/paymentClient';
export * from './modules/asset.module'; // تصدير أنواع الأصول (Asset, CreateAssetDto)

// ─── Export Utilities ───────────────────────────────────────────────────────
export { logger, logInfo, logWarn, logError } from './utils/logger';

// ─── Global SDK Orchestrator ────────────────────────────────────────────────
import { AuthClient } from './api/authClient';
import { WalletClient } from './api/walletClient';
import { PaymentClient } from './api/paymentClient';
import { HealthClient } from './api/healthClient';
import { AssetsModule } from './modules/asset.module';
import { TECHttpClient } from './core/http-client';

/**
 * TecSdk Class
 * The main orchestrator for all TEC services. 
 */
export class TecSdk {
  public readonly auth: AuthClient;
  public readonly wallet: WalletClient;
  public readonly payment: PaymentClient;
  public readonly health: HealthClient;
  public readonly assets: AssetsModule; // إضافة موديول الأصول

  constructor(config: TecSdkConfig) {
    const { gatewayUrl, apiKey } = config;

    // تهيئة العميل الأساسي الموحد (أو تمرير البيانات للـ Clients)
    const httpClient = new TECHttpClient(gatewayUrl);

    this.auth = new AuthClient(gatewayUrl, apiKey || '');
    this.wallet = new WalletClient(gatewayUrl, apiKey || '');
    this.payment = new PaymentClient(gatewayUrl, apiKey || '');
    this.health = new HealthClient(gatewayUrl, apiKey || '');
    
    // ربط موديول الأصول بالعميل الموحد
    this.assets = new AssetsModule(httpClient);
  }
}
