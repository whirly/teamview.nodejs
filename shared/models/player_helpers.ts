import {IPlayer, IPlayerExtended} from "./player";
import {IPerformance} from "./performance";

import * as _ from "lodash";

export function hasScored(player: IPlayer, day: number): boolean {
    const performance: IPerformance = player.performances.find((performanceThis: IPerformance) => {
        return performanceThis.day == day;
    });

    return performance && (performance.goalFor > 0);
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

export function isSub(player: IPlayer, day: number): boolean {
    const performance: IPerformance = player.performances.find((performanceThis: IPerformance) => {
        return performanceThis.day == day;
    });

    return performance && performance.sub;
}

export function wasReplaced(player: IPlayer, day: number): boolean {
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
    } else {
        return 0;
    }
}

export function hasScoredAgainst(player: IPlayer, day: number): boolean {
    const performance: IPerformance = player.performances.find((performanceThis: IPerformance) => {
        return performanceThis.day == day;
    });

    return performance && (performance.goalAgainst > 0);
}

export function getGoalAgainstForDay(player: IPlayer, day: number): number {
    const performance: IPerformance = player.performances.find((performanceThis: IPerformance) => {
        return performanceThis.day == day;
    });

    if (performance) {
        return performance.goalAgainst;
    } else {
        return 0;
    }
}

export function getRateFor(player: IPlayer, day: number): number {
    const performance: IPerformance = player.performances.find((performanceThis: IPerformance) => {
        return performanceThis.day == day;
    });

    if (performance && performance.minutes > 0) {
        return performance.rate;
    } else {
        return 0;
    }
}

export function getMinutesFor(player: IPlayer, day: number): number {
    const performance: IPerformance = player.performances.find((performanceThis: IPerformance) => {
        return performanceThis.day == day;
    });

    if (performance) {
        return performance.minutes;
    } else {
        return 0;
    }
}

export function getGoalFor(player: IPlayer, fromDay: number): number {
    const sum: number = _.reduce(player.performances, (aggregate: number, performance: IPerformance) => {
        if (performance.day >= fromDay) return aggregate + performance.goalFor;
        else return aggregate;
    }, 0);

    return sum;
}

export function getPenaltyFor(player: IPlayer, fromDay: number): number {
    const sum: number = _.reduce(player.performances, (aggregate: number, performance: IPerformance) => {
        if (performance.day >= fromDay) return aggregate + performance.penaltyFor;
        else return aggregate;
    }, 0);

    return sum;
}

export function getGoalAgainst(player: IPlayer, fromDay: number): number {
    const sum: number = _.reduce(player.performances, (aggregate: number, performance: IPerformance) => {
        if (performance.day >= fromDay) return aggregate + performance.goalAgainst;
        else return aggregate;
    }, 0);

    return sum;
}

export function getAveragePerformance(player: IPlayer, fromDay: number): number {

    let totalPerformances: number = 0;

    const sum: number = _.reduce(player.performances, (aggregate: number, performance: IPerformance) => {
        if (performance.day >= fromDay && performance.minutes > 0) {
            totalPerformances += 1;
            return aggregate + performance.rate;
        } else return aggregate;
    }, 0);

    if (totalPerformances > 0) return Math.floor(sum * 100 / totalPerformances) / 100;
    else return 0;
}

export function initializeExtendedData(player: IPlayerExtended, numberOfFixtures: number, limitation: number = 0) {

    const fromDay: number = limitation == 0 ? 1 : Math.max(numberOfFixtures - limitation, 1);
    const numberOfDays: number = numberOfFixtures - (fromDay - 1);

    player.averagePerformance = getAveragePerformance(player, fromDay);
    player.totalGoalFor = getGoalFor(player, fromDay);
    player.totalGoalAgainst = getGoalAgainst(player, fromDay);
    player.totalPenaltyFor = getPenaltyFor(player, fromDay);

    if (player.team) {

        let played: number = 0;
        let playedAsSub: number = 0;

        _.each(player.performances, (performance: IPerformance) => {
            if (performance.day >= fromDay) {
                if (!performance.sub) played += 1;
                else playedAsSub += 1;
            }
        });

        player.titularisation = 100 * (played / numberOfDays);
        player.participation = 100 * ((played + playedAsSub) / numberOfDays);
    } else {
        player.titularisation = 0;
        player.titularisation = 0;
    }
}
