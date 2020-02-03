import mongoose, { Schema } from 'mongoose';
import { IPlayer } from '../../shared/models';

export interface IMongoosePlayer extends IPlayer {}


const PlayerSchema = new Schema({
    currentlyActive: { type: Boolean },

    idMpg: { type: String },
    idTransferMarkt: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    role: { type: Number },
    value: { type: Number },
    team: { type: Schema.Types.ObjectId, ref: "Team" },

    pictureUrl: { type: String },
    thumbnailUrl: { type: String },
    performances: [{ type: Schema.Types.ObjectId, ref: "Performance" }],

    computed: [{
        rating: {type: Number},
        goal: {type: Number},
        penalty: {type: Number},
        playedFromStart: {type: Number},
        played: {type: Number}
    }]

});

export const Player = mongoose.model<IMongoosePlayer>('Player', PlayerSchema);
