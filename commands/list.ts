import yargs, { ArgumentsCamelCase, Argv, CommandBuilder, CommandModule } from 'yargs'
import { getInstalledSdks } from '../util/dotnet'
import { getListPreference, outputList } from '../util/lists'

export const listCommand: CommandModule = {
  command: 'list',
  describe: 'List .NET software',
  aliases: ['ls', 'get'],
  builder: (command: CommandBuilder) => command
    .command(getSdkCommand)
}

const getSdkCommand: CommandModule = {
  command: 'sdk',
  describe: 'Get installed SDKs',
  handler: async (argv: Argv) => {
    const installedSdks = await getInstalledSdks()

    outputList(installedSdks, getListPreference(argv))
  }
}