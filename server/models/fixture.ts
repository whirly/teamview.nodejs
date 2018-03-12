import mongoose, { Document, Schema } from 'mongoose';
import { IFixture } from '../../shared/models';

export interface IMongooseFixture extends IFixture, Document {}

const FixtureSchema = new Schema({
    day: { type: Number },
    idMpg: { type: String },
    home: {
        team: { type: Schema.Types.ObjectId, ref: "Team" },
        formation: { type: String },
        performances: [ { type: Schema.Types.ObjectId, ref: "Performance" }]
    },
    away: {
        team: { type: Schema.Types.ObjectId, ref: "Team" },
        formation: { type: String },
        performances: [ { type: Schema.Types.ObjectId, ref: "Performance" }]
    }
});

export const Fixture = mongoose.model<IMongooseFixture>('Fixture', FixtureSchema);
