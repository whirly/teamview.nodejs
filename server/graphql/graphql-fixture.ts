import { composeWithMongoose } from 'graphql-compose-mongoose';
import {Fixture} from "../models";

const type = composeWithMongoose(Fixture);

export const TYPE_COMPOSER = type;

export const QUERIES = {
    fixtureById: type.get('$findById'),
    fixture: type.get('$findOne'),
    fixtureConnection: type.get('$connection'),
    fixtures: type.get('$findMany')
};

export const MUTATIONS = {
};

