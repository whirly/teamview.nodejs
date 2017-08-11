import mongoose, { Document, Schema } from 'mongoose';
import { IPerformance } from '../../shared/models';
export interface IMongoosePerformance extends IPerformance, Document {}

const PerformanceSchema = new Schema({
    player: { type: Schema.Types.ObjectId, ref: 'Player' },
    team: { type: Schema.Types.ObjectId, ref: 'Team' },
    day: { type: Number },
    position: { type: String },
    place: { type: Number },
    rate: { type: Number },
    goalFor: { type: Number },
    goalAgainst: { type: Number },
    cardYellow: { type: Boolean },
    cardRed: { type: Boolean },
    sub: { type: Boolean }
});

export const Performance = mongoose.model<IMongoosePerformance>( 'Performance', PerformanceSchema );
