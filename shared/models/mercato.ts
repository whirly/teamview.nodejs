import {IPlayerExtended} from "./player";
import {IUserMercatoMPG} from "./pelouse";

export class MercatoOffer {
    public teamId: string;
    public price: number;

    constructor( teamId: string, price: number ) {
        this.teamId = teamId;
        this.price = price;
    }
}
export class PlayerWithOffers {
    public player: IPlayerExtended;
    public offers: MercatoOffer[] = [];
}

export class MercatoUser {
    public lastname: string;
    public firstname: string;
    public teamId: string;
    public budget: number;
    public teamName: string;
    public teamAbbr: string;
    public teamStatus: number;

    public totalAcceptedOffers: number = 0;
    public totalOffers: number = 0;

    public players: PlayerWithOffers[] = [];

    // Les données suivantes sont calculés
    public budgetPerLine: number[] = [0,0,0,0,0];

    constructor( user: IUserMercatoMPG ) {
        this.lastname = user.lastname;
        this.firstname = user.firstname;
        this.teamAbbr = user.teamAbbr;
        this.teamId = user.teamId;
        this.teamName = user.teamName;
        this.teamStatus = user.teamStatus;
        this.budget = user.budget;
    }

    public buildData() {
        for( let playerOffer of this.players ) {
            this.budgetPerLine[ playerOffer.player.role ] += playerOffer.offers[0].price;
        }
    }
}


export class Mercato {
    public users: MercatoUser[] = [];

    public buildData() {
        for( let user of this.users ) {
            user.buildData();
        }
    }
}
