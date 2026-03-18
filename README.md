TEC SDK — The Sovereign Bridge.

"Build Status" (https://img.shields.io/github/actions/workflow/status/Yasser1728/tec-sdk/publish.yml?branch=main)
"License" (https://img.shields.io/badge/license-MIT-blue)
"Version" (https://img.shields.io/badge/version-1.0.0-green)
"TypeScript" (https://img.shields.io/badge/TypeScript-Strict-blue)

TEC SDK is a high-performance, enterprise-grade TypeScript library designed to orchestrate the digital economy of the Titan Elite Commerce (TEC) ecosystem.

It provides a secure, resilient, and developer-friendly interface for interacting with TEC Core Services, Pi Network authentication, wallet management, and payment orchestration across multiple domains.

---

🚀 Features

- Multi-Domain Orchestration
  Built to support the TEC ecosystem architecture of 24 independent applications.

- Enterprise Security
  Strict runtime validation using Zod schemas to ensure API contract integrity.

- Resilient Connectivity
  Built-in retry system with exponential backoff for unstable network conditions.

- Centralized Authentication
  Secure token handling and automatic Authorization header injection.

- Diagnostic Tools
  Integrated Health Checks and structured logging using "Pino".

- Developer Experience (DX)
  Fully typed with TypeScript for autocomplete, safety, and maintainability.

---

📦 Installation

Install the SDK using npm:

npm install @yasser1728/tec-sdk

---

🛠️ Quick Start

import { TecSdk } from '@yasser1728/tec-sdk';

const tec = new TecSdk({
  apiKey: process.env.TEC_API_KEY,
  gatewayUrl: 'https://api.tec-ecosystem.com'
});

// Check system health
const isAlive = await tec.health.isAlive();

if (isAlive) {
  console.log("TEC Systems Operational");
}

// Authenticate user with Pi Network
const auth = await tec.auth.loginWithPi('user_pi_access_token');

// Create secure payment
const payment = await tec.payment.createPayment({
  userId: auth.user.userId,
  amount: 10,
  currency: 'PI'
});

---

🏗️ Architecture

TEC SDK follows a Facade Pattern architecture.

All services are accessible through a single SDK entry point while remaining fully decoupled.

Apps (Next.js)
      │
      ▼
TEC SDK (Facade Layer)
      │
      ▼
API Gateway
      │
      ▼
Core Microservices
 ├── Auth Service
 ├── Payment Service
 └── Wallet Service

Each service operates independently with its own database and business logic.

---

📂 SDK Structure

src/
 ├── api/
 │   ├── baseClient.ts
 │   ├── authClient.ts
 │   ├── paymentClient.ts
 │   └── walletClient.ts
 │
 ├── utils/
 │   └── logger.ts
 │
 └── index.ts

BaseClient

Handles:

- HTTP communication
- Authorization headers
- Error normalization
- Zod validation
- Axios interceptors

Service Clients

Each service client extends BaseClient and implements domain-specific logic.

---

🧪 Testing & Quality

We maintain strict quality standards with extensive automated tests.

Run tests locally:

npm test

Generate coverage reports:

npm run test:coverage

Target coverage: 90%+

---

🛡️ Security & Auditing

TEC SDK follows strict security practices:

- Static Analysis powered by GitHub CodeQL
- Runtime validation using Zod schemas
- No secret logging (API keys or tokens are never written to logs)
- Request validation on both client and server side

---

👨‍💻 Author

Yasser1728
CEO & Founder — Titan Elite Commerce (TEC)

GitHub:
https://github.com/Yasser1728

---

📄 License

This project is licensed under the MIT License.
