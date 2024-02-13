import yargs from 'yargs/yargs'

import { getVersion } from './macros/version.ts' with { type: 'macro' };
import { syncCommand } from './commands/sync.ts';
import { listCommand } from './commands/list.ts';

yargs(process.argv.splice(2))
  .version(getVersion())
  .scriptName('dotnetman')
  .command(syncCommand)
  .command(listCommand)
  .help()
  .argv
