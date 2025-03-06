import { describe, expect, jest, test, beforeEach } from '@jest/globals';
import { Env } from '../../common-src/types/CloudflareTypes';
import { FeedContent, ChannelData, SettingsData, SETTINGS_CATEGORY } from '../../common-src/types/FeedContent';
import DatabaseInitializer from './DatabaseInitializer';
import type { D1Database, D1PreparedStatement, D1Result, D1ExecResult, D1Response } from '@cloudflare/workers-types';

// Helper function to create a type-safe mock D1PreparedStatement
function createMockPreparedStatement() {
  const mockResponse: D1Result = {
    results: [],
    meta: {
      duration: 0,
      size_after: 0,
      rows_read: 0,
      rows_written: 0,
      last_row_id: 0,
      changed_db: false,
      changes: 0
    },
    success: true
  };

  const stmt = {
    bind: jest.fn().mockReturnThis(),
    run: jest.fn().mockImplementation(() => Promise.resolve(mockResponse)),
    first: jest.fn().mockImplementation(() => Promise.resolve(null)),
    all: jest.fn().mockImplementation(() => Promise.resolve(mockResponse)),
    raw: jest.fn().mockImplementation(() => Promise.resolve(null)),
    text: jest.fn().mockReturnValue(""),
    toString: jest.fn().mockReturnValue("")
  };

  return stmt as unknown as jest.Mocked<D1PreparedStatement>;
}

// Helper function to create a type-safe mock D1Database
function createMockD1Database() {
  const mockPreparedStatement = createMockPreparedStatement();
  
  const mockResponse: D1Result = {
    results: [],
    meta: {
      duration: 0,
      size_after: 0,
      rows_read: 0,
      rows_written: 0,
      last_row_id: 0,
      changed_db: false,
      changes: 0
    },
    success: true
  };

  const mockD1ExecResult: D1ExecResult = {
    count: 0,
    duration: 0
  };

  const db = {
    prepare: jest.fn().mockReturnValue(mockPreparedStatement),
    batch: jest.fn().mockImplementation(() => Promise.resolve([mockResponse])),
    dump: jest.fn().mockImplementation(() => Promise.resolve(new ArrayBuffer(0))),
    exec: jest.fn().mockImplementation(() => Promise.resolve(mockD1ExecResult)),
    _mockPreparedStatement: mockPreparedStatement
  };

  return db as unknown as jest.Mocked<D1Database> & { _mockPreparedStatement: jest.Mocked<D1PreparedStatement> };
}

describe('DatabaseInitializer', () => {
  let mockDb: ReturnType<typeof createMockD1Database>;
  let mockEnv: Env;
  let dbInitializer: DatabaseInitializer;

  beforeEach(() => {
    // Create mock database
    mockDb = createMockD1Database();

    // Create complete mock environment
    mockEnv = {
      MICROFEED_DB: mockDb,
      MICROFEED_BUCKET: {} as any,
      MICROFEED_KV: {} as any,
      CLOUDFLARE_ACCOUNT_ID: 'test-account',
      CLOUDFLARE_PROJECT_NAME: 'test-project',
      R2_PUBLIC_BUCKET: 'test-bucket',
      R2_ACCESS_KEY_ID: 'test-key',
      R2_SECRET_ACCESS_KEY: 'test-secret'
    };

    dbInitializer = new DatabaseInitializer(mockEnv);
  });

  describe('initialize', () => {
    test('should create tables and insert default content when database is empty', async () => {
      const result = await dbInitializer.initialize();

      expect(result.success).toBe(true);
      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS feed_content'));
      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO feed_content'));
    });

    test('should only create tables when content already exists', async () => {
      // Use type assertion to ensure it matches what first() is expected to return
      mockDb._mockPreparedStatement.first.mockResolvedValueOnce({ id: '1', data: 'test' } as any);

      const result = await dbInitializer.initialize();

      expect(result.success).toBe(true);
      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS feed_content'));
      // Should not try to insert default content
      expect(mockDb.prepare).not.toHaveBeenCalledWith(expect.stringContaining('INSERT INTO feed_content'));
    });

    test('should handle table creation errors', async () => {
      const errorMessage = 'Failed to create table';
      mockDb._mockPreparedStatement.run.mockRejectedValueOnce(new Error(errorMessage));

      const result = await dbInitializer.initialize();

      expect(result.success).toBe(false);
      expect(result.error).toBe(errorMessage);
    });

    test('should handle content insertion errors', async () => {
      const errorMessage = 'Failed to insert content';
      mockDb._mockPreparedStatement.run.mockRejectedValueOnce(new Error(errorMessage));

      const result = await dbInitializer.initialize();

      expect(result.success).toBe(false);
      expect(result.error).toBe(errorMessage);
    });

    test('should create default content with correct structure', async () => {
      const result = await dbInitializer.initialize();

      expect(result.success).toBe(true);

      // Get the bind call arguments
      const bindCall = mockDb._mockPreparedStatement.bind.mock.calls[0] as string[];
      
      // Parse the stringified JSON arguments
      const insertedChannel = JSON.parse(bindCall[0]) as ChannelData;
      const insertedItems = JSON.parse(bindCall[1]) as any[];
      const insertedSettings = JSON.parse(bindCall[2]) as SettingsData;

      // Verify channel structure
      expect(insertedChannel).toMatchObject({
        title: 'My Feed',
        description: 'A new microfeed instance',
        status: 1,
        is_primary: 1,
        language: 'en',
        categories: [],
        "itunes:explicit": false,
        "itunes:type": 'episodic',
        "itunes:complete": false,
        "itunes:block": false
      });

      // Verify items is empty array
      expect(insertedItems).toEqual([]);

      // Verify settings structure
      expect(insertedSettings).toMatchObject({
        [SETTINGS_CATEGORY.WEB_GLOBAL]: {
          itemsSortOrder: 'desc',
          itemsPerPage: 10
        },
        [SETTINGS_CATEGORY.API_SETTINGS]: {
          enabled: false,
          apps: []
        },
        [SETTINGS_CATEGORY.SUBSCRIBE]: {
          methods: []
        },
        [SETTINGS_CATEGORY.ACCESS]: {
          currentPolicy: 'public'
        },
        [SETTINGS_CATEGORY.ANALYTICS]: {
          urls: []
        },
        [SETTINGS_CATEGORY.CUSTOM_CODE]: {}
      });
    });
  });
});