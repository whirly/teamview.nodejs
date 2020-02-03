import request from 'request-promise';
import { CommandModule } from 'yargs';
import {IPerformance, IPlayer, PlayerPosition} from '../../../shared/models';
import logger from '../../logger';
import * as models from '../../models';
import { connectDatabase, disconnectFromDatabase } from '../../mongoose';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface IArgs {
    force?: boolean;
}

const command: CommandModule = {
    command: 'db:transfermarkt',
    describe: 'Grab basic player information from TransferMarkt',
    builder: {},
    handler
};

export default command;

let totalUnknown = 0;

async function processTeams(url: string): Promise<void> {

    const pathArray = url.split('/');
    const protocol = pathArray[0];
    const site = pathArray[2];
    let response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // On choppe le tableau responsive sur la droite.
    const table = $('div.responsive-table').first();

    // Puis on énumère les TD qui contiennent le lien qui nous intéresse
    let items = table.find('td.zentriert.no-border-rechts').toArray();

    for (let i = 0; i < items.length; i++)
    {
        // On choppe le lien vers la page d'équipe et on le traite.
        logger.info('Traitement ' + items[i].firstChild.attribs['href'] );
        await processTeam( protocol + '//' + site + items[i].firstChild.attribs['href'] );
    }

    logger.info("Impossible de traiter : " + totalUnknown.toString() + ' joueurs');
}

async function processTeam(url: string): Promise<void> {
    // On va aller chercher l'équipe en postfixant l'url
    // L'idée étant d'avoir la vue détaillée qui est plus sympa et moins parasité.

    let response = await axios.get(url+"/plus/1");
    const $ = cheerio.load(response.data);

    let items = $('img.bilderrahmen-fixed').toArray();

    for (let i = 0; i < items.length; i++ ) {
        await processPlayer( items[i].attribs['title'], items[i].attribs['data-src'] )
    }
}

