import { User, UserRole } from '../models';

export const name = 'create_base_users';

export async function migrate(): Promise<void> {
    const [userRole, adminRole] = await UserRole.create([
        {
            name: 'user',
            isDefault: true,
            permissions: []
        },
        {
            name: 'admin',
            permissions: ['users#create', 'users#list-read', 'users#update', 'users#delete']
        }
    ]);

    await User.create([
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
    ]);
}

export async function rollback(): Promise<void> {
    await User.remove({ $or: [{ email: 'test@test.com' }, { email: 'admin@admin.com' }] });
    await UserRole.remove({ $or: [{ name: 'user' }, { name: 'admin' }] });
}
