import {ITeam} from "./team";
import {IPlayer} from "./player";
import {IPlayerPerformance} from "./player-performance";

export interface IFixturePlayer {
    player: IPlayer;
    playerPerformance: IPlayerPerformance;
}

export interface IFixtureSide {
    team?: ITeam;
    formation?: String;
    players: IFixturePlayer[]
}

export interface IFixture {
    idMpg?: number;
    home?: IFixtureSide,
    away?: IFixtureSide
}
