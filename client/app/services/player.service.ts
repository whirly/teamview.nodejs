import {Injectable} from "@angular/core";
import {Apollo} from "apollo-angular";
import {Observable} from "rxjs/Observable";
import {IPlayer} from "../../../shared/models/player";
import gql from "graphql-tag";

@Injectable()
export class PlayerService {

    constructor(private apollo: Apollo) {
    }

    public get list(): Observable<IPlayer[]> {
        return this.apollo.watchQuery<{ players: IPlayer[] }>({
            query: gql`{
                players {
                    firstName
                    lastName
                    team {
                        name
                    }
                    role
                    performances {
                        day
                        goalAgainst
                        goalFor
                        sub
                        rate
                        position
                        minutes
                        penaltyFor
                    }
                }
            }`
        }).map(res => res.data.players);
    }
}
