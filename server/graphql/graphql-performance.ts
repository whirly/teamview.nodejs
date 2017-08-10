import { composeWithMongoose } from 'graphql-compose-mongoose';
import {Performance} from "../models";

const type = composeWithMongoose(Performance);

export const TYPE_COMPOSER = type;

export const QUERIES = {
    performanceById: type.get('$findById'),
    performance: type.get('$findOne'),
    performanceConnection: type.get('$connection'),
    performances: type.get('$findMany')
};

export const MUTATIONS = {
};

