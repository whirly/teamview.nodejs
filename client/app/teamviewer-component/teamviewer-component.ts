import {Component, OnInit} from "@angular/core";
import {TeamService} from "../services/team.service";
import {ActivatedRoute, ParamMap} from "@angular/router";
import _ from "lodash";

import {IPlayer, PlayerPosition} from "../../../shared/models/player";
import {IPerformance} from "../../../shared/models/performance";
import {IFixture} from "../../../shared/models/fixture";
import {ITeam} from "../../../shared/models/team";

import * as player_helpers from "../../../shared/models/player_helpers";
import * as fixture_helpers from "../../../shared/models/fixture_helpers";

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

    constructor(private teamService: TeamService, private route: ActivatedRoute) {
    }

    public async ngOnInit() {

        this.route.paramMap.switchMap((params: ParamMap) =>
            this.teamService.getByName(params.get('name')))
            .subscribe((team: ITeam) => {
                this.currentTeam = team;

                this.activePlayers = _.filter(this.currentTeam.players, player => {
                    return player.performances.length > 0;
                });

                this.activePlayers = _.sortBy(this.activePlayers, ['role', 'lastName']);

                this.inactivePlayers = _.reject(this.currentTeam.players, player => {
                    return player.performances.length > 0;
                });

                this.inactivePlayers = _.sortBy(this.inactivePlayers, ['role', 'lastName']);
            });
    }

    public getColorForPlayerClass(player: IPlayer): string {
        switch (player.role) {
            case PlayerPosition.Goal:
                return "goalkeeper";

            case PlayerPosition.Defender:
                return "defender";

            case PlayerPosition.Midfield:
                return "midfielder";

            case PlayerPosition.Striker:
                return "striker";
        }

        return "";
    }

    // La méthode pour générer les entêtes de colonnes, on va simplement récupérer l'adversaire du jour
    public getColumnHeaderFor(day: number): string {
        if (this.currentTeam.fixtures) {
            const fixtureThisDay: IFixture = this.currentTeam.fixtures.find((fixture: IFixture) => {
                return fixture.day == day;
            });

            // Si on a l'info
            if (fixtureThisDay) {
                if (this.currentTeam.name == fixtureThisDay.home.team.name) {
                    return fixture_helpers.getHomeGoal(fixtureThisDay).toString()
                        + ":" + fixture_helpers.getAwayGoal(fixtureThisDay).toString() + " "
                        + fixtureThisDay.away.team.name;
                } else {
                    return fixtureThisDay.home.team.name + " "
                        + fixture_helpers.getHomeGoal(fixtureThisDay).toString()
                        + ":" + fixture_helpers.getAwayGoal(fixtureThisDay).toString();
                }
            } else {
                // Nous
                return day.toString();
            }
        }

        return day.toString();
    }

    public hasScored(player: IPlayer, day: number): boolean {
        return player_helpers.hasScored(player, day);
    }

    public doShowYellowCard(player: IPlayer, day: number): boolean {
        return player_helpers.hasYellowCard(player, day) && !player_helpers.hasRedCard(player, day);
    }

    public doShowRedCard(player: IPlayer, day: number): boolean {
        return player_helpers.hasRedCard(player, day);
    }

    public getGoalForDay(player: IPlayer, day: number): number {
        return player_helpers.getGoalForDay(player, day);
    }

    public hasScoredAgainst(player: IPlayer, day: number): boolean {
        return player_helpers.hasScoredAgainst(player, day);
    }

    public getGoalAgainstForDay(player: IPlayer, day: number): number {
        return player_helpers.getGoalAgainstForDay(player, day);
    }

    public getPerformanceFor(player: IPlayer, day: number): string {
        if (player) {
            const performanceThisDay: IPerformance = player.performances.find((performance: IPerformance) => {
                return performance.day == day;
            });

            if (performanceThisDay) {
                let label: string = performanceThisDay.rate.toString();
                return label;
            }
        }

        return "-";
    }

    public getRange(value: number): number[] {
        let a = [];

        for (let i = 0; i < this.currentTeam.fixtures.length; i++) {
            a.push(i + 1);
        }

        return a;
    }

    // Récupère la note moyenne du joueur, on ne pose la question que pour des joueurs "actifs"
    // Ils ont donc forcément une note
    public getAverageForPlayer(player: IPlayer): string {
        return player_helpers.getAveragePerformance(player).toString();
    }

    // Méthode pour récupérer l'affichage des buts contre
    public getGoalAgainst(player: IPlayer): string {
        const goal: number = player_helpers.getGoalAgainst(player);

        if (goal > 0) {
            return goal.toString();
        } else {
            return "-";
        }
    }

    // Méthode pour récupérer l'affichage des buts pour
    public getGoalFor(player: IPlayer): string {

        const goal: number = player_helpers.getGoalFor(player);

        if (goal > 0) {
            return goal.toString();
        } else {
            return "-";
        }
    }

    // J'avais le choix entre attendre que Saint Etienne finisse en ligue 2 ou traiter les noms qui contiennent des espaces
    // J'ai choisi la deuxième solution.
    public getEmblemClass(team: string) {
        return team.replace(" ", "");
    }
}
