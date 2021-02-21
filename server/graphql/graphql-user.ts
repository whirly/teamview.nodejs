import { GraphQLNonNull } from 'graphql';
import { composeWithMongoose, GraphQLMongoID } from 'graphql-compose-mongoose';
import { requirePermission } from '../auth/graphql-resolver-wrappers';
import { User, UserRole, IMongooseUser } from '../models';
import { QUERIES as userRoleQueries } from './graphql-user-role';

const tc = composeWithMongoose(User, {
    fields: { remove: ['role', 'password'] }
});

export const TYPE_COMPOSER = tc;


tc.addResolver({
    name: 'currentUser',
    type: tc.getType(),
    resolve: currentUserResolver
});

tc.addResolver({
    name: 'grantUserById',
    type: tc.getType(),
    args: {
        userId: { type: new GraphQLNonNull(GraphQLMongoID) },
        roleName: { type: 'String!' }
    },
    resolve: grantUserByIdResolver
});

export const QUERIES = {
    currentUser: tc.getResolver('currentUser'),
    userById: tc.getResolver('findById'),
    user: tc.getResolver('findOne'),
    userConnection: tc.getResolver('connection')
};

export const MUTATIONS = {
    ...requirePermission('users#list-read', {
        createUser: tc.getResolver('createOne'),
        updateUser: tc.getResolver('updateById'),
        removeUserById: tc.getResolver('removeById'),
        grantUserById: tc.getResolver('grantUserById')
    })
};

async function currentUserResolver({ context }: any): Promise<IMongooseUser> {
    return context.user;
}

async function grantUserByIdResolver({ args }: any): Promise<IMongooseUser> {
    const role = await UserRole.findOne({ name: args.roleName });

    return User.findByIdAndUpdate(args.userId, { $set: { role } }, { new: true });
}
