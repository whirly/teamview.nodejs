import { GraphQLNonNull } from 'graphql';
import { composeWithMongoose, GraphQLMongoID } from 'graphql-compose-mongoose';
import { User, UserRole, IMongooseUser } from '../models';
import { TYPE_COMPOSER as userRoleType } from './graphql-user-role';

const type = composeWithMongoose(User, {
    fields: { remove: ['role'] }
});

export const TYPE_COMPOSER = type;

type.addRelation('role', () => ({
    resolver: userRoleType.get('$findById'),
    args: { _id: (source: IMongooseUser) => source.role },
    projection: { role: true }
}));

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
    userById: type.get('$findById'),
    user: type.get('$findOne'),
    userConnection: type.get('$connection')
};

export const MUTATIONS = {
    createUser: type.get('$createOne'),
    updateUser: type.get('$updateById'),
    removeUserById: type.get('$removeById'),
    grantUserById: type.get('$grantUserById'),
};

async function grantUserByIdResolver({ args }: any): Promise<IMongooseUser> {
    const role = await UserRole.findOne({ name: args.roleName });

    return await User.findByIdAndUpdate(args.userId, { $set: { role } }, { new: true });
}
