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

    public contention: MercatoMultiData;

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
        const numberOfPlayers:number = this.players.length;
        let totalPricePaid:number = 0;

        // On initialise les labels pour les graphs
        this.budgetPerLine.labels[ 0 ] = "Gardiens";
        this.budgetPerLine.labels[ 1 ] = "Défenseurs";
        this.budgetPerLine.labels[ 2 ] = "Millieux";
        this.budgetPerLine.labels[ 3 ] = "Attaquants";

        this.budgetPerBucket.labels[ PriceBucket.LessThan10 ] = "=< 10m";
        this.budgetPerBucket.labels[ PriceBucket.LessThan20 ] = "=< 20m";
        this.budgetPerBucket.labels[ PriceBucket.LessThan30 ] = "=< 30m";
        this.budgetPerBucket.labels[ PriceBucket.LessThan40 ] = "=< 40m";
        this.budgetPerBucket.labels[ PriceBucket.Over40 ] = "> 40m";

        for( let playerOffer of this.players ) {

            const price: number = playerOffer.offers[0].price;
            this.budgetPerLine.series[ playerOffer.player.role - 1 ] += price;

            if( price <= 10 ) {
                this.budgetPerBucket.series[0][ PriceBucket.LessThan10 ] += price;
            } else if( price <= 20 ) {
                this.budgetPerBucket.series[0][ PriceBucket.LessThan20 ] += price;
            } else if( price <= 30 ) {
                this.budgetPerBucket.series[0][ PriceBucket.LessThan30 ] += price;
            } else if( price <= 40 ) {
                this.budgetPerBucket.series[0][ PriceBucket.LessThan40 ] += price;
            } else {
                this.budgetPerBucket.series[0][ PriceBucket.Over40 ] += price;
            }

            totalPricePaid += price;
        }

        // On convertit en fait en pourcentage les buckets de player
        this.budgetPerBucket.series[0][ PriceBucket.LessThan10 ] = ( this.budgetPerBucket.series[0][ PriceBucket.LessThan10 ] / totalPricePaid ) * 100;
        this.budgetPerBucket.series[0][ PriceBucket.LessThan20 ] = ( this.budgetPerBucket.series[0][ PriceBucket.LessThan20 ] / totalPricePaid ) * 100;
        this.budgetPerBucket.series[0][ PriceBucket.LessThan30 ] = ( this.budgetPerBucket.series[0][ PriceBucket.LessThan30 ] / totalPricePaid ) * 100;
        this.budgetPerBucket.series[0][ PriceBucket.LessThan40 ] = ( this.budgetPerBucket.series[0][ PriceBucket.LessThan40 ] / totalPricePaid ) * 100;
        this.budgetPerBucket.series[0][ PriceBucket.Over40 ] = ( this.budgetPerBucket.series[0][ PriceBucket.Over40 ] / totalPricePaid ) * 100;
    }
}


export class Mercato {
    public users: MercatoUser[] = [];

    constructor( mercatoHistory: any, playersAll: IPlayerExtended[] ) {

        // On ajoute les joueurs
        for( let user of mercatoHistory.usersMercato ) {
            let userMercato: MercatoUser = new MercatoUser( user );
            this.users.push( userMercato );
        }

        // On itère sur l'ensemble des tours de mercato
        for( let mercatoTurn in mercatoHistory.historyMercato ) {
            // On itère sur chaque joueur du mercato
            if (mercatoHistory.historyMercato.hasOwnProperty(mercatoTurn)) {

                for (let mercatoPlayer of mercatoHistory.historyMercato[ mercatoTurn ]) {

                    // On cherche la structure du joueur, on récupère l'idée sans le player_
                    let id: string = mercatoPlayer[0].id.slice(7);

                    let player: IPlayerExtended = playersAll.find(player => {
                        return player.idMpg == id;
                    });

                    let userWinning: MercatoUser = this.users.find(userCandidate => {
                        return userCandidate.teamName == mercatoPlayer[0].teamName;
                    });

                    userWinning.totalAcceptedOffers++;
                    userWinning.totalAcceptedOffersMoney += mercatoPlayer[0].price_paid;

                    let offer: PlayerWithOffers = new PlayerWithOffers();
                    offer.player = player;

                    // On itère sur chaque offre
                    for (let mercatoOffer of mercatoPlayer) {

                        let userCurrent: MercatoUser = this.users.find(userOther => {
                            return userOther.teamName == mercatoOffer.teamName;
                        });

                        userCurrent.totalOffers++;
                        userCurrent.totalOffersMoney += mercatoOffer.price_paid;

                        let mercatoOfferCurrent: MercatoOffer = new MercatoOffer( userCurrent.teamId, mercatoOffer.price_paid);
                        offer.offers.push(mercatoOfferCurrent);
                    }

                    userWinning.players.push(offer);
                }
            }
        }

        // Let's build those data.
        for( let user of this.users ) {
            user.buildData();
        }
    }

}
