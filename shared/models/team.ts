import {IPlayer} from "./player";
import {IFixture} from "./fixture";
import * as mongoose from "mongoose";

export interface ITeam extends mongoose.Document {
    idMpg?: number;
    name?: string;
    players?: IPlayer[];
    fixtures?: IFixture[];
}
