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

    public get(idMpg: string): Observable<IPlayer> {
        const playerById = gql`
            query ($idMpg: String!) {
                player( filter: { idMpg: $idMpg }) {
                    firstName
                    lastName
                    team {
                        name
                        fixtures {
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
            }`;

        return this.apollo.watchQuery<{ player: IPlayer }>( {
            query: playerById,
            variables: {
                idMpg: idMpg
            }
        }).map( res => res.data.player );

    }
}
