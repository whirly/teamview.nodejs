import {ITeam} from "./team";
import * as mongoose from "mongoose";
import {IPlayerPerformance} from "./player-performance";

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
    teamId: ITeam;

    performances?: [{
        idTeam?: string;
        day?: number;
        performance?: IPlayerPerformance;
        value?: number;
    }];
}
