import mongoose, { Document, Schema } from 'mongoose';
import { ITeam } from '../../shared/models';
export interface IMongoosePlayer extends ITeam, Document {}

const TeamSchema = new Schema({
    idMpg: { type: Number },
    players: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
    fixtures: [{ type: Schema.Types.ObjectId, ref: 'Fixture' }]
});

export const Team = mongoose.model<IMongoosePlayer>( 'Team', TeamSchema );
