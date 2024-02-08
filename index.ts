import yargs from 'yargs/yargs'
import { installCommand, sdkCommand, updateCommand } from './commands/install.ts'

yargs(process.argv.splice(2))
  .scriptName('dotnetman')
  .command(installCommand)
  .command(updateCommand)
  .command(sdkCommand)
  .help()
  .argv
