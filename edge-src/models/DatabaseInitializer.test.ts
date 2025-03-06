import { describe, expect, jest, test, beforeEach } from '@jest/globals';
import { Env } from '../../common-src/types/CloudflareTypes';
import { FeedContent, ChannelData, SettingsData, SETTINGS_CATEGORY } from '../../common-src/types/FeedContent';
import DatabaseInitializer from './DatabaseInitializer';

// Helper function to create a type-safe mock D1PreparedStatement
function createMockPreparedStatement() {
  return {
    bind: jest.fn(function(this: any) { return this; }) as jest.MockedFunction<D1PreparedStatement['bind']>,
    run: jest.fn().mockResolvedValue({ success: true, meta: {}, results: [] }) as jest.MockedFunction<D1PreparedStatement['run']>,
    first: jest.fn().mockResolvedValue(null) as jest.MockedFunction<D1PreparedStatement['first']>,
    all: jest.fn().mockResolvedValue({ results: [] }) as jest.MockedFunction<D1PreparedStatement['all']>,
  };
}

// Helper function to create a type-safe mock D1Database
function createMockD1Database() {
  const mockPreparedStatement = createMockPreparedStatement();
  return {
    prepare: jest.fn().mockReturnValue(mockPreparedStatement) as jest.MockedFunction<D1Database['prepare']>,
    batch: jest.fn().mockResolvedValue([{ success: true, meta: {}, results: [] }]) as jest.MockedFunction<D1Database['batch']>,
    dump: jest.fn() as jest.MockedFunction<D1Database['dump']>,
    exec: jest.fn() as jest.MockedFunction<D1Database['exec']>,
    _mockPreparedStatement: mockPreparedStatement, // For test access
  };
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
      MICROFEED_DB: mockDb as unknown as D1Database,
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
      mockDb._mockPreparedStatement.first.mockResolvedValueOnce({ id: '1', data: 'test' });

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