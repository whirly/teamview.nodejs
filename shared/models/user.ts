import { IUserRole } from './user-role';

export interface IUser {
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: IUserRole;
    password: string;
}
