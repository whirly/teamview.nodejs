import { Model } from 'mongoose';
import * as models from '../models';

export const COLLECTIONS_TO_EMPTY: Array<Model<any>> = [
    models.User, models.UserRole
];

export async function createData(): Promise<void> {
    const [userRole, adminRole] = await models.UserRole.create([
        {
            name: 'user',
            isDefault: true,
            permissions: []
        },
        {
            name: 'admin',
            permissions: ['users#create', 'users#list-read', 'users#update', 'users#delete']
        }
    ] as models.IMongooseUserRole[]);

    await models.User.create([
        {
            firstName: 'Jean-Charles',
            lastName: 'Dupont',
            email: 'test@test.com',
            role: userRole._id,
            password: 'test'
        },
        {
            firstName: 'Michel',
            lastName: 'Président',
            email: 'admin@admin.com',
            role: adminRole._id,
            password: 'admin'
        }
    ] as models.IMongooseUser[]);
}
