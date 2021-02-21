import { composeWithMongoose } from 'graphql-compose-mongoose';
import { UserRole } from '../models';

const type = composeWithMongoose(UserRole);

export const TYPE_COMPOSER = type;

export const QUERIES: any = {
};

export const MUTATIONS: any = {
};
