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

export interface IPlayerMercatoMPG {
    club: string;
    firstname: string;
    id: string;
    lastname: string;
    position: number;
    quotation: number;
    teamid: string;
}

export interface IMercatoMPG {
    availablePlayers: IPlayerMercatoMPG[];
}

export interface IPlayerBuyInfoMPG {
    lastname: string;
    price_paid: number;
    position: number;
    club: string;
}

export interface IUserMercatoMPG {
    lastname: string;
    firstname: string;
    teamId: string;
    budget: number;
    teamName: string;
    teamAbbr: string;
    teamStatus: number;

    players: IPlayerBuyInfoMPG[];
}

export interface IFullMercatoMPG {
    currentUser: string;
    currentMPGUser: string;
    leagueStatus: number;
    leagueName: string;
    championship: number;
    turn: number;
    season: number;

    usersMercato: IUserMercatoMPG[];
    historyMercatos: any;
}
