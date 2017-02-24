import * as yargs from 'yargs';
import dbCommands from './db';

import '../bootstrap';

yargs.usage('Usage: $0 <command> [arguments]');

([] as yargs.CommandModule[])
    .concat(dbCommands /*, otherCommands, etc*/)
    .forEach(command => yargs.command(command));

yargs.help().argv;
