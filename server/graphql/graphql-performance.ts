import { composeWithMongoose } from 'graphql-compose-mongoose';
import {Performance} from "../models";
import {IMongoosePerformance} from "../models/performance";

import { TYPE_COMPOSER as playerType } from "./graphql-player";
import { TYPE_COMPOSER as teamType } from "./graphql-team";

const type = composeWithMongoose(Performance);

export const TYPE_COMPOSER = type;

type.addRelation('player', {
    resolver: () => playerType.getResolver('findById'),
    prepareArgs: { _id: (source: IMongoosePerformance) => source.player },
    projection: { player: true }
});

type.addRelation('team', {
    resolver: () => teamType.getResolver('findById'),
    prepareArgs: { _id: (source: IMongoosePerformance) => source.team },
    projection: { team: true }
});

export const QUERIES = {
    performanceById: type.get('$findById'),
    performance: type.get('$findOne'),
    performanceConnection: type.get('$connection'),
    performances: type.get('$findMany')
};

export const MUTATIONS = {
};
