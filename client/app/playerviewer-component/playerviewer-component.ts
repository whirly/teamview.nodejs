import {Component, OnInit} from "@angular/core";
import {PlayerService} from "../services/player.service";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {IPlayer, IPlayerExtended} from "../../../shared/models/player";
import * as player_helpers from "../../../shared/models/player_helpers";
import * as fixture_helpers from "../../../shared/models/fixture_helpers";
import _ from "lodash";
import {TeamService} from "../services/team.service";
import {ITeam} from "../../../shared/models/team";
import {IFixture} from "../../../shared/models/fixture";

@Component({
    selector: 'teamview-playerviewer',
    templateUrl: './playerviewer-component.html',
    styleUrls: ['./playerviewer-component.scss']
})
export class PlayerViewerComponent implements OnInit {

    // Données concernant le joueur en cours.
    public player: IPlayerExtended;
    public team: ITeam;

    // Données concernant son équipe.

    public teamLogo: string = "";

    constructor(private playerService: PlayerService, private route: ActivatedRoute, private teamService: TeamService) {
    }

    public async ngOnInit() {
        this.route.paramMap.switchMap((params: ParamMap) =>
            this.playerService.get(params.get("id")))
            .subscribe((player: IPlayer) => {
                this.player = _.cloneDeep(player);
                player_helpers.initializeExtendedData(this.player, this.player.team.fixtures.length);

                // on met en place l'url de notre stockage Azure.
                // et en passant encore merci à Saint Etienne pour son espace !
                this.teamLogo = this.getEmblemUrl(this.player.team.name);

                // On récupère l'équipe avec ses performances.
                this.teamService.getByName(this.player.team.name).subscribe((team: ITeam) => {
                    this.team = team;
                });
            });
    }

    // Récupère l'url à partir du nom, juste pour traiter le cas de Saint Etienne.
    // Réflexion faite, j'aurai du appeler cette méthode getDominiqueRocheteau
    public getEmblemUrl(team: string) {
        return "https://mespetitesstats.blob.core.windows.net/teams/" + team.replace(" ", "").toLowerCase() + ".png";
    }

    public getSummaryForFixture(fixture: IFixture) {

        return fixture.home.team.name + " - " + fixture.away.team.name;
    }

    public getScoreForFixture( fixture: IFixture ) {
        return fixture_helpers.getHomeGoal( fixture ) + ":" + fixture_helpers.getAwayGoal( fixture );
    }

    public getMyPlayTimeFor( fixture: IFixture ) {
        return player_helpers.getMinutesFor( this.player, fixture.day );
    }

    public getMyGoalFor( fixture: IFixture ) {
        return player_helpers.getGoalForDay( this.player, fixture.day );
    }

    public getMyRateFor( fixture: IFixture ) {
        return player_helpers.getRateFor( this.player, fixture.day );
    }
}
