/**
 * TokenStore — browser/server-safe token abstraction.
 *
 * Browser  → localStorage (via BrowserTokenStore)
 * Server   → process-scoped Map (via ServerTokenStore)
 *
 * BaseClient receives a TokenStore instance so it never
 * touches `window` or `localStorage` directly.
 */

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

// ─── Auto-detect factory ─────────────────────────────────────
export function createTokenStore(): TokenStore {
  if (typeof window !== 'undefined') {
    return new BrowserTokenStore();
  }
  return new ServerTokenStore();
}
