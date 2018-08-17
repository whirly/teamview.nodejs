import * as Migration01CreateBaseUsers from './01_create_base_users';
import * as Migration02AddYear from './02_add_year';

export interface IMigration {
    name: string;

    migrate(): Promise<void>;
    rollback(): Promise<void>;
}

export const Migrations: IMigration[] = [
    Migration01CreateBaseUsers,
    Migration02AddYear,
];
