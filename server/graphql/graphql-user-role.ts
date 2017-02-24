import { IGraphQlFields } from 'graphql-compose';
import composeWithMongoose from 'graphql-compose-mongoose';
import { UserRole } from '../models';

const type = composeWithMongoose(UserRole);

export const TYPE_COMPOSER = type;

export const QUERIES: IGraphQlFields = {
};

export const MUTATIONS: IGraphQlFields = {
};
