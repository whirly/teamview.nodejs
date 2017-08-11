import { GraphQLNonNull } from 'graphql';
import { composeWithMongoose, GraphQLMongoID } from 'graphql-compose-mongoose';
import { requirePermission } from '../auth/graphql-resolver-wrappers';
import { User, UserRole, IMongooseUser } from '../models';
import { TYPE_COMPOSER as userRoleType } from './graphql-user-role';

const type = composeWithMongoose(User, {
    fields: { remove: ['role', 'password'] }
});

export const TYPE_COMPOSER = type;

type.addRelation('role', {
    resolver: userRoleType.get('$findById'),
    prepareArgs: { _id: (source: IMongooseUser) => source.role },
    projection: { role: true }
});

type.addResolver({
    name: 'currentUser',
    type: type.getType(),
    resolve: currentUserResolver
});

type.addResolver({
    name: 'grantUserById',
    type: type.getType(),
    args: {
        userId: { type: new GraphQLNonNull(GraphQLMongoID) },
        roleName: { type: 'String!' }
    },
    resolve: grantUserByIdResolver
});

export const QUERIES = {
    currentUser: type.get('$currentUser'),
    userById: type.get('$findById'),
    user: type.get('$findOne'),
    userConnection: type.get('$connection')
};

export const MUTATIONS = {
    ...requirePermission('users#list-read', {
        createUser: type.get('$createOne'),
        updateUser: type.get('$updateById'),
        removeUserById: type.get('$removeById'),
        grantUserById: type.get('$grantUserById')
    })
};

async function currentUserResolver({ context }: any): Promise<IMongooseUser> {
    return await context.user;
}

async function grantUserByIdResolver({ args }: any): Promise<IMongooseUser> {
    const role = await UserRole.findOne({ name: args.roleName });

    return await User.findByIdAndUpdate(args.userId, { $set: { role } }, { new: true });
}
