import {ITeam} from "./team";
export enum PlayerPosition {
    Goal = 1,
    Defender = 2,
    Midfield = 3,
    Striker = 4
}

export interface IPlayer {
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
