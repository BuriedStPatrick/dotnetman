import yargs from 'yargs/yargs'
import { installCommand, sdkCommand } from './commands/install.ts'

yargs(process.argv.splice(2))
  .scriptName('dotnetman')
  .command(installCommand)
  .command(sdkCommand)
  .help()
  .argv
