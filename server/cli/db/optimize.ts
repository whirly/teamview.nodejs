import * as models from "../../models";
import {CommandModule} from "yargs";
import {connectDatabase, disconnectFromDatabase} from "../../mongoose";
import {ComputedType, ITeam} from "../../../shared/models";
import {
    getAveragePerformance,
    getGoalFor,
    getPenaltyFor,
    getStartingTime,
    getSubAndStartingTime
} from "../../../shared/models/player_helpers";
import logger from '../../logger';

interface IArgs {
    force?: boolean;
    login?: string;
    password?: string;
}

const command: CommandModule = {
    command: 'db:optimize',
    describe: 'Precompute a set of data to speed up client',
    builder: {},
    handler
};

export default command;


export async function crunchPlayersData(): Promise<void> {
    let players = await models.Player.find().populate('performances').populate('team').exec();
    let teams = await models.Team.find().populate('fixtures').exec();

    for (let player of players) {

        player.performances = player.performances.filter( performance => performance.year == 2020 );

        // On vérifie si c'est un joueur actif, pour ça on regarde s'il est dans le roster de l'équipe
        // qu'il considère comme la sienne et en premier lieu s'il en a une.
        let team: ITeam;

        if( player.team ) {
            team = teams.find( team => team._id.equals( player.team._id ));
        }

        if (team && player.performances.length > 0) {
            logger.info( player.firstName + ' ' + player.lastName );

            const numberOfDaysPlayed = team.fixtures.filter( fixture => fixture.year == 2020 ).length;

            let playerToWrite = await models.Player.findOne({idMpg: player.idMpg});
            playerToWrite.currentlyActive = true;

            // On ne garde que les performances de cette année.

            // Ok le mec est "actif" dans l'équipe, on va calculer.
            // Actif est un bien grand mot quand c'est un mec qui joue avec la réserve
            playerToWrite.computed = [
                { rating: 0, goal: 0, penalty: 0, playedFromStart: 0, played: 0 },
                { rating: 0, goal: 0, penalty: 0, playedFromStart: 0, played: 0 },
                { rating: 0, goal: 0, penalty: 0, playedFromStart: 0, played: 0 },
                { rating: 0, goal: 0, penalty: 0, playedFromStart: 0, played: 0 }
                ];


            playerToWrite.computed[ComputedType.ALL].rating = getAveragePerformance(player, 1);
            playerToWrite.computed[ComputedType.THREE_DAYS].rating = getAveragePerformance(player, numberOfDaysPlayed - 2);
            playerToWrite.computed[ComputedType.FIVE_DAYS].rating = getAveragePerformance(player, numberOfDaysPlayed - 4);
            playerToWrite.computed[ComputedType.TEN_DAYS].rating = getAveragePerformance(player, numberOfDaysPlayed - 9);

            playerToWrite.computed[ComputedType.ALL].goal = getGoalFor(player, 1);
            playerToWrite.computed[ComputedType.THREE_DAYS].goal = getGoalFor(player, numberOfDaysPlayed - 2);
            playerToWrite.computed[ComputedType.FIVE_DAYS].goal = getGoalFor(player, numberOfDaysPlayed - 4);
            playerToWrite.computed[ComputedType.TEN_DAYS].goal = getGoalFor(player, numberOfDaysPlayed - 9);

            playerToWrite.computed[ComputedType.ALL].penalty = getPenaltyFor(player, 1);
            playerToWrite.computed[ComputedType.THREE_DAYS].penalty = getPenaltyFor(player, numberOfDaysPlayed - 2);
            playerToWrite.computed[ComputedType.FIVE_DAYS].penalty = getPenaltyFor(player, numberOfDaysPlayed - 4);
            playerToWrite.computed[ComputedType.TEN_DAYS].penalty = getPenaltyFor(player, numberOfDaysPlayed - 9);

            playerToWrite.computed[ComputedType.ALL].playedFromStart = getStartingTime(player, 1, numberOfDaysPlayed);
            playerToWrite.computed[ComputedType.THREE_DAYS].playedFromStart = getStartingTime(player, numberOfDaysPlayed - 2, numberOfDaysPlayed);
            playerToWrite.computed[ComputedType.FIVE_DAYS].playedFromStart = getStartingTime(player, numberOfDaysPlayed - 4, numberOfDaysPlayed);
            playerToWrite.computed[ComputedType.TEN_DAYS].playedFromStart = getStartingTime(player, numberOfDaysPlayed - 9, numberOfDaysPlayed);

            playerToWrite.computed[ComputedType.ALL].played = getSubAndStartingTime(player, 1, numberOfDaysPlayed);
            playerToWrite.computed[ComputedType.THREE_DAYS].played = getSubAndStartingTime(player, numberOfDaysPlayed - 2, numberOfDaysPlayed);
            playerToWrite.computed[ComputedType.FIVE_DAYS].played = getSubAndStartingTime(player, numberOfDaysPlayed - 4, numberOfDaysPlayed);
            playerToWrite.computed[ComputedType.TEN_DAYS].played = getSubAndStartingTime(player, numberOfDaysPlayed - 9, numberOfDaysPlayed);

            await playerToWrite.save();
        } else {
            logger.warn( player.firstName + ' ' + player.lastName );

            // Le mec n'a pas d'équipe, on va le noter inactif histoire qu'il arrête de faire chier.
            let playerToWrite = await models.Player.findOne({idMpg: player.idMpg});

            playerToWrite.computed = [
                { rating: 0, goal: 0, penalty: 0, playedFromStart: 0, played: 0 },
                { rating: 0, goal: 0, penalty: 0, playedFromStart: 0, played: 0 },
                { rating: 0, goal: 0, penalty: 0, playedFromStart: 0, played: 0 },
                { rating: 0, goal: 0, penalty: 0, playedFromStart: 0, played: 0 }
            ];

            playerToWrite.currentlyActive = false;
            await playerToWrite.save();
        }
    }
}

async function handler(args: IArgs): Promise<void> {
    await connectDatabase(process.env.MONGO_URL);

    // On traite tous les joueurs
    await crunchPlayersData();

    await disconnectFromDatabase();

}
