import { CommandModule } from 'yargs';
import logger from '../../logger';
import { connectDatabase, disconnectFromDatabase } from '../../mongoose';
import * as models from '../../models';
import { MIGRATIONS } from '../../migrations';
import { COLLECTIONS_TO_EMPTY, createData } from '../../migrations/seeding';

interface IArgs {
    force?: boolean;
}

async function handler(args: IArgs): Promise<void> {
    if (!args.force && process.env.WEBPACK_ENV != 'development') {
        logger.error('You should not use db:seed on non-development environment. Use --force to bypass restriction.');
        process.exit(1);
    }

    await connectDatabase(process.env.MONGO_URL);

    //=> Empty collections
    logger.info('Emptying collections...');

    const deleteOps = COLLECTIONS_TO_EMPTY
        .concat([models.Migration])
        .map(model => model.find({}).remove().exec());

    await Promise.all(deleteOps);

    //=> Fill the database
    logger.info('Importing data...');

    await createData();

    //=> Mark all migrations as done
    logger.info('Marking migrations as done...');

    const migrations = MIGRATIONS.map(migration => ({ name: migration.name }));

    await models.Migration.create(migrations);

    //=> We're all set
    await disconnectFromDatabase();

    logger.info('Terminated seeding the database!');
}

export default {
    command: 'db:seed',
    describe: 'Seed database to get started',
    builder: {
        force: {
            type: 'boolean',
            desc: 'Force seed on non-development environments'
        }
    },
    handler
} as CommandModule;
