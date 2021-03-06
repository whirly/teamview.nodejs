
import {map} from 'rxjs/operators';
import {Injectable} from "@angular/core";
import {ITeam} from "../../../shared/models/team";
import gql from "graphql-tag";
import {Apollo } from "apollo-angular";
import {Observable} from "rxjs";


@Injectable()
export class TeamService {

    constructor(private apollo: Apollo) {
    }

    public get list(): Observable<ITeam[]> {
        return this.apollo.watchQuery<{ teams: ITeam[] }>({
            query: gql`{
                teams {
                    name
                    fixtures {
                        year
                        day
                    }
                }
            }`

        }).valueChanges.pipe(map(res => res.data.teams));
    }

    public getByName(name: string): Observable<ITeam> {

        const teamByName = gql`
            query ($name: String!) {
                team( filter: { name: $name }) {
                    name
                    fixtures {
                        year
                        day
                        home {
                            formation
                            performances {
                                goalFor
                                goalAgainst
                            }
                            average
                            median
                            variance
                            team {
                                name
                            }
                        }
                        away {
                            formation
                            performances {
                                goalFor
                                goalAgainst
                            }
                            average
                            median
                            variance
                            team {
                                name
                            }
                        }
                    }
                }
            }`;

        return this.apollo.watchQuery<{ team: ITeam }>({
            query: teamByName,
            variables: {
                name
            }
        }).valueChanges.pipe(map(res => res.data.team));
    }
}
