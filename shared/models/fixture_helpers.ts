import * as _ from "lodash";
import {IPerformance} from "./performance";
import {IFixture} from "./fixture";

export function getHomeGoal( fixture: IFixture ): number {

    const goalFor: number = _.reduce( fixture.home.performances, ( aggregate: number, performance: IPerformance ) => {
        return aggregate + performance.goalFor;
    }, 0 );

    const moreGoalFor: number = _.reduce( fixture.away.performances, ( aggregate: number, performance: IPerformance ) => {
        return aggregate + performance.goalAgainst;
    }, 0 );

    return goalFor + moreGoalFor;
}

export function getAwayGoal( fixture: IFixture ): number {

    const goalFor: number = _.reduce( fixture.away.performances, ( aggregate: number, performance: IPerformance ) => {
        return aggregate + performance.goalFor;
    }, 0 );

    const moreGoalFor: number = _.reduce( fixture.home.performances, ( aggregate: number, performance: IPerformance ) => {
        return aggregate + performance.goalAgainst;
    }, 0 );

    return goalFor + moreGoalFor;
}
