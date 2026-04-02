import { logger } from './logger';
import { TecSdkError } from '../api/baseClient';

export type BackoffStrategy = 'fixed' | 'linear' | 'exponential';

export interface RetryOptions {
  /** Max number of attempts (including the first call). Default: 3 */
  attempts?: number;
  /** Base delay in ms. Default: 300 */
  delay?: number;
  /** Backoff strategy. Default: 'exponential' */
  backoff?: BackoffStrategy;
  /**
   * HTTP status codes that should NOT be retried.
   * Auth errors (401, 403) and validation errors (400, 422)
   * should never be retried — they won't succeed on retry.
   * Default: [400, 401, 403, 404, 422]
   */
  noRetryOn?: number[];
}

const DEFAULT_NO_RETRY = [400, 401, 403, 404, 422];

function calcDelay(
  attempt: number,       // 0-based (first retry = 0)
  base: number,
  strategy: BackoffStrategy,
): number {
  switch (strategy) {
    case 'fixed':       return base;
    case 'linear':      return base * (attempt + 1);
    case 'exponential': return base * Math.pow(2, attempt);
  }
}

function isRetryable(err: unknown, noRetryOn: number[]): boolean {
  if (err instanceof TecSdkError) {
    return !noRetryOn.includes(err.status);
  }
  // Network errors (no response) are always retryable
  return true;
}

/**
 * Retry helper — call `fn` up to `attempts` times with backoff.
 *
 * @example
 * const data = await withRetry(() => client.get('/health'), { attempts: 3 });
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    attempts  = 3,
    delay     = 300,
    backoff   = 'exponential',
    noRetryOn = DEFAULT_NO_RETRY,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      const isLast = attempt === attempts - 1;

      if (isLast || !isRetryable(err, noRetryOn)) {
        throw err;
      }

      const wait = calcDelay(attempt, delay, backoff);

      logger.warn(
        {
          attempt: attempt + 1,
          maxAttempts: attempts,
          waitMs: wait,
          error: err instanceof Error ? err.message : String(err),
        },
        '[TEC-SDK] Retrying request…',
      );

      await new Promise<void>((resolve) => setTimeout(resolve, wait));
    }
  }

  // Unreachable — TypeScript requires a throw here
  throw lastError;
}
