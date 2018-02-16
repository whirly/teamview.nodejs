import { Injectable } from '@angular/core';
import { ApolloLink } from 'apollo-link';
import { HttpLink } from 'apollo-angular-link-http';
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { Apollo } from 'apollo-angular';

@Injectable()
export class ApolloInitializer {
    constructor(
        private readonly apollo: Apollo,
        private readonly httpLink: HttpLink,
    ) { }

    public init() {
        const http = this.httpLink.create({ uri: `${process.env.SERVER_URL}/graphql` });

        const middleware = setContext((operation) => {
            //=> Inject auth token
            const headers: { [key: string]: string } = {};

            return { headers };
        });

        const link = ApolloLink.from([middleware, http]);
        const cache = new InMemoryCache();

        this.apollo.create({ link, cache });
    }
}
