
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

    // Données pour les performances chiffrées du joueurs
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

    // Données pour le donut de présentéisme du joueur.
    public presenceData: SimpleChartData;
    public presenceType: string = "";
    public presenceOptions: any = {
        donut: true,
        donutWidth: 20,
        startAngle: 270,
        total: 0,
        showLabel: false
    };

    // Données pour le graph de buts cumulés
    public goalsData: ChartData;
    public goalsType: string = "";
    public goalsOptions: any = {
        fullWidth: true,
        lineSmooth: Chartist.Interpolation.none()
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

        this.goalsData = {
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

        let goalForThisDay: number[] = [];
        let cumulativeGoals: number[] = [];

        let minutesAsPlayer: number = 0;
        let minutesAsSubstitute: number = 0;
        let minutesOnTheBench: number = 0;

        let numberOfPerformances: number = 0;
        let totalRateValue: number = 0;
        let lastDay: number = 0;

        let performance: IPerformance;


        for( performance of this.player.performances ) {

            // On stocke le nombre de performance et la somme de toutes les performances
            // Cette dernière nous permettant de calculer à chaque fois la moyenne au jour donné.
            numberOfPerformances++;
            totalRateValue += performance.rate;

            // On stocke la perf du joueur, ainsi que la moyenne du jour
            daily[ performance.day - 1 ] = performance.rate;
            average[ performance.day - 1 ] = totalRateValue / numberOfPerformances;

            if( performance.day > lastDay ) lastDay = performance.day;

            // Si on était remplaçant, ce sont des minutes de remplaçant
            // Sinon ce sont des minutes de titulaires.
            if( performance.sub ) {
                minutesAsSubstitute += performance.minutes;
            } else {
                minutesAsPlayer += performance.minutes;
            }

            // Et le reste ce sont les minutes "on était pas là"
            minutesOnTheBench = 90 - performance.minutes;

            // On stocke les buts du jour
            goalForThisDay[ performance.day - 1 ] = performance.goalFor;
        }

        // On fait une deuxième passe pour les jours qui manquent, histoire d'être sur
        // d'avoir des trous dans le graphe
        for( let i: number = 0; i < lastDay; i++ )
        {
            if( !daily[ i ] ) {
                daily[ i ] = null;
                average[ i ] = null;

                // S'il n'y a pas de performances, ça veut dire que le type est resté sur le banc
                // Voir à la maison devant BeIn à regarder le match.
                minutesOnTheBench += 90;
            }

            // Par défaut on dit qu'on a marqué que dalle
            let todayGoal: number = 0;

            // On ajuste le compteur de but si le mec a joué
            // Là il peut quand même toujours avoir marqué zéro
            if( goalForThisDay[ i ] ) {
                todayGoal = goalForThisDay[ i ];
            }

            // On part du principe qu'on a pas marqué les jours précédent
            let previousDayGoal: number = 0;

            // Si c'est pas le premier jouer, on va récupérer la valeur
            if( i > 0 ) {
                previousDayGoal = cumulativeGoals[ i - 1 ];
            }

            // Et on stocke le tout
            cumulativeGoals[ i ] = previousDayGoal + todayGoal;
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
        this.presenceOptions.total = 2 * ( minutesAsPlayer + minutesAsSubstitute + minutesOnTheBench );

        // On construit notre affichage de but
        this.goalsData.series = [ cumulativeGoals ];
        this.goalsData.labels = this.performancesData.labels;

        console.log( this.goalsData );

        // On paramètre le type de diagramme (pour déclencher le refresh, sinon le diagramme ne s'affiche pas)
        this.performancesType = "Line";
        this.presenceType = "Pie";
        this.goalsType = "Line";
    }
}
