import {ITeam} from "./team";
import * as mongoose from "mongoose";
import {IPerformance} from "./performance";

export enum PlayerPosition {
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
    value?: number;
    team?: ITeam;

    performances?: IPerformance[];
}