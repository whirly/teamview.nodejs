import { User, UserRole } from '../models';
import * as mongoose from "mongoose";


export const name = 'add_year';

export async function migrate(): Promise<void> {
    const performances = mongoose.connection.db.collection('performances');
    const fixtures = mongoose.connection.db.collection('fixtures');

    await performances.updateMany({}, { $set: { year: 2017 }});
    await fixtures.updateMany({}, { $set: { year: 2017 }});
}

export async function rollback(): Promise<void> {
    await User.remove({ $or: [{ email: 'test@test.com' }, { email: 'admin@admin.com' }] });
    await UserRole.remove({ $or: [{ name: 'user' }, { name: 'admin' }] });
}
