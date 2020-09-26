import request from 'request-promise';
import { CommandModule } from 'yargs';
import {IFixtureSide, IPerformance, PlayerPosition} from '../../../shared/models';
import logger from '../../logger';
import * as models from '../../models';
import { connectDatabase, disconnectFromDatabase } from '../../mongoose';
import axios from 'axios';
import {crunchPlayersData} from "./optimize";

interface IArgs {
    force?: boolean;
    login?: string;
    password?: string;
}

const command: CommandModule = {
    command: 'db:sync',
    describe: 'Sync team/player with master database',
    builder: {},
    handler
};

export default command;

async function processPlayer(baseUrl: string, token: string) {
    const options: any = {
        uri: baseUrl + 'mercato/1',
        headers: {
            'Authorization': token
        }
    };

    const response = await request(options);
    const players = JSON.parse(response).players;
    let numberOfPlayers: number = 0;

    // On commence par s'occuper des joueurs
    for (const player of players) {

        // On retire le player_ devant l'id. On se demande pourquoi il est là.
        player.id = player.id.slice(7);

        const existingPlayer = await models.Player.findOne({ idMpg: player.id });

        if (existingPlayer) {
            let team = await models.Team.findOne({ idMpg: player.teamid });

            // On a trouvé la team en question, on va donc rajouter notre joueur
            if (team) {
                // Est ce que notre joueur n'est pas déjà dans cette équipe ?
                if (team.players.findIndex(item => item.equals(player.teamid)) == -1) {
                    // On l'ajoute
                    team.players.push(existingPlayer);
                    await team.save();
                }
            } else {
                // La team n'existe pas encore, on la créé
                team = await models.Team.create({
                    idMpg: player.teamid,
                    name: player.club
                });

                // On ajoute notre joueur
                team.players.push(existingPlayer);
                await team.save();
            }

            // On vérifie si le gus a pas changé d'équipe en fait.
            if (team._id != existingPlayer.team) {
                // Il a changé d'équipe, on va le virer de son ancienne équipe
                const teamPrevious = await models.Team.findById(existingPlayer.team);

                // Si cette équipe existe encore.
                if (teamPrevious) {
                    teamPrevious.players.splice(
                        teamPrevious.players.findIndex(item => item.equals(existingPlayer._id)), 1);

                    // On sauvegarde l'équipe modifié
                    await teamPrevious.save();
                }
            }

            // On met à jour le joueur avec les infos qui sont susceptibles d'avoir changé (valeur, role, équipe)
            // Et on sauvegarde le tout.
            existingPlayer.value = player.quotation;
            existingPlayer.role = player.position;
            existingPlayer.team = team._id;

            await existingPlayer.save();
            numberOfPlayers++;

        } else {
            const playerNew = await models.Player.create({
                firstName: player.firstname,
                lastName: player.lastname,
                idMpg: player.id,
                role: player.position,
                value: player.quotation
            });

            let team = await models.Team.findOne({ idMpg: player.teamid });

            if (!team) {
                team = await models.Team.create({
                    idMpg: player.teamid,
                    name: player.club
                });
            }

            playerNew.team = team._id;
            await playerNew.save();

            team.players.push(playerNew);
            await team.save();

            numberOfPlayers++;
        }
    }

    logger.info(numberOfPlayers + ' joueurs traités.');
}

function findTactic(matchSide: any): string {
    return matchSide.players[Object.keys(matchSide.players)[0]].info.formation_used;
}

function getRoleForPosition(position: string): PlayerPosition {
    if (position == 'Goalkeeper') return PlayerPosition.Goal;
    if (position == 'Defender') return PlayerPosition.Defender;
    if (position == 'Midfielder') return PlayerPosition.Midfield;
    if (position == 'Striker') return PlayerPosition.Striker;

    // Si je n'ai pas réussi à lire la position du mec, on va dire qu'il est goal.
    return PlayerPosition.Goal;
}

