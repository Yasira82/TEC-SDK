import type { Config } from 'jest';

const config: Config = {
  preset:          'ts-jest',
  testEnvironment: 'node',
  roots:           ['<rootDir>/src'],
  testMatch:       ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 60,
      branches:   60,
      functions:  60,
      lines:      60,
    },
  },
  globals: {
    'ts-jest': {
      tsconfig: { module: 'CommonJS' },
    },
  },
};

export default config;
