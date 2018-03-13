import { composeWithMongoose } from 'graphql-compose-mongoose';
import {Player} from "../models";
import { TYPE_COMPOSER as performanceType } from "./graphql-performance";
import { TYPE_COMPOSER as teamType } from "./graphql-team";
import {IMongoosePlayer} from "../models/player";

const type = composeWithMongoose(Player);

export const TYPE_COMPOSER = type;

type.addRelation('performances', {
    resolver: () => performanceType.getResolver('findByIds'),
    prepareArgs: { _ids: (source: IMongoosePlayer) => source.performances },
    projection: { performances: 1 }
});

type.addRelation('team', {
    resolver: () => teamType.getResolver('findById'),
    prepareArgs: { _id: (source: IMongoosePlayer) => source.team },
    projection: { team: true }
});

export const QUERIES = {
    playerById: type.get('$findById'),
    player: type.get('$findOne'),
    playerConnection: type.get('$connection'),
    players: type.get('$findMany')
};

export const MUTATIONS = {
};
