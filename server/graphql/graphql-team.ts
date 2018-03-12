import { composeWithMongoose } from 'graphql-compose-mongoose';
import { Team } from '../models';
import {IMongooseTeam} from "../models/team";
import { TYPE_COMPOSER as playerType } from './graphql-player';
import { TYPE_COMPOSER as fixtureType } from './graphql-fixture';

const type = composeWithMongoose(Team);

export const TYPE_COMPOSER = type;

type.addRelation('players', {
    resolver: () => playerType.getResolver('findByIds'),
    prepareArgs: { _ids: (source: IMongooseTeam) => source.players },
    projection: { players: true }
});

type.addRelation('fixtures', {
    resolver: () => fixtureType.getResolver('findByIds'),
    prepareArgs: { _ids: (source: IMongooseTeam) => source.fixtures },
    projection: { fixtures: 1 }
});

export const QUERIES = {
    teamById: type.get('$findById'),
    team: type.get('$findOne'),
    teamConnection: type.get('$connection'),
    teams: type.get('$findMany')
};

export const MUTATIONS = {
};
