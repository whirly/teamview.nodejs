import {Component, OnInit} from "@angular/core";
import {PlayerService} from "../services/player.service";
import {IPlayer, PlayerPosition} from "../../../shared/models/player";
import _ from "lodash";
import * as player_helpers from "../../../shared/models/player_helpers";
import {TeamService} from "../services/team.service";
import {ITeam} from "../../../shared/models/team";
import {IPerformance} from "../../../shared/models/performance";

interface IPlayerExtended extends IPlayer {
    averagePerformance?: number;
    totalGoalFor?: number;
    totalGoalAgainst?: number;
    participation?: number;
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
    public players: Dictionary<IPlayerExtended[]>;

    public teams: ITeam[];

    constructor(private playerService: PlayerService, private teamService: TeamService ) {

        this.players = {
            [PlayerPosition.Goal]: [],
            [PlayerPosition.Defender]: [],
            [PlayerPosition.Midfield]: [],
            [PlayerPosition.Striker]: []
        };
    }

    public async ngOnInit() {
        this.teamService.list.subscribe( (teams: ITeam[] ) => {
            this.teams = teams;

            this.playerService.list.subscribe((players: IPlayer[]) => {
                this.playersAll = _.cloneDeep(players);

                // On vire les joueurs qui ne sont pas actifs, c'est à dire qui n'ont aucune performance
                this.playersActive = _.filter(this.playersAll, (player: IPlayer) => {
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

    public getParticipationClass( player: IPlayerExtended ) {
        if( player.participation > 80 ) {
            return "positive";
        } else if( player.participation > 40 ) {
            return "";
        } else {
            return "negative";
        }
    }

    private async buildData() {
        // On calcule quelques valeurs intéressante. Pour l'instant on se tape tous le set de données
        // A terme on verra pour pouvoir customiser la profondeur de données (genre les 5 dernières journées).
        _.forEach(this.playersActive, (player: IPlayerExtended) => {
            player.averagePerformance = player_helpers.getAveragePerformance(player);
            player.totalGoalFor = player_helpers.getGoalFor(player);
            player.totalGoalAgainst = player_helpers.getGoalAgainst(player);

            if( player.team ) {
                const myteam = this.teams.find( ( team: ITeam ) => {
                    return team.name == player.team.name;
                });

                let played: number = 0;

                _.each( player.performances, ( performance: IPerformance ) => {
                    if ( !performance.sub ) played += 1;
                });

                player.participation = 100 * ( played / myteam.fixtures.length );
            } else {
                player.participation = 0;
            }
        });

        // De base on tri par performance
        this.playersActive = _.orderBy(this.playersActive, ["averagePerformance", "totalGoalFor"], ["desc", "desc"]);
        this.players = _.groupBy(this.playersActive, 'role');

        // On se fait notre liste de meilleurs buteurs
        this.playersByGoals = _.orderBy(this.playersActive, ["totalGoalFor", "averagePerformance"], ["desc", "desc"]);
    }
}
