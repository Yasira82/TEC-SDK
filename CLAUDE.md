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

## Current Phase: Platform Hardening

**P1 Violations affecting this package:**

| ID | Severity | Description | Est. Fix |
|----|----------|-------------|----------|
| NEW-A | SECURITY | Ensure no internal Railway URLs leak via this package's exports | 1 day |
| NEW-B | BLOCKING | INTERNAL_SECRET header must be passed on all gateway calls | 30 min |

**No new capabilities until P1 violations are closed.**

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

---

## Commit Convention

```
feat(sdk):    new capability
fix(sdk):     bug fix
refactor:     no behavior change
test(sdk):    tests
chore:        build/config
```

## Platform Context

Full platform context, ADR system, and engineering roadmap:
→ `TEC_MODELS_PAT.prompt.yml` in yasira82/tec-app (branch: claude/ecommerce-engineering-review-EuiQO)
→ `TEC_Ecosystem_AI_Key.prompt.yml` in yasira82/tec-app
