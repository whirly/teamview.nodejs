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

export class MercatoData {
    labels: string[] = [];
    series: number[] = [];

    constructor( size: number ) {
        for( let i = 0; i < size; i++ ) {
            this.labels.push("");
            this.series.push(0);
        }
    }
}

export class MercatoMultiData {
    labels: string[] = [];
    series: number[][] = [[]];

    constructor( size: number, numberOfSeries: number ) {

        for( let i = 0; i < numberOfSeries - 1; i++ ) {
            this.series.push([]);
        }

        for( let i = 0; i < size; i++ ) {
            this.labels.push("");
            for( let j = 0; j < numberOfSeries; j++ ) {
                this.series[j].push(0);
            }
        }
    }
}

export enum PriceBucket {
    LessThan10 = 0,
    LessThan20 = 1,
    LessThan30 = 2,
    LessThan40 = 3,
    Over40 = 4
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

    public totalAcceptedOffersMoney: number = 0;
    public totalOffersMoney: number = 0;

    public players: PlayerWithOffers[] = [];

    // Les données suivantes sont calculés
    public budgetPerLine: MercatoData = new MercatoData( 4 );
    public budgetPerBucket: MercatoMultiData = new MercatoMultiData( 5, 1);

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
        const numberOfPlayers = this.players.length;

        for( let playerOffer of this.players ) {
            this.budgetPerLine.labels[ 0 ] = "Gardiens";
            this.budgetPerLine.labels[ 1 ] = "Défenseurs";
            this.budgetPerLine.labels[ 2 ] = "Millieux";
            this.budgetPerLine.labels[ 3 ] = "Attaquants";

            const price: number = playerOffer.offers[0].price;
            this.budgetPerLine.series[ playerOffer.player.role - 1 ] += price;

            this.budgetPerBucket.labels[ PriceBucket.LessThan10 ] = "=< 10m";
            this.budgetPerBucket.labels[ PriceBucket.LessThan20 ] = "=< 20m";
            this.budgetPerBucket.labels[ PriceBucket.LessThan30 ] = "=< 30m";
            this.budgetPerBucket.labels[ PriceBucket.LessThan40 ] = "=< 40m";
            this.budgetPerBucket.labels[ PriceBucket.Over40 ] = "> 40m";

            if( price <= 10 ) {
                this.budgetPerBucket.series[0][ PriceBucket.LessThan10 ] ++;
            } else if( price <= 20 ) {
                this.budgetPerBucket.series[0][ PriceBucket.LessThan20 ] ++;
            } else if( price <= 30 ) {
                this.budgetPerBucket.series[0][ PriceBucket.LessThan30 ] ++;
            } else if( price <= 40 ) {
                this.budgetPerBucket.series[0][ PriceBucket.LessThan40 ] ++;
            } else {
                this.budgetPerBucket.series[0][ PriceBucket.Over40 ] ++;
            }
        }

        // On convertit en fait en pourcentage les buckets de player
        this.budgetPerBucket.series[0][ PriceBucket.LessThan10 ] = ( this.budgetPerBucket.series[0][ PriceBucket.LessThan10 ] / numberOfPlayers ) * 100;
        this.budgetPerBucket.series[0][ PriceBucket.LessThan20 ] = ( this.budgetPerBucket.series[0][ PriceBucket.LessThan20 ] / numberOfPlayers ) * 100;
        this.budgetPerBucket.series[0][ PriceBucket.LessThan30 ] = ( this.budgetPerBucket.series[0][ PriceBucket.LessThan30 ] / numberOfPlayers ) * 100;
        this.budgetPerBucket.series[0][ PriceBucket.LessThan40 ] = ( this.budgetPerBucket.series[0][ PriceBucket.LessThan40 ] / numberOfPlayers ) * 100;
        this.budgetPerBucket.series[0][ PriceBucket.Over40 ] = ( this.budgetPerBucket.series[0][ PriceBucket.Over40 ] / numberOfPlayers ) * 100;

        console.log( this.budgetPerBucket );
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
