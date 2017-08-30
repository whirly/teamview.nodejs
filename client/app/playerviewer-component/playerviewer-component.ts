
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

class SimpleChartData {
    labels: string[];
    series: number[];
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
    public performancesType: string = "";
    public performancesOptions:any = {
        fullWidth: true,
        showArea: true,
        height: 300,
        axisY: {
            type: Chartist.FixedScaleAxis,
            low: 0,
            high: 10,
            divisor: 20
        }
    };

    public presenceData: SimpleChartData;
    public presenceType: string = "";
    public presenceOptions: any = {
        donut: true,
        donutWidth: 60,
        startAngle: 270,
        total: 200,
        showLabel: false
    };

    constructor( private playerService: PlayerService, private route: ActivatedRoute  ) {
    }

    public async ngOnInit() {
        this.performancesData = {
            labels: [],
            series: []
        };

        this.presenceData = {
            labels: [],
            series: []
        };

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

        let daily: number[] = [];
        let average: number[] = [];

        let minutesAsPlayer: number = 0;
        let minutesAsSubstitute: number = 0;
        let minutesOnTheBench: number = 0;

        let numberOfPerformances: number = 0;
        let totalRateValue: number = 0;
        let lastDay: number = 0;

        let performance: IPerformance;

        for( performance of this.player.performances ) {

            numberOfPerformances++;
            totalRateValue += performance.rate;

            daily[ performance.day - 1 ] = performance.rate;
            average[ performance.day - 1 ] = totalRateValue / numberOfPerformances;

            if( performance.day > lastDay ) lastDay = performance.day;

            if( performance.sub ) {
                minutesAsSubstitute += performance.minutes;
            } else {
                minutesAsPlayer += performance.minutes;
            }

            minutesOnTheBench = 90 - performance.minutes;
        }

        // On fait une deuxième passe pour les jours qui manquent, histoire d'être sur
        // d'avoir des trous dans le graphe
        for( let i: number = 0; i < lastDay; i++ )
        {
            if( !daily[ i ] ) {
                daily[ i ] = null;
                average[ i ] = null;
            }
        }

        // On construit la série de valeurs
        this.performancesData.series = [ daily, average ];

        // on remplit le tableau de jours
        for( let i = 0; i < this.player.team.fixtures.length; i++ )
        {
            this.performancesData.labels.push( (i+1).toString() );
        }

        // On construit notre affichage de présence
        this.presenceData.series = [ minutesOnTheBench, minutesAsSubstitute, minutesAsPlayer ];

        // On paramètre le type de diagramme (pour déclencher le refresh, sinon le diagramme ne s'affiche pas)
        this.performancesType = "Line";
        this.presenceType = "Pie";
    }
}
