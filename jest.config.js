/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Shipped code (src) stays strict incl. noUncheckedIndexedAccess (tsconfig).
  // Test fixtures access arrays/records loosely; relax only that flag for tests
  // so the production strictness isn't watered down to fit test ergonomics.
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { noUncheckedIndexedAccess: false } }],
  },
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  // Regression floor — ratcheted just below current actual (85.3/88.9/69.4/85.3).
  // Raise as coverage grows; never lower without justification.
  coverageThreshold: {
    global: {
      statements: 82,
      branches: 85,
      functions: 67,
      lines: 82,
    },
  },
};
