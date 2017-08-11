import {Component, OnInit} from "@angular/core";
import {TeamService} from "../services/team.service";
import {ITeam} from "../../../shared/models/team";
import {ActivatedRoute, ParamMap} from "@angular/router";

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

    constructor( private teamService: TeamService, private route: ActivatedRoute ) {
    }

    public async ngOnInit()
    {

        this.route.paramMap.switchMap( ( params: ParamMap ) =>
            this.teamService.getByName( params.get('name')))
            .subscribe( ( team: ITeam ) => this.currentTeam = team );
    }
}
