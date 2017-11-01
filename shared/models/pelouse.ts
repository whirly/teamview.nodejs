export interface IUserMPG {
    userId: string;
    token: string;
}

export interface ILeagueMPG {
    id: string;
    admin_mpg_user: string;
    current_mpg_user: string;
    name: string;
    leagueStatus: number;
    championship: number;
    mode: number;
    teamStatus: number;
}
