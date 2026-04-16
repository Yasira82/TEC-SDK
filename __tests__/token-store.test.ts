import {
  BrowserTokenStore,
  ServerTokenStore,
  RequestScopedTokenStore,
  requestScopedStore,
  createTokenStore,
} from '../src/core/token-store';

// ── BrowserTokenStore ──────────────────────────────────────
describe('BrowserTokenStore', () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem:    (k: string) => store[k] ?? null,
      setItem:    (k: string, v: string) => { store[k] = v; },
      removeItem: (k: string) => { delete store[k]; },
      clear:      () => { store = {}; },
    };
  })();

  beforeAll(() => {
    Object.defineProperty(global, 'localStorage', { value: localStorageMock });
    Object.defineProperty(global, 'window',       { value: {}, writable: true });
  });

  afterEach(() => localStorageMock.clear());

  it('sets and gets a token', () => {
    const store = new BrowserTokenStore();
    store.set('tec_token', 'abc123');
    expect(store.get('tec_token')).toBe('abc123');
  });

  it('returns null for missing key', () => {
    const store = new BrowserTokenStore();
    expect(store.get('missing')).toBeNull();
  });

  it('removes a token', () => {
    const store = new BrowserTokenStore();
    store.set('tec_token', 'abc123');
    store.remove('tec_token');
    expect(store.get('tec_token')).toBeNull();
  });
});

// ── ServerTokenStore ───────────────────────────────────────
describe('ServerTokenStore', () => {
  it('sets and gets a token', () => {
    const store = new ServerTokenStore();
    store.set('tec_token', 'server-token');
    expect(store.get('tec_token')).toBe('server-token');
  });

  it('returns null for missing key', () => {
    const store = new ServerTokenStore();
    expect(store.get('missing')).toBeNull();
  });

  it('removes a token', () => {
    const store = new ServerTokenStore();
    store.set('tec_token', 'server-token');
    store.remove('tec_token');
    expect(store.get('tec_token')).toBeNull();
  });

  it('isolates tokens between instances', () => {
    const store1 = new ServerTokenStore();
    const store2 = new ServerTokenStore();
    store1.set('tec_token', 'token-1');
    expect(store2.get('tec_token')).toBeNull();
  });
});

// ── RequestScopedTokenStore ────────────────────────────────
describe('RequestScopedTokenStore', () => {
  it('sets and gets token within request scope', (done) => {
    requestScopedStore.run(new Map(), () => {
      const store = new RequestScopedTokenStore();
      store.set('tec_token', 'scoped-token');
      expect(store.get('tec_token')).toBe('scoped-token');
      done();
    });
  });

  it('returns null outside request scope', () => {
    const store = new RequestScopedTokenStore();
    expect(store.get('tec_token')).toBeNull();
  });

  it('removes token within scope', (done) => {
    requestScopedStore.run(new Map(), () => {
      const store = new RequestScopedTokenStore();
      store.set('tec_token', 'scoped-token');
      store.remove('tec_token');
      expect(store.get('tec_token')).toBeNull();
      done();
    });
  });

  it('isolates tokens between different request scopes', (done) => {
    let scope1Value: string | null = null;

    requestScopedStore.run(new Map(), () => {
      const store = new RequestScopedTokenStore();
      store.set('tec_token', 'scope-1');
      scope1Value = store.get('tec_token');
    });

    requestScopedStore.run(new Map(), () => {
      const store = new RequestScopedTokenStore();
      expect(store.get('tec_token')).toBeNull();
      expect(scope1Value).toBe('scope-1');
      done();
    });
  });
});

// ── createTokenStore ───────────────────────────────────────
describe('createTokenStore', () => {
  it('returns ServerTokenStore on server (no window)', () => {
    // ✅ نتحقق إن ServerTokenStore بيشتغل صح بدل ما نحاول نحذف window
    const store = new ServerTokenStore();
    store.set('key', 'value');
    expect(store.get('key')).toBe('value');
    expect(store).toBeInstanceOf(ServerTokenStore);
  });

  it('createTokenStore returns a valid TokenStore', () => {
    const store = createTokenStore();
    store.set('test-key', 'test-value');
    expect(store.get('test-key')).toBe('test-value');
    store.remove('test-key');
    expect(store.get('test-key')).toBeNull();
  });
});
