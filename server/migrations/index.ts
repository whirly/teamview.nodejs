import * as Migration01CreateBaseUsers from './01_create_base_users';

export interface IMigration {
    name: string;

    migrate(): Promise<void>;
    rollback(): Promise<void>;
}

export const Migrations: IMigration[] = [
    Migration01CreateBaseUsers
];
