import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest"
  },
  testEnvironment: 'node',
  testMatch: ['**/*.test.[jt]s?(x)'],
  collectCoverage: true,
  coveragePathIgnorePatterns: ['/node_modules/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  verbose: true
};

export default config;
