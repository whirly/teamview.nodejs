import mongoose, { Document, Schema } from 'mongoose';
import { IFixture } from '../../shared/models';

export interface IMongooseFixture extends IFixture, Document {}

const FixtureSchema = new Schema({
    year: { type: Number },
    day: { type: Number },
    idMpg: { type: String },
    home: {
        team: { type: Schema.Types.ObjectId, ref: "Team" },
        formation: { type: String },
        performances: [ { type: Schema.Types.ObjectId, ref: "Performance" }],
        median: { type: Number },
        variance: { type: Number },
        average: { type: Number }
    },
    away: {
        team: { type: Schema.Types.ObjectId, ref: "Team" },
        formation: { type: String },
        performances: [ { type: Schema.Types.ObjectId, ref: "Performance" }],
        median: { type: Number },
        variance: { type: Number },
        average: { type: Number }
    }
});

export const Fixture = mongoose.model<IMongooseFixture>('Fixture', FixtureSchema);
