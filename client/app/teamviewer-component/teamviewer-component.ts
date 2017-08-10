import {Component, OnInit} from "@angular/core";
import {TeamService} from "../services/team.service";
import {ITeam} from "../../../shared/models/team";
import {Observable} from "rxjs/Observable";

@Component({
    selector: 'teamview-teamviewer',
    templateUrl: './teamviewer-component.html',
    styleUrls: ['./teamviewer-component.scss']
})

export class TeamViewerComponent implements OnInit {
    public listTeams: Observable<ITeam[]>;
    public currentTeam: Observable<ITeam>;

    constructor( private teamService: TeamService ) {
    }

    public async ngOnInit() {
        this.listTeams = this.teamService.list;
        this.currentTeam = this.listTeams.map(teams => teams[0]);
    }
}
