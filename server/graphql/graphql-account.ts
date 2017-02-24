import { GraphQLNonNull, GraphQLString, GraphQLObjectType } from 'graphql';
import { Resolver } from 'graphql-compose';
import { forgeJwtTokenFor, getUserFromEmailAndPassword, getUserFromJwtToken } from '../auth';
import { ResolveParams } from '../auth/graphql-resolver-wrappers';
import { TYPE_COMPOSER as userTypeComposer } from './graphql-user';

const passwordAuthResultType = new GraphQLObjectType({
    name: 'PasswordAuthenticationResult',
    fields: {
        token: { type: new GraphQLNonNull(GraphQLString) },
        user: { type: new GraphQLNonNull(userTypeComposer.getType()) }
    }
});

const tokenAuthResultType = new GraphQLObjectType({
    name: 'TokenAuthenticationResult',
    fields: {
        user: { type: new GraphQLNonNull(userTypeComposer.getType()) }
    }
});

export const QUERIES = {};

export const MUTATIONS = {
    loginWithPassword: new Resolver({
        name: 'loginWithPassword',
        type: passwordAuthResultType,
        args: {
            email: { type: new GraphQLNonNull(GraphQLString) },
            password: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: loginWithPasswordResolver
    }),
    loginWithToken: new Resolver({
        name: 'loginWithToken',
        type: tokenAuthResultType,
        args: {
            token: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: loginWithTokenResolver
    })
};

async function loginWithPasswordResolver({ args, context }: ResolveParams) {
    const user = await getUserFromEmailAndPassword(args.email, args.password);

    context.user = user;

    return { token: forgeJwtTokenFor(user), user };
}

async function loginWithTokenResolver({ args, context }: ResolveParams) {
    const user = await getUserFromJwtToken(args.token);

    context.user = user;

    return { user };
}
