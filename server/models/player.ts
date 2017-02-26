import mongoose, { Document, Schema } from 'mongoose';
import { IPlayer } from '../../shared/models';
export interface IMongoosePlayer extends IPlayer, Document {}

const PlayerSchema = new Schema({
    idMpg: { type: Number },
    firstName: { type: String },
    lastName: { type: String },
    role: { type: String },

    performances: [{
        day: { type: Number },
        performance: { type: Schema.Types.ObjectId, ref: "PlayerPerformance" },
        value: { type: Number }
    }]
});

export const Player = mongoose.model<IMongoosePlayer>('Player', PlayerSchema );
