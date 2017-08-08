import mongoose, { Document, Schema } from 'mongoose';
import { IFixture } from '../../shared/models';

export interface IMongooseFixture extends IFixture, Document {}

const FixtureSchema = new Schema({
    day: { type: Number },
    idMpg: { type: Number },
    home: {
        team: { type: Schema.Types.ObjectId, ref: "Team" },
        formation: { type: String },
        players: [{
            player: { type: Schema.Types.ObjectId, ref: "Player" },
            playerPerformance: { type: Schema.Types.ObjectId, ref: "PlayerPerformance" }
        }]
    },
    away: {
        team: { type: Schema.Types.ObjectId, ref: "Team" },
        formation: { type: String },
        players: [{
            player: { type: Schema.Types.ObjectId, ref: "Player" },
            playerPerformance: { type: Schema.Types.ObjectId, ref: "PlayerPerformance" }
        }]
    }
});

export const Fixture = mongoose.model<IMongooseFixture>( 'Fixture', FixtureSchema );

