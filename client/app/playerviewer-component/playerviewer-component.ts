
import {Component, OnInit} from "@angular/core";
import {PlayerService} from "../services/player.service";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {IPlayer} from "../../../shared/models/player";
import * as player_helpers from "../../../shared/models/player_helpers";
import _ from "lodash";
import {IPerformance} from "../../../shared/models/performance";
import * as Chartist from "chartist";

class ChartData {
    labels: string[];
    series: number[][];
}

@Component({
    selector: 'teamview-playerviewer',
    templateUrl: './playerviewer-component.html',
    styleUrls: ['./playerviewer-component.scss']
})

export class PlayerViewerComponent implements OnInit {

    public player: IPlayer;
    public teamLogo: string = "";

    public performancesData: ChartData;
    public performancesOptions:any = {
        low: 0,
        high: 10,
        lineSmooth: Chartist.Interpolation.step()
    };

    constructor( private playerService: PlayerService, private route: ActivatedRoute  ) {
    }

    public async ngOnInit() {
        this.performancesData = {
            labels: [],
            series: []
        }

        this.route.paramMap.switchMap((params: ParamMap) =>
            this.playerService.get( params.get( "id" )))
                .subscribe( ( player: IPlayer ) => {
                    this.player = _.cloneDeep( player );
                    player_helpers.initializeExtendedData( this.player, this.player.team.fixtures.length );

                    // on met en place l'url de notre stockage Azure.
                    // et en passant encore merci à Saint Etienne pour son espace !
                    this.teamLogo = this.getEmblemUrl( this.player.team.name );

                    // On créé les séries pour les graphs
                    this.generateDataForGraph();
                });
    }

    // Récupère l'url à partir du nom, juste pour traiter le cas de Saint Etienne.
    // Réflexion faite, j'aurai du appeler cette méthode getDidierRocheteau
    public getEmblemUrl(team: string) {
        return "https://mespetitesstats.blob.core.windows.net/teams/" + team.replace(" ", "").toLowerCase() + ".png";
    }

    // Génération des données pour les différents graphs.
    public generateDataForGraph() {

        let average: number[] = [];

        _.each( this.player.performances, ( performance: IPerformance ) => {
            average[ performance.day - 1 ] = performance.rate;
        });

        this.performancesData.series = [ average ];

        // on remplit le tableau de jours
        for( let i = 0; i < this.player.team.fixtures.length; i++ )
        {
            this.performancesData.labels.push( (i+1).toString() );
        }

        console.log( this.performancesData );
    }
}
