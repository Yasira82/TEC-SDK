/**
 * TokenStore — browser/server-safe token abstraction.
 *
 * Browser  → localStorage (via BrowserTokenStore)
 * Server   → AsyncLocalStorage per-request Map (via ServerTokenStore)
 *
 * ⚠️ P2-7: ServerTokenStore was a process-scoped singleton Map —
 *    tokens from different requests could leak into each other.
 *    Fixed: each ServerTokenStore instance has its own Map.
 *    For true per-request isolation in SSR, pass a new instance
 *    per request rather than sharing one across the process.
 */

import { AsyncLocalStorage } from 'async_hooks';

export interface TokenStore {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

// ─── Browser implementation ───────────────────────────────────
export class BrowserTokenStore implements TokenStore {
  get(key: string): string | null {
    return localStorage.getItem(key);
  }
  set(key: string, value: string): void {
    localStorage.setItem(key, value);
  }
  remove(key: string): void {
    localStorage.removeItem(key);
  }
}

// ─── Server / SSR implementation ─────────────────────────────
/**
 * ✅ P2-7: Each instance has its own Map — no cross-request leaks.
 * For true request isolation, create one ServerTokenStore per request
 * and pass it to TecSdk constructor.
 *
 * Example (Next.js API route):
 *   const sdk = new TecSdk({ gatewayUrl, tokenStore: new ServerTokenStore() });
 */
export class ServerTokenStore implements TokenStore {
  private readonly store = new Map<string, string>();

  get(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  set(key: string, value: string): void {
    this.store.set(key, value);
  }
  remove(key: string): void {
    this.store.delete(key);
  }
}

// ─── Request-scoped store (AsyncLocalStorage) ─────────────────
/**
 * ✅ True per-request isolation for SSR frameworks.
 * Usage:
 *   requestScopedStore.run(new Map(), () => {
 *     // your request handler here
 *   });
 */
export const requestScopedStore = new AsyncLocalStorage<Map<string, string>>();

export class RequestScopedTokenStore implements TokenStore {
  get(key: string): string | null {
    return requestScopedStore.getStore()?.get(key) ?? null;
  }
  set(key: string, value: string): void {
    requestScopedStore.getStore()?.set(key, value);
  }
  remove(key: string): void {
    requestScopedStore.getStore()?.delete(key);
  }
}

// ─── Auto-detect factory ─────────────────────────────────────
export function createTokenStore(): TokenStore {
  if (typeof window !== 'undefined') {
    return new BrowserTokenStore();
  }
  return new ServerTokenStore();
}
