export interface IPerformance {
    player?: string,
    team?: string,
    day?: number,
    position?: string,
    place?: number,
    rate?: number,
    goalFor?: number,
    goalAgainst?: number,
    cardYellow: boolean,
    cardRed: boolean,
    sub: boolean,
    minutes: number,
    penaltyFor: number
}
