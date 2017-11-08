import * as _ from "lodash";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Headers, Http, Response} from '@angular/http';
import {ILeagueMPG, IPlayerMercatoMPG, IUserMPG} from "../../../shared/models/pelouse";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Injectable()
export class PelouseService {

    private urlApi: string = "https://api.monpetitgazon.com";
    private loginApi: string = this.urlApi + "/user/signIn";
    private dashboardApi: string = this.urlApi + "/user/dashboard";
    private mercatoApi: string = this.urlApi + "/league/";
    private mercatoApiSecondPart: string = "/transfer/buy";

    private user: any;

    private loggedIn: boolean = false;
    private isLoggedInSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>( false );

    constructor(private http: Http) {
        // On essaye de récupérer les infos depuis le local storage.
        // Cela nous évite de faire une requête pour le signIn si on a encore
        // le token d'identification.
        const user = localStorage.getItem('currentUser');
        if (user) {
            this.user = JSON.parse(user);
            this.loggedIn = true;
        } else {
            this.loggedIn = false;
        }
        this.isLoggedInSubject.next(this.loggedIn);
        this.isLoggedInSubject.next(this.loggedIn);
    }

    public logIn() : Observable<boolean> {
        return this.isLoggedInSubject.asObservable();
    }

    public getLeagues(): Observable<ILeagueMPG[]> {

        const headers: Headers = new Headers({Authorization: this.user.token});

        return this.http.get(this.dashboardApi, {headers})
            .map((response: Response) => {
                const data: any = response.json().data;
                return data.leagues;
            });
    }

    public getPlayersAvailableForLeague(league: string): Observable<string[]> {

        const headers: Headers = new Headers({Authorization: this.user.token});

        return this.http.get(this.mercatoApi + league + this.mercatoApiSecondPart, {headers})
            .map((response: Response) => {
                const players: IPlayerMercatoMPG[] = response.json().availablePlayers;
                return _.map(players, (player: IPlayerMercatoMPG) => player.id.slice(7));
            });
    }

    public login(login: string, password: string): Observable<IUserMPG> {

        return this.http.post(this.loginApi, {
            email: login,
            password,
            language: "fr-FR"
        })
            .map((response) => response.json()).map((response) => {
                const user: any = response;
                if (user && user.token) {
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    this.user = user;
                    this.loggedIn = true;
                    this.isLoggedInSubject.next(this.loggedIn);
                }

                return user;
            });
    }

    public logout() {
        // On vire les données utilisateurs de la machine
        localStorage.removeItem('currentUser');
    }
}
