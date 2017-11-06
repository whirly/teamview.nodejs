import * as _ from "lodash";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Headers,Http,Response} from '@angular/http';
import {ILeagueMPG, IPlayerMercatoMPG, IUserMPG} from "../../../shared/models/pelouse";
import {AsyncSubject} from "rxjs/AsyncSubject";

@Injectable()
export class PelouseService {

    private urlApi: string = "https://api.monpetitgazon.com";
    private loginApi: string = this.urlApi + "/user/signIn";
    private dashboardApi: string = this.urlApi + "/user/dashboard";
    private mercatoApi: string = this.urlApi + "/league/";
    private mercatoApiSecondPart: string = "/transfer/buy";

    private user: any;

    private logged: AsyncSubject<boolean> = new AsyncSubject<boolean>();
    private isLoggedIn: boolean = false;

    constructor(private http: Http) {
        // On essaye de récupérer les infos depuis le local storage.
        // Cela nous évite de faire une requête pour le signIn si on a encore
        // le token d'identification.
        let user = localStorage.getItem( 'currentUser' );
        if( user ) {
            this.user = JSON.parse( user );
            this.isLoggedIn = true;
        }
        else {
            this.isLoggedIn = false;
        }
        this.logged.next( this.isLoggedIn );
        this.logged.complete();
    }

    public loggedIn(): Observable<boolean> {
        return this.logged;
    }

    public isLogged(): boolean {
        return this.isLoggedIn;
    }

    public getLeagues(): Observable<ILeagueMPG[]> {

        let headers: Headers = new Headers({'Authorization': this.user.token});

        return this.http.get( this.dashboardApi, { headers: headers })
            .map( (response: Response) => {
                let data: any = response.json().data;
                console.log(data);
                return data.leagues;
            });
    }

    public getPlayersAvailableForLeague( league: string ): Observable<string[]> {

        let headers: Headers = new Headers({'Authorization': this.user.token});

        return this.http.get( this.mercatoApi + league + this.mercatoApiSecondPart, { headers: headers })
            .map( (response: Response) => {
                let players: IPlayerMercatoMPG[] = response.json().availablePlayers;
                return _.map( players, (player:IPlayerMercatoMPG) => player.id.slice( 7 ));
            })

    }

    public login( login: string, password: string ): Observable<IUserMPG>  {

        return this.http.post( this.loginApi, {
            email: login,
            password: password,
            language: "fr-FR"
        })
        .map((response) => response.json()).map( (response) => {
            let user:any = response;
            if( user && user.token ) {
                localStorage.setItem( 'currentUser', JSON.stringify(user));
                this.user = user;
                this.isLoggedIn = true;
                this.logged.next( this.isLoggedIn );
                this.logged.complete();
            }

            return user;
        });
    }

    public logout() {
        // On vire les données utilisateurs de la machine
        localStorage.removeItem( 'currentUser' );
    }
}