// Dans le cas où la perf existe déjà on s'arrange quand même pour la mettre à jour
async function updatePerformances(year: number, day: number, data: any) {
    // tslint:disable-next-line:forin
    for (const playerID in data.players) {
        const playerInfos = data.players[playerID];
        const player = await models.Player.findOne({ idMpg: playerID });

        const performancePrevious = await models.Performance.findOne({ player, day, year });

        // On va la mettre à jour, parce que bon il y aura toujours ces histoires de mecs
        // qui ont finalement hérité d'un but quelques jours plus tard
        performancePrevious.position = playerInfos.info.position;
        performancePrevious.place = playerInfos.info.formation_place;
        performancePrevious.rate = playerInfos.info.note_final_2015;
        performancePrevious.goalFor = playerInfos.info.goals;
        performancePrevious.goalAgainst = playerInfos.info.own_goals;
        performancePrevious.cardRed = playerInfos.info.red_card > 0;
        performancePrevious.cardYellow = playerInfos.info.yellow_card > 0;
        performancePrevious.sub = playerInfos.info.sub == 1;
        performancePrevious.minutes = playerInfos.info.mins_played;

        performancePrevious.penaltyFor = playerInfos.stat.att_pen_goal
            ? playerInfos.stat.att_pen_goal
            : 0;

        // On sauvegarde le bordel.
        delete performancePrevious._id;
        await models.Performance.findOneAndUpdate({ player, day, year }, performancePrevious);
    }
}

async function processPlayers(year: number, day: number, data: any): Promise<IPerformance[]> {
    const performances = [];

    // tslint:disable-next-line:forin
    for (const playerID in data.players) {
        const playerInfos = data.players[playerID];
        let player = await models.Player.findOne({ idMpg: playerID });

        // Le joueur peut ne pas exister, parce que ce monsieur a quitté le championnat.
        // Merci à Valentin Eysseric d'avoir été le premier :)
        if (!player) {
            // On créer une enveloppe player
            player = await models.Player.create({
                idMpg: playerID,
                firstName: '', // le paquet d'infos ne comporte que le nom de famille pour l'affichage tactique
                lastName: playerInfos.info.lastname,
                role: getRoleForPosition(playerInfos.info.position),
                value: 0,
                team: null
            });
        }
        // Est ce qu'on a déjà cette perf ?
        const performancePrevious = await models.Performance.findOne({ player, day, year });

        // Non on va la créer
        if (!performancePrevious) {
            const team = await models.Team.findOne({ idMpg: data.id });

            // Pour l'instant on stocke juste les perfs
            // Mais on pourrait réfléchir à récupérer les stats pour voir ce qu'on pourrait faire.
            const playerPerformance = await models.Performance.create({
                player,
                team,
                year,
                day,
                position: playerInfos.info.position,
                place: playerInfos.info.formation_place,
                rate: playerInfos.info.note_final_2015,
                goalFor: playerInfos.info.goals,
                goalAgainst: playerInfos.info.own_goals,
                cardYellow: playerInfos.info.yellow_card > 0,
                cardRed: playerInfos.info.red_card > 0,
                sub: playerInfos.info.sub == 1,
                minutes: playerInfos.info.mins_played,
                penaltyFor: playerInfos.stat.att_pen_goal
            });

            performances.push(playerPerformance);

            // On stocke aussi la performance dans les infos du joueurs.
            player.performances.push(playerPerformance);
            await player.save();
        }
    }

    return performances;
}

