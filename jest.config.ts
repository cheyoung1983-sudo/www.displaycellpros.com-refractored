import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  // Load global polyfills before Jest environment (runs before test framework)
  setupFiles: ['<rootDir>/jest.global-setup.ts'],

  testEnvironment: 'jsdom',
  coverageProvider: 'v8',
  // Runs after Jest environment is ready
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};

export default createJestConfig(config);
