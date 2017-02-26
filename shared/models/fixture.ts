import {ITeam} from "./team";
import {IPlayer} from "./player";
import {IPlayerPerformance} from "./player-performance";

export interface IFixture {
    idMpg?: number;
    home?: {
        team?: ITeam;
        formation?: String;
        players: [{
            player: IPlayer;
            playerPerformance?: IPlayerPerformance;
        }]
    }
}
