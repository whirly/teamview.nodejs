import { CommandModule } from 'yargs';
import logger from '../../logger';
import { connectDatabase, disconnectFromDatabase } from '../../mongoose';
import { Migration } from '../../models/migration';
import { Migrations } from '../../migrations';

const command: CommandModule = {
    command: 'db:rollback',
    describe: 'Rollback migrations on database schema and datas',
    builder: {
        number: {
            alias: 'n',
            type: 'number',
            desc: 'Number of migrations to rollback (0 for no limit)',
            default: 1
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

    const appliedMigrations = await Migration.find({}).exec();

    logger.info(`Found ${appliedMigrations.length} applied migrations, rollback ${migrationsLimit} of them maximum.`);

    for (const migrationMark of appliedMigrations) {
        const migration = Migrations.find(mig => mig.name == migrationMark._id);
        if (!migration) {
            throw new Error(`Could not find a migration named ${migration.name}!`);
        }

        logger.info(`Starting rollback "${migration.name}"...`);

        await migration.rollback();

        await Migration.remove({ _id: migration.name }).exec();

        logger.info(`=> Rollback done`);

        if (++migrationsCount >= migrationsLimit) break;
    }

    //=> We're all set
    await disconnectFromDatabase();

    logger.info(`Terminated, ${migrationsCount} migrations have been reverted.`);
}

export default command;
