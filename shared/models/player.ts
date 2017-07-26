import {ITeam} from "./team";
import * as mongoose from "mongoose";

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
        day?: number;
        rate?: number;
        goalFor?: number;
        goalAgainst?: number;
        value?: number;
    }];
}
