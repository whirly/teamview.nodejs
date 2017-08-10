import { composeWithMongoose } from 'graphql-compose-mongoose';
import {Fixture} from "../models";
import {IMongooseFixture} from "../models/fixture";
import { TYPE_COMPOSER as teamType } from './graphql-team';
import { TYPE_COMPOSER as performanceType } from './graphql-performance';

const type = composeWithMongoose(Fixture);

export const TYPE_COMPOSER = type;

type.addRelation('home.team', () => ({
    resolver: teamType.get('$findById'),
    prepareArgs: { _id: (source: IMongooseFixture ) => source.home.team },
    projection: { team: 1 }
}));


type.addRelation('home.performances', () => ({
    resolver: performanceType.get('$findByIds'),
    prepareArgs: { _ids: (source: IMongooseFixture ) => source.home.performances },
    projection: { performances: 1 }
}));


export const QUERIES = {
    fixtureById: type.get('$findById'),
    fixture: type.get('$findOne'),
    fixtureConnection: type.get('$connection'),
    fixtures: type.get('$findMany')
};

export const MUTATIONS = {
};

