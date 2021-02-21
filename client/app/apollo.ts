import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApolloClientOptions, ApolloLink, InMemoryCache } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { HttpBatchLink, HttpLink } from 'apollo-angular/http';

export function provideApolloLink(httpClient: HttpClient): ApolloLink {
    const commonOptions = { uri: `${process.env.ADMIN_SERVER_URL}/graphql` };

    //=> Use batch link only in prod to improve performance and not reduce DX in development
    return process.env.NODE_ENV == 'production'
        ? new HttpBatchLink(httpClient).create({ ...commonOptions, batchInterval: 10 })
        : new HttpLink(httpClient).create({ ...commonOptions });
}

export function provideApolloClientOptions(
    httpLink: ApolloLink): ApolloClientOptions<any> {

    const middleware = setContext((operation, prevContext) => {
        let headers = new HttpHeaders();

        //=> Inject the currently-used language
        headers.set('X-App-Language', 'fr');

        return { ...prevContext, headers };
    });

    const link = ApolloLink.from([middleware, httpLink]);

    const cache = new InMemoryCache({
        dataIdFromObject: obj => (obj as any)._id
    });

    return {
        link, cache,
        defaultOptions: {
            query: {
                errorPolicy: 'all'
            },
            watchQuery: {
                fetchPolicy: 'cache-and-network',
                errorPolicy: 'all',
                notifyOnNetworkStatusChange: true
            },
            mutate: {
                errorPolicy: 'all'
            }
        }
    };
}
