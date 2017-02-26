import mongoose, { Document, Schema } from 'mongoose';
import { IPlayerPerformance } from '../../shared/models';
export interface IMongoosePlayerPerformance extends IPlayerPerformance, Document {}

const PlayerPerformanceSchema = new Schema({
    position: { type: String },
    place: { type: Number },
    rate: { type: Number },
    goalFor: { type: Number },
    goalAgainst: { type: Number },
});

export const PlayerPerformance = mongoose.model<IMongoosePlayerPerformance>( 'PlayerPerformance', PlayerPerformanceSchema );
