import pino from 'pino';

/**
 * TEC SDK Logger Configuration
 * Optimized for both Node.js (Backend) and Browser (Pi Browser)
 */
export const logger = pino({
  level: process.env.NEXT_PUBLIC_LOG_LEVEL || process.env.LOG_LEVEL || 'info',
  base: {
    service: 'tec-sdk',
    env: process.env.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  // Only use pino-pretty in development and NOT in browser
  transport: 
    typeof window === 'undefined' && process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
          },
        }
      : undefined,
});

/**
 * Utility functions for structured logging
 */
export const logInfo = (msg: string, meta?: Record<string, any>) => 
  logger.info(meta ? { ...meta } : {}, msg);

export const logWarn = (msg: string, meta?: Record<string, any>) => 
  logger.warn(meta ? { ...meta } : {}, msg);

export const logError = (msg: string, meta?: Record<string, any>) => 
  logger.error(meta ? { ...meta } : {}, msg);
