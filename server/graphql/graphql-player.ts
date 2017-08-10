import { composeWithMongoose } from 'graphql-compose-mongoose';
import {Player} from "../models";

const type = composeWithMongoose(Player);

export const TYPE_COMPOSER = type;

export const QUERIES = {
    playerById: type.get('$findById'),
    player: type.get('$findOne'),
    playerConnection: type.get('$connection'),
    players: type.get('$findMany')
};

export const MUTATIONS = {
};

