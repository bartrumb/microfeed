import { Env } from '../../common-src/types/CloudflareTypes';
import { FeedContent } from '../../common-src/types/FeedContent';
import FeedDb from './FeedDb';
import { STATUSES } from '../../common-src/Constants';

// Mock types
interface MockD1Database extends D1Database {
  prepare: jest.Mock;
  bind: jest.Mock;
  all: jest.Mock;
  run: jest.Mock;
  batch: jest.Mock;
}

interface MockEnv extends Partial<Env> {
  FEED_DB: MockD1Database;
}

describe('FeedDb', () => {
  let mockDb: MockD1Database;
  let mockEnv: MockEnv;
  let mockRequest: Partial<Request>;
  let feedDb: FeedDb;

  beforeEach(() => {
    mockDb = {
      prepare: jest.fn().mockReturnThis(),
      bind: jest.fn().mockReturnThis(),
      all: jest.fn(),
      run: jest.fn(),
      batch: jest.fn(),
    } as MockD1Database;

    mockEnv = {
      FEED_DB: mockDb
    };

    mockRequest = {
      url: 'https://example.com'
    };

    feedDb = new FeedDb(mockEnv as Env, mockRequest as Request);
  });

  describe('verifyDatabaseState', () => {
    it('should return true when all tables exist and are accessible', async () => {
      mockDb.all.mockResolvedValue({
        results: [{ name: 'test_table' }]
      });

      const result = await (feedDb as any).verifyDatabaseState();
      expect(result).toBe(true);
      expect(mockDb.prepare).toHaveBeenCalledTimes(3); // One call per table
    });

    it('should return false and log error when tables are missing', async () => {
      mockDb.all.mockResolvedValue({
        results: []
      });
      console.error = jest.fn();

      const result = await (feedDb as any).verifyDatabaseState();
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'Database state validation failed:',
        expect.objectContaining({
          missingTables: ['channels', 'items', 'settings']
        })
      );
    });

    it('should return false and log error when verification fails', async () => {
      mockDb.all.mockRejectedValue(new Error('Database error'));
      console.error = jest.fn();

      const result = await (feedDb as any).verifyDatabaseState();
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'Table verification failed for channels:',
        expect.any(Error)
      );
    });
  });

  describe('_getContent', () => {
    interface MockThing {
      table: string;
      queryKwargs: {
        status: number;
        is_primary: number;
      };
    }

    const mockThings: MockThing[] = [
      {
        table: 'channels',
        queryKwargs: {
          status: STATUSES.PUBLISHED,
          is_primary: 1
        }
      }
    ];

    it('should validate database state before querying', async () => {
      jest.spyOn(feedDb as any, 'verifyDatabaseState').mockResolvedValue(false);
      
      await expect((feedDb as any)._getContent(mockThings))
        .rejects
        .toThrow('Database state validation failed');
    });

    it('should log detailed error information on query failure', async () => {
      jest.spyOn(feedDb as any, 'verifyDatabaseState').mockResolvedValue(true);
      mockDb.batch.mockRejectedValue(new Error('Query failed'));
      console.error = jest.fn();

      await expect((feedDb as any)._getContent(mockThings))
        .rejects
        .toThrow('Database query failed: Query failed');

      expect(console.error).toHaveBeenCalledWith(
        'Database query failed:',
        expect.objectContaining({
          error: expect.any(Error),
          sqlStatements: expect.any(Array),
          timestamp: expect.any(String),
          tables: ['channels']
        })
      );
    });

    it('should execute queries when database state is valid', async () => {
      jest.spyOn(feedDb as any, 'verifyDatabaseState').mockResolvedValue(true);
      mockDb.batch.mockResolvedValue([
        {
          results: [{
            id: 'test',
            status: STATUSES.PUBLISHED,
            is_primary: 1,
            data: '{}'
          }]
        }
      ]);

      const result = await (feedDb as any)._getContent(mockThings);
      expect(result).toHaveProperty('channel');
    });
  });
});