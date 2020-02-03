import {ITeam} from "./team";
import * as mongoose from "mongoose";
import {IPerformance} from "./performance";

export enum ComputedType {
    ALL,
    THREE_DAYS,
    FIVE_DAYS,
    TEN_DAYS
}

export enum PlayerPosition {
    None = 0,
    Goal = 1,
    Defender = 2,
    Midfield = 3,
    Striker = 4
}

export interface IComputedRating {
    rating?: number;
    goal?: number;
    penalty?: number;
    playedFromStart?: number;
    played?: number;
}
export interface IPlayer extends mongoose.Document {
    currentlyActive?: boolean;

    idMpg?: string;
    idTransferMarkt?: string;
    firstName?: string;
    lastName?: string;
    role?: number;
    position?: number;  // Seems that now some object return that
    value?: number;
    team?: ITeam;

    pictureUrl?: string;
    thumbnailUrl?: string;
    performances?: IPerformance[];

    isPenaltyGuy?: boolean;
    computed?: IComputedRating[];
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
