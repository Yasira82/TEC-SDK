# Changelog

All notable changes to `@yasser172/tec-sdk` are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
Versioning: [Semantic Versioning](https://semver.org/)

---

## [2.0.0] - 2026-11-14

### Changed (breaking)
- **zod 3 → zod 4** (TEC-AUDIT-0020: zod 3 has a high memory-exhaustion advisory with no fix
  short of 4). The SDK exports zod schemas (`CreatePaymentRequestSchema`, `PaymentAmountSchema`,
  …), so code that composes them with its own zod must be on zod 4 too — hence the major.
  Callers of the `TecSdk` client methods see no change: the same requests, the same validated
  results. Internals: `z.record()` takes its key schema; `ZodType<T>` replaces the removed
  `ZodSchema<T, ZodTypeDef, unknown>`.
- Consumers move their range to `^2.0.0` (a `^1.x` range never reaches 2.x).

## [1.4.0] - 2026-06-27

### Added
- **`TecSdk.analytics`** client — read-only access to tec-analytics-service:
  `getOverview()`, `getPayments()`, `getUsers()`, `getEvents(limit)`. Zod-validated,
  envelope-aware (`{ success, data }`). Backs the upcoming Analytics frontend BFF.
- `repository` / `homepage` / `bugs` package metadata.

## [1.3.1] - 2026-06-26

### Added
- `LICENSE` (MIT) file + `license` field; CHANGELOG included in published files.
- Dependabot config (npm + github-actions, weekly).
  (npm provenance was evaluated but skipped — unsupported for private source repos.)

### Changed
- `tsconfig`: enabled `noUncheckedIndexedAccess` for shipped code (tests relaxed via ts-jest).
- Coverage thresholds ratcheted to current actual (82/85/67/82).

## [1.3.0] - 2026-06

### Added
- Canonical payment contract — Single Source of Truth (ADR-009 shapes).

## [1.2.2] - 2026-04-03

### Changed
- Updated README with comprehensive API reference
- Added full documentation for all 7 clients
- Added token storage documentation (Browser vs Server)
- Added retry logic documentation

---

## [1.2.1] - 2026-04-03

### Fixed
- Removed duplicate `withRetry()` from PaymentClient, WalletClient, CommerceClient, NotificationClient
- Fixed paymentClient test expectations — removed PaymentSchema from post() assertions
- Fixed ts-jest missing from workspace node_modules

### Changed
- `withRetry()` moved to BaseClient as shared protected method
- Exponential backoff: retries on 5xx and 429 only

---

## [1.2.0] - 2026-03-15

### Added
- CommerceClient — products, orders, subscriptions
- NotificationClient — push notifications, preferences, device tokens
- AssetClient — digital asset management
- Pino structured logging via `utils/logger.ts`
- `TokenStore` interface with BrowserTokenStore and ServerTokenStore
- `createTokenStore()` auto-detect factory (browser vs SSR)

### Changed
- BaseClient refactored to use TokenStore abstraction
- All clients now SSR-safe (no direct localStorage access)

---

## [1.1.0] - 2026-02-20

### Added
- WalletClient — balance, credit, debit, transactions
- HealthClient — isAlive, getSystemStatus, checkService, ping
- Zod runtime validation on all API responses
- `TecSdkError` class with status + original error

### Changed
- BaseClient: Axios interceptors for error normalization
- Authorization header auto-injection via request interceptor

---

## [1.0.0] - 2026-01-15

### Added
- Initial release
- TecSdk facade class — single entry point
- AuthClient — Pi Network authentication + token management
- PaymentClient — U2A payments (create, approve, complete, cancel)
- BaseClient — HTTP client with Axios
- TypeScript strict mode
- npm package `@yasser172/tec-sdk`
