import bcrypt from 'bcryptjs';
import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from '../../shared/models';

// tslint:disable:only-arrow-functions

const BCRYPT_SALT_ROUNDS = 13; // strong, but not too much, ~1 hash/sec

//=> Interface and schema
//-----------------------
export interface IMongooseUser extends IUser, Document {
    hasPermission(permission: string): boolean;
    hasPermissions(...permissions: string[]): boolean;

    hashPassword(password: string): Promise<string>;
    verifyPassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema({
    email: { type: String, lowercase: true, required: true, unique: true, index: true },

    firstName: { type: String },

    lastName: { type: String },

    role: { type: Schema.Types.ObjectId, ref: 'UserRole' },

    password: { type: String, required: true }
});

UserSchema.pre('save', async function(this: IMongooseUser, next): Promise<void> {
    if (this.isNew || this.isModified('password')) {
        this.password = await this.hashPassword(this.password);
    }

    next();
});

//=> Model methods
//----------------

UserSchema.methods.hashPassword = async function(this: IMongooseUser, password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
};

UserSchema.methods.verifyPassword = async function(this: IMongooseUser, password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};

UserSchema.methods.hasPermission = function(this: IMongooseUser, permission: string): boolean {
    return this.role.permissions.includes(permission);
};

UserSchema.methods.hasPermissions = function(this: IMongooseUser, ...permissions: string[]): boolean {
    for (const permission of permissions) {
        if (!this.role.permissions.includes(permission)) return false;
    }

    return true;
};

export const User = mongoose.model<IMongooseUser>('User', UserSchema);
