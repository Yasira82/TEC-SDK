import { withRetry } from '../utils/retry';
import { TecSdkError } from '../api/baseClient';

describe('withRetry', () => {
  it('returns immediately on first success', async () => {
    const fn = jest.fn().mockResolvedValue('result');
    const result = await withRetry(fn, { attempts: 3, delay: 0 });
    expect(result).toBe('result');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on 5xx TecSdkError and succeeds on second attempt', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new TecSdkError(500, 'Server error'))
      .mockResolvedValueOnce('ok');
    const result = await withRetry(fn, { attempts: 3, delay: 0 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('retries on 429 TecSdkError (rate limit)', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new TecSdkError(429, 'Rate limited'))
      .mockResolvedValueOnce('ok');
    const result = await withRetry(fn, { attempts: 3, delay: 0 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('does NOT retry on 422 (validation error)', async () => {
    const fn = jest.fn().mockRejectedValue(new TecSdkError(422, 'Unprocessable'));
    await expect(withRetry(fn, { attempts: 3, delay: 0 })).rejects.toThrow('Unprocessable');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does NOT retry on 401 (unauthorized)', async () => {
    const fn = jest.fn().mockRejectedValue(new TecSdkError(401, 'Unauthorized'));
    await expect(withRetry(fn, { attempts: 3, delay: 0 })).rejects.toThrow('Unauthorized');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does NOT retry on 400 (bad request)', async () => {
    const fn = jest.fn().mockRejectedValue(new TecSdkError(400, 'Bad request'));
    await expect(withRetry(fn, { attempts: 3, delay: 0 })).rejects.toThrow('Bad request');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does NOT retry on 403 (forbidden)', async () => {
    const fn = jest.fn().mockRejectedValue(new TecSdkError(403, 'Forbidden'));
    await expect(withRetry(fn, { attempts: 3, delay: 0 })).rejects.toThrow('Forbidden');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('exhausts max attempts and rethrows last error', async () => {
    const fn = jest.fn().mockRejectedValue(new TecSdkError(503, 'Unavailable'));
    await expect(withRetry(fn, { attempts: 3, delay: 0 })).rejects.toThrow('Unavailable');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('retries generic (non-TecSdkError) network errors', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('ECONNRESET'))
      .mockResolvedValueOnce('connected');
    const result = await withRetry(fn, { attempts: 3, delay: 0 });
    expect(result).toBe('connected');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('respects attempts: 1 (no retries)', async () => {
    const fn = jest.fn().mockRejectedValue(new TecSdkError(500, 'Fail'));
    await expect(withRetry(fn, { attempts: 1, delay: 0 })).rejects.toThrow('Fail');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('custom noRetryOn skips retry for that status', async () => {
    const fn = jest.fn().mockRejectedValue(new TecSdkError(503, 'Custom skip'));
    await expect(withRetry(fn, { attempts: 3, delay: 0, noRetryOn: [503] })).rejects.toThrow('Custom skip');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
