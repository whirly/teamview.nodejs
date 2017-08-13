import {IPlayer} from "./player";
import {IPerformance} from "./performance";

import * as _ from "lodash";

export function getAveragePerformance(player: IPlayer  ): number {

    let sum: number = _.reduce( player.performances, ( aggregate: number, performance: IPerformance  ) => {
        return aggregate + performance.rate;
    }, 0 );

    return sum / player.performances.length;
}

export function getGoalFor( player: IPlayer ): number {
    let sum: number = _.reduce( player.performances, ( aggregate: number, performance: IPerformance ) => {
        return aggregate + performance.goalFor;
    }, 0);

    return sum;
}

export function getGoalAgainst( player: IPlayer ): number {
    let sum: number = _.reduce( player.performances, ( aggregate: number, performance: IPerformance ) => {
        return aggregate + performance.goalAgainst;
    }, 0);

    return sum;
}
