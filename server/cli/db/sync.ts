import { CommandModule } from 'yargs';
import logger from '../../logger';
import { connectDatabase, disconnectFromDatabase } from '../../mongoose';
import * as models from '../../models';

let request = require('request-promise');

interface IArgs {
    force?: boolean;
}

async function handler(args: IArgs): Promise<void> {

    let baseUrl: string = 'http://api.monpetitgazon.com/';

    if (!args.force && process.env.WEBPACK_ENV != 'development') {
        logger.error('You should not use db:seed on non-development environment. Use --force to bypass restriction.');
        process.exit(1);
    }

    await connectDatabase(process.env.MONGO_URL);
    logger.info('Loading players...');

    const response = await request( baseUrl + "quotation/1");
    let players = JSON.parse( response );

    // On commence par s'occuper des joueurs
    for ( let player of players ) {

        let existingPlayer = await models.Player.findOne( { idMpg: player.id } );

        if( existingPlayer ) {
            logger.info("Updating " + player.firstname + " " + player.lastname );

            let team = await models.Team.findOne({idMpg: player.teamid});

            // On a trouvé la team en question
            if( team ) {
                // Est ce que notre joueur n'est pas déjà dans cette équipe ?
                if( team.players.findIndex( item => item.equals( existingPlayer._id )) == -1 )
                {
                    // On l'ajoute
                    team.players.push( existingPlayer );
                    await team.save();
                }
            } else {
                // La team n'existe pas encore
                team = await models.Team.create({
                    idMpg: player.teamid,
                    name: player.club
                });
            }

            // On met à jour le joueur avec les infos qui sont susceptibles d'avoir changé (valeur, role, équipe)
            // Et on sauvegarde le tout.
            existingPlayer.value = player.quotation;
            existingPlayer.role = player.position;
            existingPlayer.teamId = team._id;
            await existingPlayer.save();

        } else {
            logger.info("Adding " + player.firstname + " " + player.lastname);

            let playerNew = await models.Player.create({
                firstName: player.firstname,
                lastName: player.lastname,
                idMpg: player.id,
                role: player.position,
                value: player.quotation
            });

            let team = await models.Team.findOne({idMpg: player.teamid});

            if (!team) {
                team = await models.Team.create({
                    idMpg: player.teamid,
                    name: player.club
                });
            }

            playerNew.teamId = team._id;
            await playerNew.save();

            team.players.push(playerNew);
            await team.save();
        }
    }

    // On s'attaque après aux performances

    await disconnectFromDatabase();
}

export default {
    command: 'db:sync',
    describe: 'Sync team/player with master database',
    builder: {
    },
    handler
} as CommandModule;
