import {ITeam} from "./team";
import {IPerformance} from "./performance";

export interface IFixtureSide {
    team?: ITeam;
    formation?: String;
    performances: IPerformance[]
}

export interface IFixture {
    idMpg?: number;
    home?: IFixtureSide,
    away?: IFixtureSide
}
