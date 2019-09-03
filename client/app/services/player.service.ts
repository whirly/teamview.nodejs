
import {map} from 'rxjs/operators';
import {Injectable} from "@angular/core";
import {Apollo} from "apollo-angular";
import {Observable} from "rxjs";
import {IPlayer} from "../../../shared/models";
import gql from "graphql-tag";


@Injectable()
export class PlayerService {

    constructor(private apollo: Apollo) {
    }

    public get list(): Observable<IPlayer[]> {
        return this.apollo.watchQuery<{ players: IPlayer[] }>({
            query: gql`{
                players( limit: 10000 ) {
                    firstName
                    lastName
                    idMpg
                    team {
                        name
                    }
                    role
                    value
                    performances {
                        year
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
        }).valueChanges.pipe(map(res => res.data.players));
    }

    public get(idMpg: string): Observable<IPlayer> {
        const playerById = gql`
            query ($idMpg: String!) {
                player( filter: { idMpg: $idMpg }) {
                    firstName
                    lastName
                    team {
                        name
                        fixtures {
                            year
                            away {
                                team {
                                    name
                                }
                            }
                            home {
                                team {
                                    name
                                }
                            }
                        }
                    }
                    role
                    value
                    performances {
                        team {
                            name
                        }
                        year
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
            }`;

        return this.apollo.watchQuery<{ player: IPlayer }>({
            query: playerById,
            variables: {
                idMpg
            }
        }).valueChanges.pipe(map(res => res.data.player));

    }
}
