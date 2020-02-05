
import {map} from 'rxjs/operators';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Observable, BehaviorSubject} from "rxjs";
import {IFullMercatoMPG, ILeagueMPG, IMercatoMPG, IUserMPG} from "../../../shared/models/pelouse";


@Injectable()
export class PelouseService {

    private urlApi: string = "https://api.monpetitgazon.com";
    private loginApi: string = this.urlApi + "/user/signIn";
    private dashboardApi: string = this.urlApi + "/user/dashboard";
    private mercatoApi: string = this.urlApi + "/league/";
    private mercatoApiSecondPart: string = "/transfer/buy";

    private mercatoHistoryApi: string = this.urlApi + "/league/";
    private mercatoHistoryApiSecondPart: string = "pending_mercato";

    private user: any;

    private loggedIn: boolean = false;
    private isLoggedInSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor(private http: HttpClient) {
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

    public logIn(): Observable<boolean> {
        return this.isLoggedInSubject.asObservable();
    }

    public getLeagues(): Observable<ILeagueMPG[]> {

        const headers = new HttpHeaders().set("Authorization", this.user.token)
            .set("client-version", "5.8.2");

        return this.http.get<any>(this.dashboardApi, {
            headers
        }).pipe(map(response => response.data.leagues));
    }

    public getMercatoForLeague(league: string): Observable<IFullMercatoMPG> {
        const headers = new HttpHeaders().set("Authorization", this.user.token).set("client-version", "5.8.2");
        return this.http.get<IFullMercatoMPG>(this.mercatoHistoryApi + league + "/" + this.mercatoHistoryApiSecondPart, {headers});
    }

    public getPlayersAvailableForLeague(league: string): Observable<IMercatoMPG> {

        const headers = new HttpHeaders().set("Authorization", this.user.token).set("client-version", "5.8.2");
        return this.http.get<IMercatoMPG>(this.mercatoApi + league + this.mercatoApiSecondPart, {headers});
    }

    public login(login: string, password: string): Observable<IUserMPG> {

        return this.http.post<IUserMPG>(this.loginApi, {
            email: login,
            password,
            language: "fr-FR"
        }).pipe(
            map(user => {
                if (user && user.token) {
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    this.user = user;
                    this.loggedIn = true;
                    this.isLoggedInSubject.next(this.loggedIn);
                }

                return user;
            }));
    }

    public logout() {
        // On vire les données utilisateurs de la machine
        localStorage.removeItem('currentUser');
    }
}
