import {ITeam} from "./team";
import * as mongoose from "mongoose";
import {IPerformance} from "./performance";

export enum PlayerPosition {
    None = 0,
    Goal = 1,
    Defender = 2,
    Midfield = 3,
    Striker = 4
}

export interface IPlayer extends mongoose.Document {
    idMpg?: string;
    firstName?: string;
    lastName?: string;
    role?: number;
    position?: number;  // Seems that now some object return that
    value?: number;
    team?: ITeam;

    performances?: IPerformance[];
}

export interface IPlayerExtended extends IPlayer {
    averagePerformance?: number;
    flashPerformance?: number;
    totalGoalFor?: number;
    totalPenaltyFor?: number;
    totalGoalAgainst?: number;
    participation?: number;
    titularisation?: number;
}
