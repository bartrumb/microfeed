/* eslint-env jest */

// Mock console methods to prevent noise in test output
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

// Set timezone to UTC for consistent date handling
process.env.TZ = 'UTC';

// Add custom matchers if needed
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Mock D1 database for testing
global.D1Database = class {
  constructor() {
    this.statements = [];
    this.results = [];
  }

  prepare(sql) {
    const stmt = {
      sql,
      params: [],
      bind: function(...args) {
        this.params = args;
        return this;
      },
      run: async function() {
        return { success: true };
      },
      all: async function() {
        return { results: [] };
      }
    };
    this.statements.push(stmt);
    return stmt;
  }

  async batch(statements) {
    return statements.map(() => ({ results: [] }));
  }
};