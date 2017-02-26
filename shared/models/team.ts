import {IPlayer} from "./player";
import {IFixture} from "./fixture";

export interface ITeam {
    idMpg?: number;
    players?: [ IPlayer ];
    fixtures?: [ IFixture ];
}
