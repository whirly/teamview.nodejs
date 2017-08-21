import {Component, OnInit} from "@angular/core";
import {PlayerService} from "../services/player.service";
import {IPlayer} from "../../../shared/models/player";
import _ from "lodash";

@Component({
    selector: 'teamview-playersviewer',
    templateUrl: './playersviewer-component.html',
    styleUrls: ['./playersviewer-component.scss']
})

export class PlayersViewerComponent implements OnInit {

    public playersAll: IPlayer[];
    public playersActive: IPlayer[];
    public players: {};

    constructor( private playerService: PlayerService,  ) {

    }

    public async ngOnInit() {
        this.playerService.list.subscribe( ( players: IPlayer[] ) => {
            this.playersAll = players;

            // First we remove players who are not active.
            this.playersActive = _.filter( this.playersAll, ( player: IPlayer ) => {
               return player.performances.length > 0;
            });

            this.players = _.groupBy( this.playersActive, 'role' );
            console.log( this.players );
        });
    }
}
