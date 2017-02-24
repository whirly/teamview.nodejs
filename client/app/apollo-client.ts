import { ApolloClient, createNetworkInterface } from 'apollo-client';

const networkInterface = createNetworkInterface({
    uri: `${process.env.SERVER_URL}/graphql`
});

networkInterface.use([{
    applyMiddleware(req, next) {
        next();
    }
}]);

export default new ApolloClient({
    networkInterface,
    dataIdFromObject: (object: any) => object._id
});
