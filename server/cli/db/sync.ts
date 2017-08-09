import { CommandModule } from 'yargs';
import logger from '../../logger';
import { connectDatabase, disconnectFromDatabase } from '../../mongoose';
import * as models from '../../models';
import {IFixturePlayer} from "../../../shared/models/fixture";
import {IPlayerSpecificPerformance} from "../../../shared/models/player";

let request = require('request-promise');

interface IArgs {
    force?: boolean;
}

async function processPlayer( baseUrl: string )
{
    const response = await request( baseUrl + "quotation/1");
    let players = JSON.parse( response );
    let numberOfPlayers:number = 0;

    // On commence par s'occuper des joueurs
    for ( let player of players ) {

        // On retire le player_ devant l'id. On se demande pourquoi il est là.
        player.id = player.id.slice(7);

        let existingPlayer = await models.Player.findOne( { idMpg: player.id } );

        if( existingPlayer ) {
            let team = await models.Team.findOne({idMpg: player.teamid});

            // On vérifie si le gus a pas changé d'équipe en fait.
            if( player.teamid != existingPlayer.teamId )
            {
                // Il a changé d'équipe, on va le virer de son ancienne équipe
                let teamPrevious = await models.Team.findOne( { idMpg: existingPlayer.teamId });

                // Si cette équipe existe encore.
                if( teamPrevious )
                {
                    teamPrevious.players.splice( teamPrevious.players.findIndex( item => item.equals( existingPlayer._id )), 1 );

                    // On sauvegarde l'équipe modifié
                    await teamPrevious.save();
                }
            }

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

            // On nettoie les performances vu qu'elle vont être reconstruite
            existingPlayer.performances = new Array<IPlayerSpecificPerformance>();

            await existingPlayer.save();
            numberOfPlayers++;

        } else {
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

            numberOfPlayers++;
        }
    }

    logger.info( numberOfPlayers + " joueurs traités.");
}

function findTactic( matchSide: any ): string
{
    return matchSide.players[ Object.keys( matchSide.players )[ 0 ]].info.formation_used;
}

async function processPlayers( day: number, data: any ): Promise<IFixturePlayer[]>
{
    let fixturePlayers = [];

    for( let playerID in data.players ) {

        let player = data.players[ playerID ];
        let playerDb = await models.Player.findOne({idMpg: playerID});

        let playerPerformance = await models.PlayerPerformance.create({
            player: playerID,
            team: data.id,
            day: day,
            position: player.info.position,
            place: player.info.formation_place,
            rate: player.info.note_final_2015,
            goalFor: player.info.goals,
            goalAgainst: player.info.own_goals,
            cardYellow: player.info.yellow_card > 0,
            cardRed: player.info.red_card > 0,
            sub: player.info.sub == 1
        });

        fixturePlayers.push({
            player: playerDb,
            playerPerformance: playerPerformance._id
        });

        playerDb.performances.push({
            idTeam: data.id,
            day: day,
            performance: playerPerformance._id,
            value: -1
        });

        await playerDb.save();
    }

    console.log( fixturePlayers );
    return fixturePlayers;
}

async function processMatches( baseUrl: string )
{
    for( let i = 1; i < 39; i++ )
    {
        const queryDay = await request( baseUrl + "championship/1/calendar/" + i.toString());
        let day = JSON.parse( queryDay );

        logger.info("Traitement jour " + i );

        for( let match of day.matches ) {

            // Si le champ score est vide, c'est que le match n'a pas encore été joué, on ne le traite donc pas
            // ... pour l'instant du moins, ça serait intéressant de voir ce qu'on pourrait faire avec les cotes
            if ( match.home.score != "" ) {

                // Process each match
                const matchInfos = await request(baseUrl + "championship/match/" + match.id);
                let matchDetailed = JSON.parse(matchInfos);

                // Là sur le coup, je n'ai pas compris pourquoi les ids sont préfixés de "match_" ... bon ben on le vire.
                matchDetailed.id = matchDetailed.id.slice(5);


                // find teams
                let teamAway = await models.Team.findOne({idMpg: matchDetailed.Away.id}).populate("players fixtures").exec();
                let teamHome = await models.Team.findOne({idMpg: matchDetailed.Home.id}).populate("players fixtures").exec();

                // find fixtures
                let fixture = await models.Fixture.findOne({idMpg: matchDetailed.id});

                // Fixture does not exists yet
                if (!fixture) {
                    fixture = await models.Fixture.create({
                        day: i,
                        idMpg: match.toString(),
                        home: {
                            team: teamHome._id,
                            formation: findTactic(matchDetailed.Home)
                        },
                        away: {
                            team: teamAway._id,
                            formation: findTactic(matchDetailed.Away)
                        }
                    });
                }
                else {
                    // This fixture could exists before the match was played
                    // So in every case we update the tactic and players
                    fixture.home.formation = findTactic(matchDetailed.Home);
                    fixture.away.formation = findTactic(matchDetailed.Away);
                }

                // Populate players and their performance
                fixture.home.players = await processPlayers(i, matchDetailed.Home);
                fixture.away.players = await processPlayers(i, matchDetailed.Away);

                await fixture.save();
            }
        }
    }

    // Basically we are done.
}

async function handler(args: IArgs): Promise<void> {

    let baseUrl: string = 'http://api.monpetitgazon.com/';
    await connectDatabase(process.env.MONGO_URL);

    // On s'occupe d'abord des joueurs

    logger.info('Traitement des joueurs...');
    await processPlayer( baseUrl );

    // On s'attaque après aux performances
    // 38 journées, on s'en occupe.

    logger.info('Traitement des matchs...');
    await processMatches( baseUrl );

    await disconnectFromDatabase();
}

export default {
    command: 'db:sync',
    describe: 'Sync team/player with master database',
    builder: {
    },
    handler
} as CommandModule;
