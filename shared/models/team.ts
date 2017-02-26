import {IPlayer} from "./player";
import {IFixture} from "./fixture";

export interface ITeam {
    idMpg?: number;
    name?: string;
    players?: [ IPlayer ];
    fixtures?: [ IFixture ];
}
