import { ServerTokenStore, createTokenStore } from '../src/core/token-store';

describe('ServerTokenStore', () => {
  let store: ServerTokenStore;

  beforeEach(() => {
    store = new ServerTokenStore();
  });

  it('returns null for missing key', () => {
    expect(store.get('nonexistent')).toBeNull();
  });

  it('sets and gets a value', () => {
    store.set('tec_token', 'my-access-token');
    expect(store.get('tec_token')).toBe('my-access-token');
  });

  it('overwrites existing value', () => {
    store.set('tec_token', 'first');
    store.set('tec_token', 'second');
    expect(store.get('tec_token')).toBe('second');
  });

  it('removes a key', () => {
    store.set('tec_token', 'my-token');
    store.remove('tec_token');
    expect(store.get('tec_token')).toBeNull();
  });

  it('handles multiple keys independently', () => {
    store.set('key_a', 'value_a');
    store.set('key_b', 'value_b');
    expect(store.get('key_a')).toBe('value_a');
    expect(store.get('key_b')).toBe('value_b');
    store.remove('key_a');
    expect(store.get('key_a')).toBeNull();
    expect(store.get('key_b')).toBe('value_b');
  });

  it('remove non-existent key does not throw', () => {
    expect(() => store.remove('never-set')).not.toThrow();
  });
});

describe('createTokenStore', () => {
  it('returns ServerTokenStore in Node.js environment', () => {
    const store = createTokenStore();
    expect(store).toBeInstanceOf(ServerTokenStore);
  });

  it('created store works correctly', () => {
    const store = createTokenStore();
    store.set('test_key', 'test_value');
    expect(store.get('test_key')).toBe('test_value');
    store.remove('test_key');
    expect(store.get('test_key')).toBeNull();
  });
});
