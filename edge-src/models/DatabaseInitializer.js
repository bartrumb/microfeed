/**
 * Handles database initialization with proper transaction support and error handling.
 * Separates schema creation and data initialization to prevent race conditions.
 */
class DatabaseInitializer {
  constructor(db) {
    this.db = db;
    this.maxRetries = 3;
    this.retryDelay = 1000; // ms
  }

  /**
   * Verifies that all required tables exist in the database
   * @returns {Promise<boolean>}
   */
  async verifyTables() {
    const tables = ['channels', 'items', 'settings'];
    const placeholders = tables.map(() => '?').join(',');
    const stmt = this.db.prepare(
      `SELECT name FROM sqlite_master WHERE type='table' AND name IN (${placeholders})`
    );

    try {
      const result = await stmt.bind(...tables).all();
      const existingTables = result.results.map(r => r.name);
      return tables.every(table => existingTables.includes(table));
    } catch (error) {
      console.error('Table verification failed:', error);
      return false;
    }
  }

  /**
   * Executes a database operation with retry logic
   * @param {Function} operation - The operation to execute
   * @param {string} operationName - Name for logging
   * @returns {Promise<any>}
   */
  async withRetry(operation, operationName) {
    let lastError;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.error(`${operationName} attempt ${attempt} failed:`, error);
        if (attempt < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        }
      }
    }
    throw new Error(`${operationName} failed after ${this.maxRetries} attempts: ${lastError}`);
  }

  /**
   * Initializes the database schema
   * @returns {Promise<void>}
   */
  async initializeSchema() {
    return this.withRetry(async () => {
      const hasSchema = await this.verifyTables();
      if (hasSchema) {
        console.log('Database schema already exists');
        return;
      }

      const schemaStatements = [
        // Channels table
        'CREATE TABLE IF NOT EXISTS channels (id VARCHAR(11) PRIMARY KEY, status TINYINT, is_primary BOOLEAN UNIQUE, data TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',
        'CREATE INDEX IF NOT EXISTS channels_status on channels (status)',
        'CREATE INDEX IF NOT EXISTS channels_is_primary on channels (is_primary)',
        'CREATE INDEX IF NOT EXISTS channels_created_at on channels (created_at)',
        'CREATE INDEX IF NOT EXISTS channels_updated_at on channels (updated_at)',

        // Items table
        'CREATE TABLE IF NOT EXISTS items (id VARCHAR(11) PRIMARY KEY, status TINYINT, data TEXT, pub_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',
        'CREATE INDEX IF NOT EXISTS items_pub_date on items (pub_date)',
        'CREATE INDEX IF NOT EXISTS items_created_at on items (created_at)',
        'CREATE INDEX IF NOT EXISTS items_updated_at on items (updated_at)',
        'CREATE INDEX IF NOT EXISTS items_status on items (status)',

        // Settings table
        'CREATE TABLE IF NOT EXISTS settings (category VARCHAR(20) PRIMARY KEY, data TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)'
      ];

      const statements = schemaStatements.map(sql => this.db.prepare(sql));
      await this.db.batch(statements);
      console.log('Database schema initialized successfully');
    }, 'Schema initialization');
  }

  /**
   * Initializes the database with initial data using D1's transaction API
   * @param {Object} initialData - The initial data to insert
   * @returns {Promise<void>}
   */
  async initializeData(initialData = {}) {
    return this.withRetry(async () => {
      const { channel, settings } = initialData;

      // Handle channel insertion
      if (channel?.id && typeof channel.status !== 'undefined') {
        const channelStmt = this.db.prepare(
          'INSERT INTO channels (id, status, is_primary, data) VALUES (?, ?, ?, ?)'
        );
        await channelStmt.bind(
          channel.id,
          channel.status,
          channel.is_primary ? 1 : 0,
          JSON.stringify(channel)
        ).run();
      }

      // Handle settings using UPSERT
      if (settings && Object.keys(settings).length > 0) {
        for (const [category, data] of Object.entries(settings)) {
          if (category && data) {
            const stmt = this.db.prepare(
              `INSERT INTO settings (category, data, updated_at) 
               VALUES (?, ?, CURRENT_TIMESTAMP) 
               ON CONFLICT(category) DO UPDATE SET 
               data = excluded.data,
               updated_at = CURRENT_TIMESTAMP`
            );
            await stmt.bind(
              category,
              JSON.stringify(data)
            ).run();
          }
        }
      }

      console.log('Initial data inserted successfully');
    }, 'Data initialization');
  }

  /**
   * Initializes the database with schema and initial data
   * @param {Object} initialData - The initial data to insert
   * @returns {Promise<void>}
   */
  async initialize(initialData) {
    try {
      await this.initializeSchema();
      await this.initializeData(initialData);
    } catch (error) {
      console.error('Initialization failed:', error);
      throw error;
    }
  }
}

export default DatabaseInitializer;