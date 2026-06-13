# @yasser172/tec-sdk — Claude Code Instructions

## What This Package Is

Server-side BFF SDK for the TEC Federated Platform. Handles API Gateway proxying,
Zod validation, retry logic, and payment/auth/commerce service calls.

**Rule: NEVER import this package in Client Components or browser code.**

---

## Stack

- TypeScript strict (tsup build → dist/)
- Zod validation schemas
- No browser APIs — Node.js only

---

## Architecture Role

```
Next.js API Routes (BFF) → @yasser172/tec-sdk → API Gateway → Backend Services
Client Components         → packages/tec-core-sdk (NOT this package)
```

## P1 Violations — Current Status

| ID | Severity | Description | Status |
|----|----------|-------------|--------|
| NEW-A | SECURITY | No internal Railway URLs leaked via exports | ✅ CLOSED — env vars only |
| NEW-B | BLOCKING | INTERNAL_SECRET header on all gateway calls | ⚠️ OPS — set on Railway |

---

## Key Modules

```
src/
  api/      # Gateway proxy clients (TecSdk.payment.*, TecSdk.auth.*, TecSdk.commerce.*)
  core/     # Request/retry/error handling
  types/    # Zod schemas and TypeScript types
  utils/    # Shared server utilities
```

---

## SDK Contract Rules (C-47 §14)

```
✅ SDK reflects Kernel Spec exactly
✅ SDK never diverges from backend contracts
✅ Public integration through SDK by default
✅ All API responses validated with Zod schemas
✅ Retry logic built-in — consuming apps must NOT implement their own

❌ SDK implements business decisions
❌ SDK bypasses gateway logic
❌ Client code calls Railway URLs directly

Exceptions (governed by Kernel):
  Webhooks:        Pi Network → payment-service (direct)
  Health:          /health (no auth required)
  Admin:           AdminActor + audit trail
  Inter-service:   ServiceActor + x-internal-key
```

### Policy Precedence (P5 Layer Responsibility)
```
This SDK = contracts layer (Layer 4 — SDK Pre-validation)

Gateway enforces final access policy (Layer 3)
Services enforce business rules (Layer 2)
Kernel Invariants are supreme (Layer 1)

Rule: SDK pre-validation NEVER weakens a downstream invariant
```

---

## Event & Command Naming (for BFF route handlers)

### Events (facts — already happened)
```
Naming: domain.action.version
Examples:
  payment.completed.v1
  order.created.v1
  auth.login.success.v1
```

### Commands (intents — may be rejected)
```
Naming: VerbNoun (imperative)
Examples:
  ApprovePayment
  CreateOrder
  DebitWallet
```

---

## Development Commands

```bash
npm run build       # tsup build (outputs dist/)
npm run test        # Jest tests
npm run type-check  # TypeScript strict check
```

---

## What NOT To Do

- Do NOT add `window.*` or `document.*` — this is Node.js only
- Do NOT hardcode Railway/internal service URLs — env vars only
- Do NOT export `NEXT_PUBLIC_*` env references
- Do NOT break existing API contracts without a version bump
- Do NOT import this package from Client Components
- Do NOT implement business logic — SDK is contracts only (P5)
- Do NOT skip Zod validation on any API response

---

## Commit Convention

```
feat(sdk):    new capability
fix(sdk):     bug fix
refactor:     no behavior change
test(sdk):    tests
chore:        build/config
```

---

## Platform Orchestra — This Repo

**Role:** Server BFF SDK — typed, validated API calls from Next.js API routes to backend
**Consumers:** All TEC apps' `/api/bff/*` routes
**Boundary:** Server-only — NEVER in browser, NEVER in `'use client'` components

```
tec-app, tec-ecommerce, tec-assets, tec-commerce
  → /api/bff/* routes (server-side)
      → @yasser172/tec-sdk
          → API Gateway (tec-core-backend:4000)
              → backend services
```

---

## Commercial Targets

- Zero Railway URLs in SDK exports (NEW-A compliant)
- INTERNAL_SECRET passed on all gateway calls (enforces NEW-B when set)
- 100% Zod validation at all API boundaries — no unvalidated responses
- Semver discipline: breaking contract change = major version bump

---

## Risk Register

| # | Risk | Severity | Mitigation |
|---|------|----------|------------|
| R1 | Railway URL leaked via SDK export | P1 | `API_GATEWAY_URL` env var only |
| R2 | INTERNAL_SECRET missing on a call | P1 | Required header — fail loudly if undefined |
| R3 | `'use client'` component imports SDK | P1 | Lint rule — no tec-sdk in client components |
| R4 | Breaking API contract without version bump | P2 | Semver — major bump required |
| R5 | Browser API (`window.*`) crept into SDK | P1 | CI grep check: grep -r "window\." src/ |

---

## Platform Governance

### SHARED — This SDK implements the contract
- `API_GATEWAY_URL`: server-only env var (never `NEXT_PUBLIC_*`)
- `x-internal-key: ${INTERNAL_SECRET}` header on all calls
- Zod schemas: single source of truth for API response types
- Retry logic: built-in — consuming apps must NOT implement their own

### SOVEREIGN — This package owns
- Internal HTTP client implementation
- Retry/backoff strategy
- Zod schema definitions
- TypeScript type exports

---

## Release Gate Protocol

```bash
npm run type-check   # 0 errors
npm run test         # all pass
npm run build        # clean dist/
grep -r "window\." src/ && echo "FAIL: browser API detected" || echo "clean"
grep -r "NEXT_PUBLIC_" src/ && echo "FAIL: public env detected" || echo "clean"
git status           # clean
git fetch origin claude/ecommerce-engineering-review-EuiQO
git rebase origin/claude/ecommerce-engineering-review-EuiQO
```

---

## Platform Context

Full platform context, ADR system, and engineering roadmap:
→ `TEC_MODELS_PAT.prompt.yml` in yasira82/tec-app (branch: claude/ecommerce-engineering-review-EuiQO)
→ `TEC_Ecosystem_AI_Key.prompt.yml` in yasira82/tec-app
→ C-47 Kernel Spec §14 — SDK Contract Rules


---

## Skills

Available via plugin — invoke automatically when the situation matches:

| Situation | Skill |
|-----------|-------|
| Writing new feature or fixing a bug → use TDD | `/tdd` |
| Bug, regression, or unexpected behavior | `/diagnose` |
| Writing or modifying tests | `/test-guard` |
| Writing or modifying BFF routes, payment handlers, or API contracts | `/clean-code-guard` |
| Updating docs, CLAUDE.md, or knowledge-base entries | `/docs-guard` |
| Planning a new feature or architectural decision | `/grill-with-docs` |
| Breaking down a roadmap item into GitHub Issues | `/to-issues` |
| Session is getting long or context is filling up | `/handoff` |
| Adding pre-commit hooks to this repo | `/setup-pre-commit` |
