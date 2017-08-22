import {IPlayer} from "./player";
import {IPerformance} from "./performance";

import * as _ from "lodash";

export function getAveragePerformance(player: IPlayer): number {

    const sum: number = _.reduce(player.performances, (aggregate: number, performance: IPerformance) => {
        return aggregate + performance.rate;
    }, 0);

    return Math.floor(sum * 100 / player.performances.length) / 100;
}

export function hasScored(player: IPlayer, day: number): boolean {
    const performance: IPerformance = player.performances.find((performanceThis: IPerformance) => {
        return performanceThis.day == day;
    });

    return performance && ( performance.goalFor > 0 );
}

export function hasYellowCard(player: IPlayer, day: number): boolean {
    const performance: IPerformance = player.performances.find((performanceThis: IPerformance) => {
        return performanceThis.day == day;
    });

    return performance && performance.cardYellow;
}

export function hasRedCard(player: IPlayer, day: number): boolean {
    const performance: IPerformance = player.performances.find((performanceThis: IPerformance) => {
        return performanceThis.day == day;
    });

    return performance && performance.cardRed;
}

export function getGoalForDay(player: IPlayer, day: number): number {
    const performance: IPerformance = player.performances.find((performanceThis: IPerformance) => {
        return performanceThis.day == day;
    });

    if (performance) {
        return performance.goalFor;
    }
    else {
        return 0;
    }
}

export function hasScoredAgainst(player: IPlayer, day: number): boolean {
    const performance: IPerformance = player.performances.find((performanceThis: IPerformance) => {
        return performanceThis.day == day;
    });

    return performance && ( performance.goalAgainst > 0 );
}

export function getGoalAgainstForDay(player: IPlayer, day: number): number {
    const performance: IPerformance = player.performances.find((performanceThis: IPerformance) => {
        return performanceThis.day == day;
    });

    if (performance) {
        return performance.goalAgainst;
    }
    else {
        return 0;
    }
}

export function getGoalFor(player: IPlayer): number {
    const sum: number = _.reduce(player.performances, (aggregate: number, performance: IPerformance) => {
        return aggregate + performance.goalFor;
    }, 0);

    return sum;
}

export function getGoalAgainst(player: IPlayer): number {
    const sum: number = _.reduce(player.performances, (aggregate: number, performance: IPerformance) => {
        return aggregate + performance.goalAgainst;
    }, 0);

    return sum;
}