async function processPlayer(name: string, url: string) {
    const blocName = name.split(' ');

    let firstName = blocName[0];
    let lastName: string = blocName[1];

    // On part du principe que le prénom est le premier élément de la chaine
    // Le reste des éléments constitue le nom.
    for (let i=2; i < blocName.length; i++) {
       lastName += ' ' + blocName[i].charAt(0).toUpperCase() + blocName[i].slice(1);
    }

    let blocUrl = url.split('/');
    let filename = blocUrl[blocUrl.length - 1];
    let idTransferMarkt = '';
    let largeUrl: string;

    // Il y a deux notations au niveau des images, on va simplement appliqué le modificateur sur les deux pour obtenir
    // l'url du grand format et en extraire l'id transfermarkt
    if (url.includes('small')) {
        largeUrl = url.replace('small', 'header');
        idTransferMarkt = filename.split('-')[0];
    } else {
        largeUrl = url.replace('mediumfotos', 'spielerfotos');
        idTransferMarkt = filename.split('_')[1];
    }

    let player = await models.Player.findOne( { firstName, lastName });

    // We found the player, let's fill it
    if (player) {
        await updatePlayer( player, largeUrl, url, idTransferMarkt );
    } else {
        // On a pas trouvé le joueur, là il y a plusieurs possibilités que l'on va devoir tester,
        // sachant qu'on est censé avoir tout le monde.

        // Cas n°1 : tout est dans le lastname
        player = await models.Player.findOne( { lastName: name });
        if (player) {
            await updatePlayer( player, largeUrl, url, idTransferMarkt );
        } else {
            // Cas n°1 bis : le prénom du mec est parti aux chiottes
            player = await models.Player.findOne( { lastName });
            if (player) {
                await updatePlayer( player, largeUrl, url, idTransferMarkt );
            } else {
                // Cas n°2, les caractères franzouse, mention spéciale aux Gaëtan
                // Attention le chaining qui va venir sera violent
                firstName = demineString( firstName );

                if (lastName) {
                    lastName = demineString( lastName );
                    player = await models.Player.findOne( { firstName, lastName });
                } else {
                    // Il y a des gens avec des noms chelouds.
                    player = await models.Player.findOne( { lastName: firstName });
                }

                // On a trouvé le mec, on l'update
                if (player) {
                    await updatePlayer( player, largeUrl, url, idTransferMarkt );
                } else {
                    // Cas : le firstname du mec sert à rien, et son lastname doit être nettoyé
                    player = await models.Player.findOne( { lastName: lastName });
                    if (player) {
                        await updatePlayer( player, largeUrl, url, idTransferMarkt );
                    } else {
                        // Cas : le lastname sert à rien
                        player = await models.Player.findOne( { lastName: firstName });
                        if (player) {
                            await updatePlayer( player, largeUrl, url, idTransferMarkt );
                        } else {

                            player = await models.Player.findOne({lastName: name});
                            if (player) {
                                await updatePlayer(player, largeUrl, url, idTransferMarkt);
                            } else {
                                let accentLessName: string = demineString(name);
                                player = await models.Player.findOne({lastName: accentLessName});

                                if (player) {
                                    await updatePlayer(player, largeUrl, url, idTransferMarkt);
                                } else {
                                    // Cas n°3 le mec à double prénom (la règle choupo)
                                    firstName = blocName[0] + ' ' + blocName[1];
                                    lastName = blocName[2];

                                    // On part du principe que le prénom est le premier élément de la chaine
                                    // Le reste des éléments constitue le nom.
                                    for (let i = 3; i < blocName.length; i++) {
                                        lastName += ' ' + blocName[i];
                                    }

                                    player = await models.Player.findOne({firstName, lastName});
                                    if (player) {
                                        await updatePlayer(player, largeUrl, url, idTransferMarkt);
                                    } else {

                                        // Appel au dictionnaire
                                        if( ! await processSpecialPlayer(name, largeUrl, url, idTransferMarkt) )
                                        {
                                            // On a tout essayé !
                                            logger.warn("Impossible de trouver " + name);
                                            totalUnknown++;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

async function processSpecialPlayer( name: string, pictureUrl: string, thumbnailUrl: string, id: string ): Promise<boolean> {
    let player: IPlayer = undefined;

    // Cette méthode c'est un peu capitaine flam, le truc auquel on fait appel quand plus rien ne va.
    // En gros c'est un putain de dictionnaire de correspondance pour gérer les typo et les cas trop zarb
    switch( name ) {
        case 'Abdoulaye Toure':
            player = await models.Player.findOne({ lastName: 'Abdoulaye Touré'});
            break;
        case 'Fodé Ballo-Touré':
            player = await models.Player.findOne({lastName: 'Ballo-Toure' });
            break;
        case 'Zeki Celik':
            player = await models.Player.findOne({lastName: 'Zeki Çelik' });
            break;
        case 'Alexandre Phliponeau':
            player = await models.Player.findOne({idMpg: '471437' });
            break;

        case 'Stanley Nsoki':
            player = await models.Player.findOne({lastName: 'N\'Soki'});
            break;

        case 'Pierre Lees Melou':
            player = await models.Player.findOne({lastName: 'Lees-Melou' });
            break;

        case 'Ui-jo Hwang':
            player = await models.Player.findOne({idMpg: '201440' });
            break;

        case 'Timothée Kolodziejczak':
            player = await models.Player.findOne({lastName: 'Kolo' });
            break;

        case 'Il-lok Yun':
            player = await models.Player.findOne({idMpg: '103777' });
            break;
        case 'Moreto Cassamá':
            player = await models.Player.findOne({idMpg: '176495' });
            break;
        case 'Anthony Gomez Mancini':
            player = await models.Player.findOne({idMpg: '465299' });
            break;

        case 'Ulrick Eneme Ella':
            player = await models.Player.findOne({idMpg: '442307' });
            break;
        case 'Lucas Dias':
            player = await models.Player.findOne({idMpg: '244136' });
            break;
        case 'Thody Élie Youan':
            player = await models.Player.findOne({idMpg: '469192' });
            break;
    }

    if (player) {
        await updatePlayer(player, pictureUrl, thumbnailUrl, id );
    }

    return player != undefined;
}

function demineString( stringToProcess: string ): string {
    return stringToProcess.replace(/[éèê]/g, 'e')
        .replace(/[äâàá]/g, 'a')
        .replace( /[îï]/g, 'i')
        .replace( /[ùûúü]/g, 'u')
        .replace(/[ôòó]/g, 'o')
        .replace('-', ' ')
}

async function updatePlayer( player: IPlayer, pictureUrl: string, thumbnailUrl: string, id: string ) {
    player.pictureUrl = pictureUrl;
    player.thumbnailUrl = thumbnailUrl;
    player.idTransferMarkt = id;
    await player.save();

//    logger.info( 'Saved ' + player.lastName + ' ' + player.firstName + ' MPG=' + player.idMpg + ' TM=' + player.idTransferMarkt + ' URL:' + player.pictureUrl)
}

async function handler(args: IArgs): Promise<void> {

    const baseUrl: string = process.env.TRANSFERMARKT_CHAMPIONSHIP_URL;
    await connectDatabase(process.env.MONGO_URL);

    // On va récupérer la page d'équipes, et à partir de là traiter chaque équipe
    logger.info('Traitement des équipes sur TransferMartk...');
    await processTeams(baseUrl);

    await disconnectFromDatabase();
}
