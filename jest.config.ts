import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  // Load polyfills before the test environment
  setupFiles: ['<rootDir>/jest.setup.ts'],

  testEnvironment: 'jsdom',
  coverageProvider: 'v8',
  // setupFilesAfterEnv still runs after environment setup
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};

export default createJestConfig(config);
