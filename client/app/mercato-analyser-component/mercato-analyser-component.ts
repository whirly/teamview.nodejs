import {Component, OnInit} from "@angular/core";
import {PelouseService} from "../services/pelouse.service";
import {IFullMercatoMPG, ILeagueMPG, IUserMPG} from "../../../shared/models/pelouse";
import _ from "lodash";
import {PlayerPosition} from "../../../shared/models/player";

@Component({
    selector: 'teamview-mercato-analyser',
    templateUrl: './mercato-analyser-component.html',
    styleUrls: ['./mercato-analyser-component.scss']
})

export class MercatoAnalyserComponent implements OnInit {

    public mercatoAvailable: boolean = false;
    public availableLeagues: ILeagueMPG[] = [];
    public filterLeague: string = "";
    public user: IUserMPG;

    public login: string;
    public password: string;

    public mercatoHistory: IFullMercatoMPG = undefined;
    public positionShortForm: Map<PlayerPosition, string> = new Map<PlayerPosition, string>();

    constructor( private pelouseService: PelouseService ) {

    }

    public async ngOnInit() {

        // Initialisation du convertisseur de shortform
        // TODO: penser à factoriser ce bout de code qui a tendance àrevenir
        this.positionShortForm.set(PlayerPosition.Goal, "G");
        this.positionShortForm.set(PlayerPosition.Defender, "D");
        this.positionShortForm.set(PlayerPosition.Midfield, "M");
        this.positionShortForm.set(PlayerPosition.Striker, "A");


        // On explique que lors d'un événement de login, on est intéressé.
        this.pelouseService.logIn().subscribe((logged: boolean) => {
            this.mercatoAvailable = false;

            // Si on vient de se logguer, on choppe les infos sur les leagues.
            if( logged ) {
                this.pelouseService.getLeagues().subscribe((leagues: ILeagueMPG[]) => {

                    this.availableLeagues = _.filter( leagues, (league: ILeagueMPG) => {
                        return league.leagueStatus == 4;
                    });

                    this.mercatoAvailable = true;
                });
            }
        });
    }

    // Connexion du mercato.
    // Il s'agit de connecter son mercato MPG à l'application, afin de permettre de sélectionner
    // la ligue dont on veut analyser le mercato.
    public connectMercato(): void {
        this.pelouseService.login(this.login, this.password).subscribe( (user:IUserMPG) => {
            this.user = user;
        });
    }

    // Changement du filtre sur le mercato
    public filterByLeague(leagueName: string): void {
        if (this.filterLeague != leagueName) {
            this.filterLeague = leagueName;

            this.pelouseService.getMercatoForLeague(this.filterLeague).subscribe((mercatoHistory: IFullMercatoMPG) => {
                this.mercatoHistory = mercatoHistory;

                for( let user of this.mercatoHistory.usersMercato ) {
                    user.players = _.orderBy( user.players, ['price_paid'], ['desc']);
                }
            })
        }
    }

    public isFilterLeague(leagueName: string): string {
        if (this.filterLeague == leagueName) return "active";
        else return "";
    }

    // Cette méthode pour permettre à Saint Etienne d'exister commence à se reproduire à droite et à gauche.
    public getEmblemClass(team: string) {
        if (team) {
            return team.replace(" ", "");
        } else {
            return "";
        }
    }

    public getCircleClassFor(role: PlayerPosition) {
        return "circle-" + this.positionShortForm.get(role);
    }


    public getAmountOfLeagues(): string {
        switch (this.availableLeagues.length) {
            case 0:
                return "one";
            case 1:
                return "two";
            case 2:
                return "three";
            case 3:
                return "four";
            case 4:
                return "five";
            case 5:
                return "six";
            case 6:
                return "seven";
            case 7:
                return "eight";
            // Au delà de huit ligues, je me pose des questions sur votre santé mentale.
            default:
                return "nine";
        }
    }
}