async function processMatches(baseUrl: string, token: string) {
    for (let i = 1; i < 39; i++) {
        const queryDay = await request(baseUrl + 'championship/1/calendar/' + i.toString() );
        const day = JSON.parse(queryDay);
        const year = 2020;

        logger.info('Traitement jour ' + i);

        for (const match of day.matches) {

            // Si le champ score est vide, c'est que le match n'a pas encore été joué, on ne le traite donc pas
            // ... pour l'instant du moins, ça serait intéressant de voir ce qu'on pourrait faire avec les cotes
            if (match.home.score != '' && match.home.score != undefined && match.home.scoretmp == undefined) {
                const score = `${match.home.score.toString()}:${match.away.score.toString()}`;
                const line = `${match.home.club}-${match.away.club} ${score}`;

                logger.info(line);

                // Process each match
                const matchInfos = await request(baseUrl + 'championship/match/' + match.id);
                const matchDetailed = JSON.parse(matchInfos);

                // Là sur le coup, je n'ai pas compris pourquoi les ids sont préfixés de "match_" ... bon ben on le vire
                matchDetailed.id = matchDetailed.id.slice(6);

                // find teams
                const teamAway = await models.Team
                    .findOne({ idMpg: matchDetailed.Away.id })
                    .populate('players fixtures').exec();

                const teamHome = await models.Team
                    .findOne({ idMpg: matchDetailed.Home.id })
                    .populate('players fixtures').exec();

                // find fixtures
                let fixture = await models.Fixture.findOne({ idMpg: matchDetailed.id })
                    .populate('home.performances').populate('away.performances').exec();

                // Fixture does not exists yet
                if (!fixture) {
                    fixture = await models.Fixture.create({
                        year,
                        day: i,
                        idMpg: matchDetailed.id.toString(),
                        home: {
                            team: teamHome,
                            formation: findTactic(matchDetailed.Home)
                        },
                        away: {
                            team: teamAway,
                            formation: findTactic(matchDetailed.Away)
                        }
                    });

                    // Populate players and their performance
                    fixture.home.performances = await processPlayers(year, i, matchDetailed.Home);
                    fixture.away.performances = await processPlayers(year, i, matchDetailed.Away);

                    // On calcule le median, la moyenne, la variance
                    await addVariance(fixture.home);
                    await addVariance(fixture.away);

                    await fixture.save();

                    teamAway.fixtures.push(fixture);
                    teamHome.fixtures.push(fixture);

                    await teamAway.save();
                    await teamHome.save();
                } else {

                    await updatePerformances(year, i, matchDetailed.Home);
                    await updatePerformances(year, i, matchDetailed.Away);

                    // On rajoute les variances, median, etc...
                    // Vu que ça peut évoluer en fonction de la réattribution des buts
                    await addVariance(fixture.home);
                    await addVariance(fixture.away);

                    fixture.depopulate('performances');
                    await fixture.save();
                }
            }
        }
    }

    // Basically we are done.
}

/*
    Basiquement, on va précalculer les performances globales d'une équipe sur un match.
    Parce qu'on est un peu au bon endroit pour faire ça. Globalement on veut la moyenne des joueurs sur ce
    match, le median de note, et la variance de la performance. Derrière du coup on pourra faire de jolies graphes
    et surtout voir si un mec surperforme par rapport à son équipe.

    La grande interrogation reste quand même de savoir si on ne calcule qu'avec les titulaires ou pas. Parce que
    le pauvre gars que tu fais toujours rentrer à la 89mn il risque d'avoir toujours son 5 syndical. En même temps
    c'est bien ça qu'on veut.
 */
async function addVariance(fixtureSide: IFixtureSide) {
    const ratings = Array<number>();
    let sum = 0;

    // On récupère les notes pour les gens où ça existe. On inclus tous ceux qui ont joué
    for (const performance of fixtureSide.performances) {
        if (performance.rate > 0) {
            ratings.push(performance.rate);
            sum += performance.rate;
        }
    }

    // On trie par ordre croissant de note
    ratings.sort((a,b) => a - b);
    const amount = ratings.length;

    fixtureSide.average = sum / amount;
    fixtureSide.median = ratings[ Math.floor( amount / 2 )];
    fixtureSide.variance = ratings.reduce((accumulator, value) =>
        Math.pow(value - fixtureSide.average, 2), 0) / amount;
}

async function handler(args: IArgs): Promise<void> {

    const baseUrl: string = 'https://api.monpetitgazon.com/';
    await connectDatabase(process.env.MONGO_URL);

    let response = await axios.post(baseUrl+"user/signIn", {
        email: args.login,
        password: args.password,
        language: 'fr-FR'
    });

    if (response.status == 200 && response.data.token) {
        // Grab da token
        let token = response.data.token;

        // On s'occupe d'abord des joueurs
        logger.info('Traitement des joueurs...');
        await processPlayer(baseUrl, token);

        // On s'attaque après aux performances
        // 38 journées, on s'en occupe.

        logger.info('Traitement des matchs...');
        await processMatches(baseUrl, token);

        // On précalcule les statistiques des joueurs
        // Cela va permettre de fortement descendre la charge du client
        // avec moins de flexibilité, que l'on utilise pas
        await crunchPlayersData();
    }

    await disconnectFromDatabase();
}
