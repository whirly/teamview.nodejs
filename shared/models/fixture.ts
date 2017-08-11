import {ITeam} from "./team";
import {IPerformance} from "./performance";

export interface IFixtureSide {
    team?: ITeam;
    formation?: string;
    performances: IPerformance[];
}

export interface IFixture {
    day: number;
    idMpg?: number;
    home?: IFixtureSide;
    away?: IFixtureSide;
}
