/* eslint-env jest */
import DatabaseInitializer from './DatabaseInitializer';

describe('DatabaseInitializer', () => {
  let mockDb;
  let dbInitializer;

  beforeEach(() => {
    // Mock D1 database methods
    mockDb = {
      prepare: jest.fn().mockReturnThis(),
      bind: jest.fn().mockReturnThis(),
      all: jest.fn(),
      run: jest.fn(),
      batch: jest.fn(),
    };
    dbInitializer = new DatabaseInitializer(mockDb);
  });

  describe('verifyTables', () => {
    it('should return true when all required tables exist', async () => {
      mockDb.all.mockResolvedValue({
        results: [
          { name: 'channels' },
          { name: 'items' },
          { name: 'settings' }
        ]
      });

      const result = await dbInitializer.verifyTables();
      expect(result).toBe(true);
      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining("SELECT name FROM sqlite_master")
      );
    });

    it('should return false when tables are missing', async () => {
      mockDb.all.mockResolvedValue({
        results: [{ name: 'channels' }]
      });

      const result = await dbInitializer.verifyTables();
      expect(result).toBe(false);
    });

    it('should handle errors during verification', async () => {
      mockDb.all.mockRejectedValue(new Error('DB Error'));

      const result = await dbInitializer.verifyTables();
      expect(result).toBe(false);
    });
  });

  describe('withRetry', () => {
    it('should retry failed operations', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValueOnce('success');

      const result = await dbInitializer.withRetry(operation, 'test operation');
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Persistent failure'));

      await expect(dbInitializer.withRetry(operation, 'test operation'))
        .rejects
        .toThrow('test operation failed after 3 attempts');
    });
  });

  describe('initializeSchema', () => {
    it('should skip schema creation if tables exist', async () => {
      mockDb.all.mockResolvedValue({
        results: [
          { name: 'channels' },
          { name: 'items' },
          { name: 'settings' }
        ]
      });

      await dbInitializer.initializeSchema();
      expect(mockDb.batch).not.toHaveBeenCalled();
    });

    it('should create schema if tables do not exist', async () => {
      mockDb.all.mockResolvedValue({ results: [] });
      mockDb.batch.mockResolvedValue([]);

      await dbInitializer.initializeSchema();
      expect(mockDb.batch).toHaveBeenCalled();
      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS channels')
      );
    });
  });

  describe('initializeData', () => {
    const mockInitialData = {
      channel: {
        id: 'test-id',
        status: 1,
        is_primary: 1,
        data: {}
      },
      settings: {
        category1: { setting: 'value1' },
        category2: { setting: 'value2' }
      }
    };

    it('should insert initial data within a transaction', async () => {
      mockDb.run.mockResolvedValue({});
      
      await dbInitializer.initializeData(mockInitialData);

      // Verify transaction handling
      expect(mockDb.prepare).toHaveBeenCalledWith('BEGIN TRANSACTION');
      expect(mockDb.prepare).toHaveBeenCalledWith('COMMIT');
      
      // Verify data insertion
      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO channels')
      );
      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO settings')
      );
    });

    it('should rollback transaction on error', async () => {
      mockDb.run.mockRejectedValue(new Error('Insert failed'));
      
      await expect(dbInitializer.initializeData(mockInitialData))
        .rejects
        .toThrow('Insert failed');

      expect(mockDb.prepare).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('initialize', () => {
    const mockInitialData = {
      channel: { id: 'test-id', status: 1 },
      settings: { category: { setting: 'value' } }
    };

    it('should perform complete initialization', async () => {
      mockDb.all.mockResolvedValue({ results: [] });
      mockDb.batch.mockResolvedValue([]);
      mockDb.run.mockResolvedValue({});

      await dbInitializer.initialize(mockInitialData);

      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS')
      );
      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO')
      );
    });

    it('should handle initialization failures', async () => {
      mockDb.prepare.mockImplementation(() => { throw new Error('Schema creation failed'); });

      await expect(dbInitializer.initialize(mockInitialData))
        .rejects
        .toThrow('Schema creation failed');
    });
  });
});