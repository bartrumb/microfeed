export declare class VarsReader {
    private data: any;
    private currentEnv: string;
    constructor(currentEnv: string, varsFilePath?: string);
    get(key: string, defaultValue?: any): any;
    flattenVars(): Record<string, any>;
}

export declare class WranglerCmd {
    private currentEnv: string;
    private v: VarsReader;
    constructor(currentEnv: string);
    _getEnvVars(): Record<string, string>;
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