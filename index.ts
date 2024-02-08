import yargs from 'yargs/yargs'
import { installCommand, sdkCommand } from './commands/install.ts'
import { updateCommand } from './commands/update.ts'

yargs(process.argv.splice(2))
  .scriptName('dotnetman')
  .command(installCommand)
  .command(updateCommand)
  .command(sdkCommand)
  .help()
  .argv
