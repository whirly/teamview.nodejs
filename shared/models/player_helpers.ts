import {IPlayer, IPlayerExtended} from "./player";
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

export function isSub( player: IPlayer, day: number ): boolean {
    const performance: IPerformance = player.performances.find((performanceThis: IPerformance) => {
        return performanceThis.day == day;
    });

    return performance && performance.sub;
}

export function wasReplaced( player: IPlayer, day: number ): boolean {
    const performance: IPerformance = player.performances.find((performanceThis: IPerformance) => {
        return performanceThis.day == day;
    });

    return performance && performance.minutes < 90 && !performance.sub;
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

export function getPenaltyFor(player: IPlayer): number {
    const sum: number = _.reduce(player.performances, (aggregate: number, performance: IPerformance) => {
        return aggregate + performance.penaltyFor;
    }, 0);

    return sum;
}

export function getGoalAgainst(player: IPlayer): number {
    const sum: number = _.reduce(player.performances, (aggregate: number, performance: IPerformance) => {
        return aggregate + performance.goalAgainst;
    }, 0);

    return sum;
}

export function initializeExtendedData(player: IPlayerExtended, numberOfFixtures: number ) {

    player.averagePerformance = getAveragePerformance(player);
    player.totalGoalFor = getGoalFor(player);
    player.totalGoalAgainst = getGoalAgainst(player);
    player.totalPenaltyFor = getPenaltyFor(player);

    if (player.team) {

        let played: number = 0;
        let played_as_sub: number = 0;

        _.each(player.performances, (performance: IPerformance) => {
            if (!performance.sub) played += 1;
            else played_as_sub += 1;
        });

        player.titularisation = 100 * ( played / numberOfFixtures );
        player.participation = 100 * (( played + played_as_sub ) / numberOfFixtures );
    } else {
        player.titularisation = 0;
        player.titularisation = 0;
    }
}
