import {Component, OnInit} from "@angular/core";
import {PlayerService} from "../services/player.service";
import {IPlayer, IPlayerExtended, PlayerPosition} from "../../../shared/models/player";
import _ from "lodash";
import * as player_helpers from "../../../shared/models/player_helpers";
import {TeamService} from "../services/team.service";
import {ITeam} from "../../../shared/models/team";

enum PlayerOrdering {
    Goal = "totalGoalFor",
    CSC = "totalGoalAgainst",
    Average = "averagePerformance",
    Price = "value"
}

enum SortDirection {
    Ascending = "asc",
    Descending = "desc"
}

enum PlayerPresence {
    None = 0,
    Holder = 1,
    SuperSub = 2
}


@Component({
    selector: 'teamview-playersviewer',
    templateUrl: './playersviewer-component.html',
    styleUrls: ['./playersviewer-component.scss']
})

export class PlayersViewerComponent implements OnInit {

    public playersAll: IPlayerExtended[] = [];
    public playersActive: IPlayerExtended[] = [];

    public teams: ITeam[];

    public positionShortForm: Map< PlayerPosition, string > = new Map< PlayerPosition, string >();

    // Les données de filtrage
    public filterPrice: number = -1;
    public filterPosition: PlayerPosition = PlayerPosition.None;
    public filterPresence: PlayerPresence = PlayerPresence.None;
    public filterPenalty: boolean = false;
    public filterMatch: number = 0;

    // Le filtrage
    public orderBy:PlayerOrdering  = PlayerOrdering.Goal;
    public sortDirection:SortDirection = SortDirection.Descending;

    constructor(private playerService: PlayerService, private teamService: TeamService ) {
    }

    public async ngOnInit() {

        // On initialise le table de conversion pour les formes courtes
        this.positionShortForm.set( PlayerPosition.Goal, "G" );
        this.positionShortForm.set( PlayerPosition.Defender, "D" );
        this.positionShortForm.set( PlayerPosition.Midfield, "M" );
        this.positionShortForm.set( PlayerPosition.Striker, "A" );

        this.teamService.list.subscribe( (teams: ITeam[] ) => {
            this.teams = teams;

            this.playerService.list.subscribe((players: IPlayer[]) => {
                this.playersAll = _.cloneDeep(players);

                // On vire les joueurs qui ne sont pas actifs, c'est à dire qui n'ont aucune performance
                this.playersAll = _.filter(this.playersAll, (player: IPlayer) => {
                    return player.performances.length > 0;
                });

                // On a isolé la construction des différentes listes dans une fonction, vu qu'on va sans doute
                // la customiser pour régler la profondeur de données que l'on utilise.
                this.buildData();
            });
        });
    }

    // Cette méthode pour permettre à Saint Etienne d'exister commence à se reproduire à droite et à gauche.
    public getEmblemClass(team: string) {
        if (team) {
            return team.replace(" ", "");
        }
        else {
            return "";
        }
    }

    public getCircleClassFor( role: PlayerPosition )
    {
        return "circle-" + this.positionShortForm.get( role );
    }
    public getLevelFor( amount: number )
    {
        if( amount == 0 ) return "fa-battery-0";
        else if( amount <= 25 ) return "fa-battery-1";
        else if( amount <= 50 ) return "fa-battery-2";
        else if( amount <= 75 ) return "fa-battery-3";
        else if( amount <= 100 ) return "fa-battery-4";
    }

    public getParticipationClass( player: IPlayerExtended ) {
        if( player.participation > 80 ) {
            return "positive";
        } else if( player.participation > 40 ) {
            return "";
        } else {
            return "negative";
        }
    }

    // Changement du filtre par prix
    public filterByPrice( newPrice: number ): void {

        // On n'opère que si les prix ont changés.
        if( this.filterPrice != newPrice ) {
            this.filterPrice = newPrice;
            this.filterAndSortData();
        }
    }

    public isFilterPrice( askPrice: number ): string {
        if( this.filterPrice == askPrice ) {
            return "active";
        } else {
            return "";
        }
    }

