import { composeWithMongoose } from 'graphql-compose-mongoose';
import {Fixture} from "../models";
import { TYPE_COMPOSER as teamType } from './graphql-team';
import { TYPE_COMPOSER as performanceType } from './graphql-performance';
import {IFixtureSide} from "../../shared/models/fixture";
import {ObjectTypeComposer} from "graphql-compose";

const type = composeWithMongoose(Fixture);

export const TYPE_COMPOSER = type;

const typeHomeTC = type.getFieldTC('home') as ObjectTypeComposer;
const typeAwayTC = type.getFieldTC('away') as ObjectTypeComposer;

typeHomeTC.addRelation('team', {
    resolver: () => teamType.getResolver('findById'),
    prepareArgs: { _id: (source: IFixtureSide) => source.team },
    projection: { team: true }
});

typeHomeTC.addRelation('performances', {
    resolver: () => performanceType.getResolver('findByIds'),
    prepareArgs: { _ids: (source: IFixtureSide) => source.performances },
    projection: { performances: true }
});

typeAwayTC.addRelation('team', {
    resolver: () => teamType.getResolver('findById'),
    prepareArgs: { _id: (source: IFixtureSide) => source.team },
    projection: { team: true }
});

typeAwayTC.addRelation('performances', {
    resolver: () => performanceType.getResolver('findByIds'),
    prepareArgs: { _ids: (source: IFixtureSide) => source.performances },
    projection: { performances: true }
});

export const QUERIES = {
    fixtureById: type.get('$findById'),
    fixture: type.get('$findOne'),
    fixtureConnection: type.get('$connection'),
    fixtures: type.get('$findMany')
};

export const MUTATIONS = {
};
