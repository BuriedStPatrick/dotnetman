import yargs, { ArgumentsCamelCase, Argv, CommandBuilder, CommandModule } from 'yargs'
import { getInstalledRuntimeVersions, getInstalledSdkVersions } from '../util/dotnet'
import { getListPreference, outputList } from '../util/lists'
import chalk from 'chalk'

export const listCommand: CommandModule = {
  command: 'list',
  describe: 'List .NET software',
  aliases: ['ls', 'get'],
  builder: (command: CommandBuilder) => command
    .command(getSdkCommand)
    .command(getRuntimeCommand),
  handler: async (argv: Argv) => {
    console.log(`${chalk.bold.bgBlue.white('Installed sdks')}`)
    const installedSdks = await getInstalledSdkVersions()
    outputList(installedSdks, getListPreference(argv))

    console.log(`${chalk.bold.bgBlue.white('Installed runtimes')}`)
    const installedRuntimes = await getInstalledRuntimeVersions()
    outputList(installedRuntimes, getListPreference(argv))
  }
}

const getSdkCommand: CommandModule = {
  command: 'sdk',
  describe: 'Get installed SDKs',
  handler: async (argv: Argv) => {
    const installedSdks = await getInstalledSdkVersions()

    outputList(installedSdks, getListPreference(argv))
  }
}

const getRuntimeCommand: CommandModule = {
  command: 'runtime',
  describe: 'Get installed runtimes',
  handler: async (argv: Argv) => {
    const installedRuntimes = await getInstalledRuntimeVersions()

    outputList(installedRuntimes, getListPreference(argv))
  }
}