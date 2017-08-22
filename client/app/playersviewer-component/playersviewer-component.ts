import {Component, OnInit} from "@angular/core";
import {PlayerService} from "../services/player.service";
import {IPlayer} from "../../../shared/models/player";
import _ from "lodash";
import * as player_helpers from "../../../shared/models/player_helpers";

interface IPlayerExtended extends IPlayer {
    averagePerformance?: number;
    totalGoalFor?: number;
    totalGoalAgainst?: number;
}

@Component({
    selector: 'teamview-playersviewer',
    templateUrl: './playersviewer-component.html',
    styleUrls: ['./playersviewer-component.scss']
})

export class PlayersViewerComponent implements OnInit {

    public playersAll: IPlayerExtended[];
    public playersActive: IPlayerExtended[];
    public playersByGoals: IPlayerExtended[];
    public players: Dictionary< IPlayerExtended[] >;

    constructor( private playerService: PlayerService ) {

        this.players = {
            "1": [],
            "2": [],
            "3": [],
            "4": []
        };
    }

    public async ngOnInit() {
        this.playerService.list.subscribe( ( players: IPlayer[] ) => {
            this.playersAll = _.cloneDeep( players );

            // On vire les joueurs qui ne sont pas actifs, c'est à dire qui n'ont aucune performance
            this.playersActive = _.filter( this.playersAll, ( player: IPlayer ) => {
               return player.performances.length > 0;
            });

            // On a isolé la construction des différentes listes dans une fonction, vu qu'on va sans doute
            // la customiser pour régler la profondeur de données que l'on utilise.
            this.buildData();
        });
    }

    private async buildData() {
        // On calcule quelques valeurs intéressante. Pour l'instant on se tape tous le set de données
        // A terme on verra pour pouvoir customiser la profondeur de données (genre les 5 dernières journées).
        _.forEach( this.playersActive, ( player: IPlayerExtended ) => {
            player.averagePerformance = player_helpers.getAveragePerformance( player );
            player.totalGoalFor = player_helpers.getGoalFor( player );
            player.totalGoalAgainst = player_helpers.getGoalAgainst( player );
        });

        // De base on tri par performance
        this.playersActive = _.orderBy( this.playersActive,[ "averagePerformance", "totalGoalFor" ], [ "desc", "desc" ] );
        this.players = _.groupBy( this.playersActive, 'role' );
        console.log( this.players );

        // On se fait notre liste de meilleurs buteurs
        this.playersByGoals = _.orderBy( this.playersActive,[ "totalGoalFor", "averagePerformance" ], [ "desc", "desc" ] );
    }

    // Cette méthode pour permettre à Saint Etienne d'exister commence à se reproduire à droite et à gauche.
    public getEmblemClass( team: string )
    {
        if( team ) {
            return team.replace( " ", "" );
        }
        else
        {
            return "";
        }
    }

}
