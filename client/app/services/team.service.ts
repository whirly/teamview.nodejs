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

    public getByName( name: string ): Observable<ITeam> {

        const teamByName = gql`
            query ($name: String!) {
                	team( filter: { name: $name }) {
                        _id
                        name
                        players {
                          firstName
                          lastName
                          role
                          value
                          performances {
                            team
                            day
                            position
                            place
                            rate
                            goalFor
                            goalAgainst
                            cardYellow
                            cardRed
                            sub
                          }
                        }
                        fixtures {
                          day      
                        }
                    }
            }`;

        return this.apollo.watchQuery<{ team: ITeam }>( {
            query: teamByName,
            variables: {
                name: name
            }
        }).map( res => res.data.team );
    }
}
