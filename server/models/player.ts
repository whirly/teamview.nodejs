import mongoose, { Schema } from 'mongoose';
import { IPlayer } from '../../shared/models';

export interface IMongoosePlayer extends IPlayer {}

const PlayerSchema = new Schema({
    idMpg: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    role: { type: Number },
    value: { type: Number },
    team: { type: Schema.Types.ObjectId, ref: "Team" },

    performances: [{ type: Schema.Types.ObjectId, ref: "Performance" }]
});

export const Player = mongoose.model<IMongoosePlayer>('Player', PlayerSchema);
