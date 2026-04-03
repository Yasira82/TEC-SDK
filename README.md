### `TEC-SDK/README.md`
```markdown
# TEC SDK — The Sovereign Bridge

![Build Status](https://img.shields.io/github/actions/workflow/status/Yasser1728/TEC-SDK/publish.yml?branch=main)
![Version](https://img.shields.io/badge/version-1.2.1-green)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)
![License](https://img.shields.io/badge/license-MIT-blue)

TEC SDK is a TypeScript library for interacting with the TEC Ecosystem — a Web3 Super Platform built on Pi Network. It provides a unified interface for authentication, payments, wallet management, commerce, notifications, and more.

---

## 📦 Installation

```bash
npm install @yasser172/tec-sdk
```

---

## 🚀 Quick Start

```typescript
import { TecSdk } from '@yasser172/tec-sdk';

const tec = new TecSdk({
  gatewayUrl: 'https://api-gateway-production-6a68.up.railway.app',
});

// Check system health
const isAlive = await tec.health.isAlive();

// Authenticate with Pi Network
const auth = await tec.auth.loginWithPi('pi_access_token');

// Set token for authenticated requests
tec.auth.setToken(auth.tokens.accessToken);

// Create payment
const payment = await tec.payment.createPayment(
  auth.user.userId,
  10,
  'PI',
);
```

---

## 🏗️ Architecture

```
Next.js App (Frontend)
       │
       ▼
  TEC SDK (Facade)
       │
       ▼
  API Gateway
       │
  ┌────┴────────────────┐
  ▼                     ▼
Auth Service      Payment Service
Wallet Service    Commerce Service
Notification      KYC Service
```

---

## 📂 SDK Structure

```
src/
├── api/
│   ├── baseClient.ts         ← HTTP client + retry + token injection
│   ├── authClient.ts         ← Pi Network authentication
│   ├── paymentClient.ts      ← Pi payments (U2A + A2U)
│   ├── walletClient.ts       ← TEC wallet balance + transactions
│   ├── assetClient.ts        ← Digital asset management
│   ├── commerceClient.ts     ← Products, orders, subscriptions
│   ├── notificationClient.ts ← Push notifications + preferences
│   └── healthClient.ts       ← System health checks
├── core/
│   └── token-store.ts        ← Browser/Server token storage
├── utils/
│   └── logger.ts             ← Pino structured logging
└── index.ts                  ← TecSdk entry point
```

---

## 📖 API Reference

### TecSdk

```typescript
const tec = new TecSdk({
  gatewayUrl: string;   // required — API Gateway URL
  apiKey?:    string;   // optional — API key
  tokenStore?: TokenStore; // optional — custom token storage
});
```

Properties:
- `tec.auth` — AuthClient
- `tec.payment` — PaymentClient
- `tec.wallet` — WalletClient
- `tec.asset` — AssetClient
- `tec.commerce` — CommerceClient
- `tec.notification` — NotificationClient
- `tec.health` — HealthClient

---

### AuthClient

```typescript
// Login with Pi Network
const auth = await tec.auth.loginWithPi(piAccessToken: string);
// Returns: { success, isNewUser, user, tokens }

// Set token for subsequent requests
tec.auth.setToken(accessToken: string);

// Clear token (logout)
tec.auth.clearToken();
```

---

### PaymentClient

```typescript
// Create U2A payment (User to App)
const payment = await tec.payment.createPayment(
  userId:   string,
  amount:   number,
  currency: string = 'PI',
  metadata?: Record<string, unknown>,
);

// Approve payment
await tec.payment.approvePayment(paymentId: string);

// Complete payment
await tec.payment.completePayment(paymentId: string, transactionId: string);

// Cancel payment
await tec.payment.cancelPayment(paymentId: string);

// Get payment by ID
const payment = await tec.payment.getPayment(paymentId: string);

// List user payments
const payments = await tec.payment.listUserPayments(userId: string);

// Resolve incomplete payment
await tec.payment.resolveIncomplete(piPaymentId: string);
```

---

### WalletClient

```typescript
// Get wallet balance
const balance = await tec.wallet.getBalance(userId: string);
// Returns: { userId, balance, currency }

// Credit wallet
const tx = await tec.wallet.creditWallet(userId, amount, referenceId);

// Debit wallet
const tx = await tec.wallet.debitWallet(userId, amount, referenceId);

// Get transactions
const txs = await tec.wallet.getTransactions(userId: string);
```

---

### CommerceClient

```typescript
// Products
const products = await tec.commerce.getProducts({ category?, page?, limit? });
const product  = await tec.commerce.getProductById(productId);
const created  = await tec.commerce.createProduct(data);

// Orders
const order  = await tec.commerce.createOrder({ items });
const order  = await tec.commerce.getOrder(orderId);
const orders = await tec.commerce.getUserOrders(userId);
await tec.commerce.cancelOrder(orderId);

// Subscriptions
const sub = await tec.commerce.getSubscription(userId);
const sub = await tec.commerce.createSubscription({ planId, interval });
await tec.commerce.cancelSubscription(subscriptionId);
```

---

### NotificationClient

```typescript
// Get notifications
const notifs = await tec.notification.getNotifications(userId, { unreadOnly?, limit? });

// Unread count
const count = await tec.notification.getUnreadCount(userId);

// Mark as read
await tec.notification.markAsRead(notificationId);
await tec.notification.markAllAsRead(userId);

// Preferences
const prefs = await tec.notification.getPreferences(userId);
await tec.notification.updatePreferences(userId, prefs);

// Push token
await tec.notification.registerPushToken(userId, token, platform);
```

---

### HealthClient

```typescript
// Check if gateway is alive
const alive = await tec.health.isAlive(); // boolean

// Get system status
const status = await tec.health.getSystemStatus();

// Check specific service
const svc = await tec.health.checkService('auth');
```

---

## 🔄 Retry Logic

All clients use automatic retry with exponential backoff:

```typescript
// Built into BaseClient — retries on 5xx and 429
// Default: 3 attempts, 500ms base delay
// Delays: 500ms → 1000ms → 2000ms
```

---

## 🔐 Token Storage

```typescript
import { createTokenStore, BrowserTokenStore, ServerTokenStore } from '@yasser172/tec-sdk';

// Auto-detect (browser vs server)
const store = createTokenStore();

// Explicit browser storage (localStorage)
const browserStore = new BrowserTokenStore();

// Explicit server storage (in-memory Map)
const serverStore = new ServerTokenStore();

const tec = new TecSdk({ gatewayUrl: '...', tokenStore: serverStore });
```

---

## 🧪 Testing

```bash
npm test
npm run test:coverage
```

---

## 📋 Changelog

### v1.2.1
- `withRetry()` moved to `BaseClient` — shared across all clients
- Removed duplicate `withRetry` from PaymentClient, WalletClient, CommerceClient, NotificationClient
- Fixed paymentClient test expectations

### v1.2.0
- Added CommerceClient (products, orders, subscriptions)
- Added NotificationClient
- Added AssetClient
- Pino structured logging

### v1.0.0
- Initial release
- AuthClient, PaymentClient, WalletClient, HealthClient

---

## 👨‍💻 Author

**Yasser1728** — CEO & Founder, Titan Elite Commerce (TEC)

---

## 📄 License

MIT
```

---

```bash
git add TEC-SDK/README.md
git commit -m "docs: comprehensive SDK README — full API reference v1.2.1"
git push
```
