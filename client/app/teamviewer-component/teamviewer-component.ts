import {Component, OnInit} from "@angular/core";
import {TeamService} from "../services/team.service";
import {ActivatedRoute, ParamMap} from "@angular/router";
import _ from "lodash";

import {IPlayer} from "../../../shared/models/player";
import {IPerformance} from "../../../shared/models/performance";
import {IFixture} from "../../../shared/models/fixture";
import {ITeam} from "../../../shared/models/team";
import * as player_helpers from "../../../shared/models/player_helpers";

@Component({
    selector: 'teamview-teamviewer',
    templateUrl: './teamviewer-component.html',
    styleUrls: ['./teamviewer-component.scss']
})

export class TeamViewerComponent implements OnInit {

    public currentTeam: ITeam = {
        idMpg: 0,
        name: "",
        fixtures: []
    } as ITeam;

    public activePlayers: IPlayer[];
    public inactivePlayers: IPlayer[];

    constructor( private teamService: TeamService, private route: ActivatedRoute ) {
    }

    public async ngOnInit()
    {

        this.route.paramMap.switchMap( ( params: ParamMap ) =>
            this.teamService.getByName( params.get('name')))
            .subscribe( ( team: ITeam ) => {
                this.currentTeam = team;
                console.log( team );
                this.activePlayers = _.filter( this.currentTeam.players, player => {
                    return player.performances.length > 0;
                });

                this.activePlayers = _.sortBy( this.activePlayers, [ 'role', 'lastName' ]);

                this.inactivePlayers = _.reject( this.currentTeam.players, player => {
                    return player.performances.length > 0;
                });

                this.inactivePlayers = _.sortBy( this.inactivePlayers, [ 'role', 'lastName' ]);
            });
    }

    // La méthode pour générer les entêtes de colonnes, on va simplement récupérer l'adversaire du jour
    public getColumnHeaderFor( day: number ): string
    {
        if( this.currentTeam.fixtures ) {
            const fixtureThisDay: IFixture = this.currentTeam.fixtures.find((fixture: IFixture) => {
                return fixture.day == day;
            });

            // Si on a l'info
            if (fixtureThisDay) {
                return fixtureThisDay.home.team.name + " - " + fixtureThisDay.away.team.name;
            }
            else {
                // Nous
                return day.toString();
            }
        }

        return day.toString();
    }

    public getPerformanceFor( player: IPlayer, day: number ): string
    {
        if( player )
        {
            const performanceThisDay: IPerformance = player.performances.find( (performance: IPerformance) => {
                return performance.day == day;
            });

            if( performanceThisDay )
            {
                return performanceThisDay.rate.toString();
            }
        }

        return "-";
    }

    public getRange( value: number): number[] {
        let a = [];

        for( let i =0; i < this.currentTeam.fixtures.length; i++ )
        {
            a.push(i+1);
        }

        return a;
    }

    public getAverageForPlayer( player: IPlayer ): string {
        return player_helpers.getAveragePerformance( player ).toString();
    }

    public getGoalAgainst( player: IPlayer ): string {
        const goal: number = player_helpers.getGoalAgainst( player );

        if( goal > 0 ) {
            return goal.toString();
        }
        else {
            return "-";
        }
    }

    public getGoalFor( player: IPlayer ): string {
        const goal: number = player_helpers.getGoalFor( player );

        if( goal > 0 ) {
            return goal.toString();
        }
        else {
            return "-";
        }
    }
}
