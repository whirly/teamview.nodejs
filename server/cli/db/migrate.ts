import { CommandModule } from 'yargs';
import logger from '../../logger';
import { connectDatabase, disconnectFromDatabase } from '../../mongoose';
import { Migration } from '../../models/migration';
import { Migrations } from '../../migrations';

const command: CommandModule = {
    command: 'db:migrate',
    describe: 'Migrate database schema and datas',
    builder: {
        number: {
            alias: 'n',
            type: 'number',
            desc: 'Number of migrations to do (0 for no limit)',
            default: 0
        }
    },
    handler
};

interface IArgs {
    number: number;
}

async function handler(args: IArgs): Promise<void> {
    let migrationsCount = 0;
    const migrationsLimit = args.number || Infinity;

    await connectDatabase(process.env.MONGO_URL);

    logger.info(`Found ${Migrations.length} migrations, applying ${migrationsLimit} of them maximum.`);

    for (const migration of Migrations) {
        const existingMigration = await Migration.findById(migration.name).exec();
        if (existingMigration) {
            logger.warn(`Migration "${migration.name}" has already been applied, passing.`);
            continue;
        }

        logger.info(`Starting migration "${migration.name}"...`);

        await migration.migrate();

        await Migration.create({ _id: migration.name });

        logger.info(`=> Migration done`);

        if (++migrationsCount >= migrationsLimit) break;
    }

    //=> We're all set
    await disconnectFromDatabase();

    logger.info(`Terminated, ${migrationsCount} migrations have been applied.`);
}

export default command;
