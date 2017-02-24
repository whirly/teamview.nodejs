export interface IMigration {
    name: string;

    migrate(): Promise<void>;
    rollback(): Promise<void>;
}

export const MIGRATIONS: IMigration[] = [];
