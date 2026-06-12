import {
  ServerTokenStore,
  BrowserTokenStore,
  createTokenStore,
} from '../core/token-store';

describe('ServerTokenStore', () => {
  let store: ServerTokenStore;

  beforeEach(() => {
    store = new ServerTokenStore();
  });

  it('returns null for a missing key', () => {
    expect(store.get('missing')).toBeNull();
  });

  it('stores and retrieves a value', () => {
    store.set('tec_token', 'tok-abc');
    expect(store.get('tec_token')).toBe('tok-abc');
  });

  it('removes a stored value', () => {
    store.set('tec_token', 'tok-abc');
    store.remove('tec_token');
    expect(store.get('tec_token')).toBeNull();
  });

  it('overwrites an existing value on set', () => {
    store.set('key', 'first');
    store.set('key', 'second');
    expect(store.get('key')).toBe('second');
  });

  it('each instance has independent storage (no cross-request leak)', () => {
    const a = new ServerTokenStore();
    const b = new ServerTokenStore();
    a.set('k', 'valueA');
    expect(b.get('k')).toBeNull();
  });

  it('remove on missing key is a no-op', () => {
    expect(() => store.remove('nothing')).not.toThrow();
  });
});

describe('createTokenStore', () => {
  it('returns ServerTokenStore in Node.js (window is undefined)', () => {
    const original = (global as Record<string, unknown>).window;
    delete (global as Record<string, unknown>).window;
    const store = createTokenStore();
    expect(store).toBeInstanceOf(ServerTokenStore);
    (global as Record<string, unknown>).window = original;
  });
});

describe('BrowserTokenStore', () => {
  const mockLocalStorage = {
    _store: {} as Record<string, string>,
    getItem(key: string)             { return this._store[key] ?? null; },
    setItem(key: string, val: string){ this._store[key] = val; },
    removeItem(key: string)          { delete this._store[key]; },
    clear()                          { this._store = {}; },
  };

  beforeEach(() => {
    mockLocalStorage.clear();
    Object.defineProperty(global, 'localStorage', {
      value:        mockLocalStorage,
      writable:     true,
      configurable: true,
    });
  });

  it('stores and retrieves via localStorage', () => {
    const s = new BrowserTokenStore();
    s.set('tec_token', 'browser-tok');
    expect(s.get('tec_token')).toBe('browser-tok');
  });

  it('removes key from localStorage', () => {
    const s = new BrowserTokenStore();
    s.set('tec_token', 'tok');
    s.remove('tec_token');
    expect(s.get('tec_token')).toBeNull();
  });

  it('returns null for a key not in localStorage', () => {
    const s = new BrowserTokenStore();
    expect(s.get('nonexistent')).toBeNull();
  });
});
