import mongoose, { Document, Schema } from 'mongoose';
import { ITeam } from '../../shared/models';
export interface IMongooseTeam extends ITeam, Document {}

const TeamSchema = new Schema({
    idMpg: { type: Number },
    name: { type: String },
    players: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
    fixtures: [{ type: Schema.Types.ObjectId, ref: 'Fixture' }]
});

export const Team = mongoose.model<IMongooseTeam>( 'Team', TeamSchema );
