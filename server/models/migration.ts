import mongoose, { Schema } from 'mongoose';

const MigrationSchema = new Schema({
    _id: { type: String }
});

export const Migration = mongoose.model('Migration', MigrationSchema, '_migrations');