    // Changement du filtre penalty
    public filterByPenalty( requirePenalty: boolean ): void {

        if( this.filterPenalty != requirePenalty ) {
            this.filterPenalty = requirePenalty;
            this.filterAndSortData();
        }
    }

    public isFilterPenalty( requirePenalty: boolean ): string {
        if( this.filterPenalty != requirePenalty ) return "";
        else return "active";
    }

    // Changement du filtre de presence
    public filterByPresence( presence: PlayerPresence ): void {
        if( this.filterPresence != presence ) {
            this.filterPresence = presence;
            this.filterAndSortData();
        }
    }

    public isFilterPresence( presence: PlayerPresence ): string {
        if( this.filterPresence == presence ) return "active";
        else return "";
    }

    // Changement du filtre de position
    public filterByPosition( position: PlayerPosition ): void {
        if( this.filterPosition != position ) {
            this.filterPosition = position;
            this.filterAndSortData();
        }
    }

    public isFilterPosition( position: PlayerPosition ): string {
        if( this.filterPosition == position ) return "active";
        else return "";
    }

    // Changement du filtre sur le nombre de match.. celui là est un peu particulier
    public filterByMatch( amount: number ): void {
        if( this.filterMatch != amount ) {
            this.filterMatch = amount;
            this.calculateExtendedData();
            this.filterAndSortData();
        }
    }

    public isFilterMatch( amount: number ): string {
        if( this.filterMatch == amount ) return "active";
        else return "";
    }

    // Tri
    public sortBy( sort: PlayerOrdering ) {

        // On regarde si c'était déjà la bonne colonne qu'on triait
        if( this.orderBy == sort ) {
            // Oui, cela veut dire qu'on va juste trier dans l'autre sens
            this.sortDirection = this.sortDirection == SortDirection.Ascending ? SortDirection.Descending : SortDirection.Ascending;
            this.filterAndSortData();

        } else {
            // Non, on change le tri
            this.orderBy = sort;
            this.filterAndSortData();
        }
    }

    public isSortingBy( sort: PlayerOrdering ) {
        if( this.orderBy == sort ) return "active";
        else return "";
    }

    // Une fois que tu as écris tous ces filtres, c'est là que tu te dis que tu aurais pu factoriser
    // le tout avec un tableau de filtre au lieu de les séparer. Mais là de suite, t'as pas envie
    // de refactorer :)


    private async calculateExtendedData() {
        _.forEach(this.playersAll,
            (player: IPlayerExtended) => {
                let numberOfFixtures: number = 0;

                if ( player.team ) {
                    const myteam = this.teams.find((team: ITeam) => {
                        return team.name == player.team.name;
                    });

                    numberOfFixtures = myteam.fixtures.length;
                }

                player_helpers.initializeExtendedData( player, numberOfFixtures, this.filterMatch );
            });
    }

    // Construit l'ensemble des données ( calcul des données étendus, et filtrage de tout cela).
    private async buildData() {
        // On calcule les données étendus en prenant en compte le filtrage sur le nombre de jours
        this.calculateExtendedData();

        // Tri & Filtre
        this.filterAndSortData();
    }

    // Fonction pour filtrer les données en fonction des critères, appliquer à chaque fois qu'on change
    // le filtrage.
    private filterAndSortData(): void {

        this.playersActive = _.filter( this.playersAll, (player: IPlayerExtended) => {

            if( this.filterPrice != -1 ) {
                if( player.value >= this.filterPrice ) {
                    return false;
                }
            }

            if( this.filterPosition != PlayerPosition.None ) {
                if( player.role != this.filterPosition ) {
                    return false;
                }
            }

            if( this.filterPenalty != false ) {
                if( player.totalPenaltyFor == 0 ) {
                    return false;
                }
            }

            switch( this.filterPresence ) {
                case PlayerPresence.Holder:
                    if( player.titularisation < 75 ) return false;
                    break;

                case PlayerPresence.SuperSub:
                    if( player.participation < 75 ) return false;
                    break;
            }

            return true;
        });

        this.playersActive = _.orderBy( this.playersActive, [ this.orderBy ], [ this.sortDirection ]);
    }

}
