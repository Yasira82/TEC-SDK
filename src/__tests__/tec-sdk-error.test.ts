import { TecSdkError } from '../api/baseClient';

describe('TecSdkError', () => {
  it('has name "TecSdkError"', () => {
    expect(new TecSdkError(404, 'Not found').name).toBe('TecSdkError');
  });

  it('stores status code', () => {
    expect(new TecSdkError(403, 'Forbidden').status).toBe(403);
  });

  it('stores message', () => {
    expect(new TecSdkError(500, 'Internal error').message).toBe('Internal error');
  });

  it('stores the original error', () => {
    const original = new Error('axios error');
    expect(new TecSdkError(502, 'Bad gateway', original).original).toBe(original);
  });

  it('original is undefined when not provided', () => {
    expect(new TecSdkError(400, 'Bad request').original).toBeUndefined();
  });

  it('is an instance of Error', () => {
    expect(new TecSdkError(500, 'Error')).toBeInstanceOf(Error);
  });

  it('is an instance of TecSdkError (prototype chain preserved)', () => {
    const err = new TecSdkError(500, 'Error');
    expect(err).toBeInstanceOf(TecSdkError);
  });

  it('works correctly in try/catch', () => {
    function throwIt() { throw new TecSdkError(503, 'Unavailable'); }
    try {
      throwIt();
      fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(TecSdkError);
      expect((e as TecSdkError).status).toBe(503);
    }
  });
});
