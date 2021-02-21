import {ITeam} from "./team";
import {IPerformance} from "./performance";

export interface IFixtureSide {
    team?: ITeam;
    formation?: string;
    performances?: IPerformance[];

    median?: number;
    average?: number;
    variance?: number;
}

export interface IFixture {
    year: number;
    day: number;
    idMpg?: number;
    home?: IFixtureSide;
    away?: IFixtureSide;
}
