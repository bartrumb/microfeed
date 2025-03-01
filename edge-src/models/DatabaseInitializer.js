/**
 * Handles database initialization with proper transaction support and error handling.
 * Separates schema creation and data initialization to prevent race conditions.
 */
class DatabaseInitializer {
  constructor(db) {
    this.db = db;
    this.maxRetries = 3;
    this.isDevelopment = globalThis.ENVIRONMENT === 'development';
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
      const missingTables = tables.filter(table => !existingTables.includes(table));
      
      this.log('Database state', {
        existingTables,
        missingTables,
        allTablesExist: missingTables.length === 0,
        timestamp: new Date().toISOString()
      });
      
      return tables.every(table => existingTables.includes(table));
    } catch (error) {
      this.logError('Table verification failed:', { error, tables, timestamp: new Date().toISOString() });
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
        this.logError(`${operationName} attempt ${attempt} failed:`, {
          error,
          attempt,
          maxRetries: this.maxRetries,
          retryDelay: this.retryDelay * attempt,
          timestamp: new Date().toISOString()
        });
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
        this.log('Database schema verification complete', { status: 'Schema exists' });
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
      this.log('Database schema initialized', {
        tableCount: schemaStatements.length,
        timestamp: new Date().toISOString()
      });
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

      this.log('Starting data initialization', {
        hasChannel: !!channel,
        settingsCategories: settings ? Object.keys(settings) : [],
        timestamp: new Date().toISOString()
      });

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
        this.log('Channel initialized', {
          channelId: channel.id,
          isPrimary: channel.is_primary
        });
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
            this.log('Setting initialized', {
              category,
              dataKeys: Object.keys(data)
            });
          }
        }
      }

      this.log('Data initialization complete', { timestamp: new Date().toISOString() });
      
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
      await this.validateInitialization(initialData);
    } catch (error) {
      this.logError('Database initialization failed', {
        error,
        hasInitialData: !!initialData,
        timestamp: new Date().toISOString(),
        cause: error.cause || 'Unknown cause'
      });
      throw new Error(`Database initialization failed: ${error.message}`, { cause: error });
    }
  }

  /**
   * Validates the database initialization by checking data integrity
   * @param {Object} initialData - The initial data that was inserted
   * @returns {Promise<void>}
   */
  async validateInitialization(initialData) {
    this.log('Starting initialization validation', { 
      hasChannel: !!initialData.channel,
      hasSettings: !!initialData.settings
    });
    
    try {
      // Validate tables exist
      const tablesExist = await this.verifyTables();
      if (!tablesExist) {
        throw new Error('Table validation failed: Required tables are missing');
      }

      // Validate channel data if provided
      if (initialData.channel?.id) {
        const channelStmt = this.db.prepare('SELECT * FROM channels WHERE id = ?');
        const channelResult = await channelStmt.bind(initialData.channel.id).first();
        
        if (!channelResult) {
          throw new Error(`Channel validation failed: Channel ${initialData.channel.id} not found`);
        }

        const channelData = JSON.parse(channelResult.data);
        if (channelData.id !== initialData.channel.id) {
          throw new Error('Channel validation failed: Data mismatch');
        }
      }

      // Validate settings if provided
      if (initialData.settings) {
        for (const [category, settingData] of Object.entries(initialData.settings)) {
          const settingStmt = this.db.prepare('SELECT * FROM settings WHERE category = ?');
          const settingResult = await settingStmt.bind(category).first();

          if (!settingResult) {
            throw new Error(`Settings validation failed: Category ${category} not found`);
          }

          const storedData = JSON.parse(settingResult.data);
          if (!storedData || JSON.stringify(storedData) !== JSON.stringify(settingData)) {
            throw new Error(`Settings validation failed: Invalid data for category ${category}`);
          }
        }
      }

      this.log('Initialization validation complete', { 
        status: 'All checks passed',
        validatedChannel: !!initialData.channel,
        validatedSettings: !!initialData.settings
      });
    } catch (error) {
      this.logError('Initialization validation failed', { error });
      throw error;
    }
  }

  /**
   * Logs a message with development-specific formatting
   * @param {string} message - The message to log
 with optional data
   * @param {Object} [metadata] - Additional metadata to log
   */
  log(message, metadata = {}) {
    if (this.isDevelopment || globalThis.DEBUG) {
      console.log(`[D1 Init] ${message}`, { ...metadata, timestamp: new Date().toISOString() });
    }
  }

  /**
   * Logs an error with development-specific formatting
   * @param {string} message - The error message
   * @param {Object} [metadata] - Additional error metadata
   */
  logError(message, metadata = {}) {
    console.error(`[D1 Init Error] ${message}`, { ...metadata, env: globalThis.ENVIRONMENT });
  }
}

export default DatabaseInitializer;