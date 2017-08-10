import {Injectable} from "@angular/core";
import {ITeam} from "../../../shared/models/team";
import gql from "graphql-tag";
import {Apollo} from "apollo-angular";
import {Observable} from "rxjs/Observable";

@Injectable()
export class TeamService {

    constructor( private apollo: Apollo ) {
    }

    public get list(): Observable<ITeam[]> {
        return this.apollo.watchQuery<{ teams: ITeam[] }>({
            query: gql`{
                    teams {
                        idMpg
                        name
                        players {
                          idMpg
                          firstName
                          lastName
                          role
                          value
                        }
                        fixtures {
                          day
                          idMpg
                          _id
                        } 
                    }	  
                }`

        }).map(res => res.data.teams);
    }
}
