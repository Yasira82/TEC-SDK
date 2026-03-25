import pino from 'pino';

/**
 * TEC SDK Logger Configuration
 * Optimized for both Node.js (Backend) and Browser (Pi Browser)
 */
export const logger = pino({
  level: process.env['NEXT_PUBLIC_LOG_LEVEL'] || process.env['LOG_LEVEL'] || 'info',
  base: {
    service: 'tec-sdk',
    env: process.env['NODE_ENV'],
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'accessToken',
      'refreshToken',
      'authorization',
      'headers.authorization',
      'headers["x-api-key"]',
      'apiKey',
      '*.password',
      '*.token',
      '*.secret',
    ],
    censor: '[REDACTED]',
  },
  transport:
    typeof window === 'undefined' && process.env['NODE_ENV'] === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
          },
        }
      : undefined,
});

export const logInfo = (msg: string, meta?: Record<string, unknown>): void =>
  logger.info(meta ?? {}, msg);

export const logWarn = (msg: string, meta?: Record<string, unknown>): void =>
  logger.warn(meta ?? {}, msg);

export const logError = (msg: string, meta?: Record<string, unknown>): void =>
  logger.error(meta ?? {}, msg);
