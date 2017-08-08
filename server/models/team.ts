import mongoose, { Document, Schema } from 'mongoose';
import { ITeam } from '../../shared/models';
export interface IMongooseTeam extends ITeam, Document {}

const TeamSchema = new Schema({
    idMpg: { type: String },
    name: { type: String },
    players: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
    fixtures: [{ type: Schema.Types.ObjectId, ref: 'Fixture' }]
});

export const Team = mongoose.model<IMongooseTeam>( 'Team', TeamSchema );
