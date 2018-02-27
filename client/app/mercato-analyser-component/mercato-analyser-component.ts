import {Component, OnInit} from "@angular/core";
import {PelouseService} from "../services/pelouse.service";
import {IFullMercatoMPG, ILeagueMPG, IUserMPG} from "../../../shared/models/pelouse";
import _ from "lodash";
import {IPlayer, IPlayerExtended, PlayerPosition} from "../../../shared/models/player";
import {ITeam} from "../../../shared/models/team";
import * as player_helpers from "../../../shared/models/player_helpers";
import {TeamService} from "../services/team.service";
import {PlayerService} from "../services/player.service";
import {Mercato, MercatoOffer, MercatoUser, PlayerWithOffers} from "../../../shared/models/mercato";

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

    // List all teams
    public teams: ITeam[];

    // List of all players
    public playersAll: IPlayerExtended[] = [];
    public playersBought: IPlayerExtended[] = [];

    // Transformed data
    public mercato: Mercato = new Mercato();

    constructor( private pelouseService: PelouseService, private teamService: TeamService, private playerService: PlayerService  ) {

    }

    public async ngOnInit() {

        // Initialisation du convertisseur de shortform
        // TODO: penser à factoriser ce bout de code qui a tendance à revenir
        this.positionShortForm.set(PlayerPosition.Goal, "G");
        this.positionShortForm.set(PlayerPosition.Defender, "D");
        this.positionShortForm.set(PlayerPosition.Midfield, "M");
        this.positionShortForm.set(PlayerPosition.Striker, "A");

        this.teamService.list.subscribe((teams: ITeam[]) => {
            this.teams = teams;

            this.playerService.list.subscribe((players: IPlayer[]) => {
                this.playersAll = _.cloneDeep(players);

                // On ne vire pas les joueurs inactifs, parce que figurez vous que des gens les achètent.

                // On a isolé la construction des différentes listes dans une fonction, vu qu'on va sans doute
                // la customiser pour régler la profondeur de données que l'on utilise.
                this.buildData();
            });

            // Une fois les infos de base récupéré, on va voir du côté des mercato
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
        });

    }

    private async buildData() {
        _.forEach(this.playersAll,
            (player: IPlayerExtended) => {
                let numberOfFixtures: number = 0;

                if (player.team) {
                    const myteam = this.teams.find((team: ITeam) => {
                        return team.name == player.team.name;
                    });

                    numberOfFixtures = myteam.fixtures.length;
                }

                // Le calcul des données s'effectue sur l'ensemble des matchs
                // TODO: un calcul peut être sur les match depuis l'achat des joueurs pourrait être sympa
                player_helpers.initializeExtendedData(player, numberOfFixtures, 0);
            });
    }

    // Cette fonction mouline toutes les données issue de l'API de MPG pour les mettre dans une forme plus facilement
    // exploitable. Genre certains retour sont clairement juste des raccourcis pour de l'affichage.
    private buildMercatoData() {

        // On créé un nouveau mercato
        this.mercato = new Mercato();

        // On ajoute les joueurs
        for( let user of this.mercatoHistory.usersMercato ) {
            let userMercato: MercatoUser = new MercatoUser( user );
            this.mercato.users.push( userMercato );
        }

        // On itère sur l'ensemble des tours de mercato
        for( let mercatoTurn in this.mercatoHistory.historyMercato ) {
            // On itère sur chaque joueur du mercato
            if (this.mercatoHistory.historyMercato.hasOwnProperty(mercatoTurn)) {

                for (let mercatoPlayer of this.mercatoHistory.historyMercato[ mercatoTurn ]) {

                    // On cherche la structure du joueur, on récupère l'idée sans le player_
                    let id: string = mercatoPlayer[0].id.slice(7);

                    let player: IPlayerExtended = this.playersAll.find(player => {
                        return player.idMpg == id;
                    });

                    let userWinning: MercatoUser = this.mercato.users.find(userCandidate => {
                        return userCandidate.teamName == mercatoPlayer[0].teamName;
                    });

                    userWinning.totalAcceptedOffers++;

                    let offer: PlayerWithOffers = new PlayerWithOffers();
                    offer.player = player;

                    // On itère sur chaque offre
                    for (let mercatoOffer of mercatoPlayer) {

                        let userCurrent: MercatoUser = this.mercato.users.find(userOther => {
                            return userOther.teamName == mercatoOffer.teamName;
                        });

                        userCurrent.totalOffers++;

                        let mercatoOfferCurrent: MercatoOffer = new MercatoOffer( userCurrent.teamId, mercatoOffer.price_paid);
                        offer.offers.push(mercatoOfferCurrent);
                    }

                    userWinning.players.push(offer);
                }
            }
        }

        // On construit les statistiques
        this.mercato.buildData();
        console.log(this.mercato);
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

                // On construit nos objets à nous à partir des données réceptionnés.
                this.buildMercatoData();
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
