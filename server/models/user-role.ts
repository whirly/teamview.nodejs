import mongoose, { Document, Schema } from 'mongoose';
import { IUserRole } from '../../shared/models';

export interface IMongooseUserRole extends IUserRole, Document {
}

const UserRoleSchema = new Schema({
    name: { type: String, unique: true, index: true },

    permissions: { type: [String] },

    isDefault: { type: Boolean, default: false }
});

export const UserRole = mongoose.model<IMongooseUserRole>('UserRole', UserRoleSchema);
