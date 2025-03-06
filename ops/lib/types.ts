import type { S3Client } from '@aws-sdk/client-s3';

export interface VarsReaderOptions {
  currentEnv: string;
  varsFilePath?: string;
}

export interface EnvVars {
  [key: string]: string | undefined;
}

export interface DatabaseConfig {
  binding: string;
  database_name: string;
  database_id: string;
}

export interface WranglerConfig {
  env?: {
    [key: string]: {
      d1_databases?: DatabaseConfig[];
    };
  };
  d1_databases?: DatabaseConfig[];
}

export interface CloudflareApiOptions {
  host: string;
  port: string;
  path: string;
  method: string;
  headers: {
    [key: string]: string;
  };
}

export interface CloudflareDatabase {
  uuid: string;
  name: string;
  created_at: number;
}

export interface CloudflareApiResponse {
  success: boolean;
  result?: CloudflareDatabase[] | CloudflareDatabase;
  errors?: Array<{
    code: number;
    message: string;
  }>;
  messages?: string[];
}

export interface VarDict {
  name: string;
  encrypted: boolean;
  required: boolean;
}

// Base interfaces that match the private implementations
export interface VarsReaderBase {
  get(key: string, defaultValue?: any): any;
  flattenVars(): Record<string, any>;
}

export interface WranglerCmdBase {
  _getEnvVars(): EnvVars;
  _execWranglerCmd(cmd: string): Buffer;
  publishProject(): Buffer;
  _non_dev_db(): string;
  createFeedDb(): Buffer | string;
  createFeedDbTables(): Buffer;
  createFeedDbTablesRemote(): Buffer;
  deleteDatabase(databaseId: string, onSuccess: (success: boolean) => void): void;
  createDatabaseViaApi(onSuccess: (result: { uuid: string; name: string } | null) => void): void;
  getDatabaseId(onSuccess: (databaseId: string) => void): void;
}

export interface InitProject {
  currentEnv: string;
  v: VarsReaderBase;
  _getCurrentProject(data: any, onProjectExists: (json: any) => void, onCreateProject: () => void): void;
  _createProject(data: any, onSuccess: (json: any) => void): void;
  initProject(): void;
}

export interface SetupR2 {
  v: VarsReaderBase;
  endpoint: string;
  s3: S3Client;
  _setupBucket(bucket: string): Promise<void>;
  setupR2(): Promise<void>;
}

export interface SyncProjectConfig {
  currentEnv: string;
  v: VarsReaderBase;
  cmd: WranglerCmdBase;
  _getEnvVarsFromFilesJson(envName: string, databaseId: string): Record<string, any>;
  _updateEnvVars(data: string, onSuccess: (json: any) => void): void;
  syncEnvVars(): void;
}