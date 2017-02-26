export interface IPlayer {
    idMpg?: string;
    firstName?: string;
    lastName?: string;
    role?: string;

    performances?: [{
        day?: number;
        rate?: number;
        goalFor?: number;
        goalAgainst?: number;
        value?: number;
    }];

}
