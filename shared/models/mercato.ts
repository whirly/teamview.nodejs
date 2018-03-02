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
    public turn: number;

    public getMine( user: MercatoUser ): number {
        for( let offer of this.offers ) {
            if( offer.teamId == user.teamId ) {
                return offer.price;
            }
        }
    }
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

    public numberOfTurns: number;

    public players: PlayerWithOffers[] = [];
    public playersLost: PlayerWithOffers[] = [];

    // Les données suivantes sont calculés
    public budgetPerLine: MercatoData = new MercatoData( 4 );
    public budgetPerBucket: MercatoMultiData = new MercatoMultiData( 5, 1);

    public contention: MercatoMultiData;
    public offersSummary: number[][] = [[]];

    constructor( user: IUserMercatoMPG, numberOfTurns: number ) {
        this.lastname = user.lastname;
        this.firstname = user.firstname;
        this.teamAbbr = user.teamAbbr;
        this.teamId = user.teamId;
        this.teamName = user.teamName;
        this.teamStatus = user.teamStatus;
        this.budget = user.budget;
        this.numberOfTurns = numberOfTurns;

        // On initialise le stockage pour les offres
        this.contention = new MercatoMultiData( numberOfTurns, 3 );
    }

    public buildData() {
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

        // On construit le graph de contention
        for( let turn = 1; turn <= this.numberOfTurns; turn++ ) {

            let offerWon: number = 0;
            let offerLost: number = 0;
            let offerUncontested: number = 0;

            // Ce qui nous intéresse c'est les offres du tour que l'on a gagné et où il y avait de la concurrence.
            for( let offer of this.players ) {
                if( offer.turn == turn ) {
                    if( offer.offers.length > 1 ) {
                       offerWon++;
                    } else {
                        // Offre non contesté
                        offerUncontested++;
                    }
                }
            }

            // La même chose mais là où on a perdu. L'avantage c'est que quand on a perdu on est sur d'avoir
            // été en compétition, par contre faut se retrouver dans les offres
            for( let offer of this.playersLost ) {
                if( offer.turn == turn ) {
                    offerLost++;
                }
            }

            // On a plus qu'a stocker pour le graph
            this.contention.labels[turn-1] = "Tour " + turn.toString();
            
            this.contention.series[0][turn-1] = offerUncontested;
            this.contention.series[1][turn-1] = offerWon;
            this.contention.series[2][turn-1] = offerLost;
        }

        console.log( this.contention );
    }
}


export class Mercato {
    public users: MercatoUser[] = [];
    public numberOfTurns: number = 0;

    constructor( mercatoHistory: any, playersAll: IPlayerExtended[] ) {

        for( let mercatoTurn in mercatoHistory.historyMercato ) {
            // On itère sur chaque joueur du mercato
            if (mercatoHistory.historyMercato.hasOwnProperty(mercatoTurn)) {

                this.numberOfTurns++;
            }
        }

        // On ajoute les joueurs
        for( let user of mercatoHistory.usersMercato ) {
            let userMercato: MercatoUser = new MercatoUser( user, this.numberOfTurns );
            this.users.push( userMercato );
        }

        let turnCurrent: number = 0;

        // On itère sur l'ensemble des tours de mercato
        for( let mercatoTurn in mercatoHistory.historyMercato ) {
            // On itère sur chaque joueur du mercato
            if (mercatoHistory.historyMercato.hasOwnProperty(mercatoTurn)) {

                turnCurrent++;

                for (let mercatoPlayer of mercatoHistory.historyMercato[ mercatoTurn ]) {

                    // On cherche la structure du joueur, on récupère l'idée sans le player_
                    let id: string = mercatoPlayer[0].id.slice(7);

                    let player: IPlayerExtended = playersAll.find(player => {
                        return player.idMpg == id;
                    });

                    let userWinning: MercatoUser = this.users.find(userCandidate => {
                        return userCandidate.teamName == mercatoPlayer[0].teamName;
                    });

                    let offer: PlayerWithOffers = new PlayerWithOffers();
                    offer.player = player;
                    offer.turn = turnCurrent;

                    let loosers: MercatoUser[] = [];

                    // On itère sur chaque offre
                    for (let mercatoOffer of mercatoPlayer) {

                        let userCurrent: MercatoUser = this.users.find(userOther => {
                            return userOther.teamName == mercatoOffer.teamName;
                        });

                        // On se fait une petite liste des perdants.
                        if( userCurrent != userWinning )
                        {
                            loosers.push( userCurrent );
                        }

                        let mercatoOfferCurrent: MercatoOffer = new MercatoOffer( userCurrent.teamId, mercatoOffer.price_paid );
                        offer.offers.push(mercatoOfferCurrent);
                    }

                    userWinning.players.push(offer);
                    for( let looser of loosers ) {
                        looser.playersLost.push( offer );
                    }
                }
            }
        }

        // Let's build those data.
        for( let user of this.users ) {
            user.buildData();
        }
    }

}
