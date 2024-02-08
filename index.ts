import yargs from 'yargs/yargs'
import { installCommand, sdkCommand } from './commands/install.ts'
import { updateCommand } from './commands/update.ts'

import { getVersion } from './macros/version.ts' with { type: 'macro' };

yargs(process.argv.splice(2))
  .version(getVersion())
  .scriptName('dotnetman')
  .command(installCommand)
  .command(updateCommand)
  .command(sdkCommand)
  .help()
  .argv
