import {Component, OnInit} from "@angular/core";
import {TeamService} from "../services/team.service";
import {ITeam} from "../../../shared/models/team";
import {ActivatedRoute, ParamMap} from "@angular/router";
import _ from "lodash";
import {IPlayer} from "../../../shared/models/player";
import {IPerformance} from "../../../shared/models/performance";

@Component({
    selector: 'teamview-teamviewer',
    templateUrl: './teamviewer-component.html',
    styleUrls: ['./teamviewer-component.scss']
})

export class TeamViewerComponent implements OnInit {

    public currentTeam: ITeam = <ITeam> {
        idMpg: 0,
        name: ""
    };

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

    public getPerformanceFor( player: IPlayer, day: number ) : string
    {
        let performanceThisDay = player.performances.find( (performance: IPerformance) => {
            return performance.day == day;
        });

        if( performanceThisDay )
        {
            return performanceThisDay.rate.toString();
        }
        else
        {
            return "-";
        }
    }

    public getRange( value: Number):Array<number> {
        let a = [];

        for( let i =0; i < value; i++ )
        {
            a.push(i+1)
        }

        return a;
    }

}
