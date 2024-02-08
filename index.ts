import yargs from 'yargs/yargs'
import { installCommand } from './commands/install.ts'

yargs(process.argv.splice(2))
  .scriptName('dotnetman')
  .command(installCommand)
  .help()
  .argv
