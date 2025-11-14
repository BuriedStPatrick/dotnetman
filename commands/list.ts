import type { Arguments, Argv, CommandModule } from 'yargs'
import { getInstalledRuntimeVersions, getInstalledSdkVersions } from '../util/dotnet'
import { output, toPropertyOptions, type OutputArgs } from '../util/output'

export type ListCommandArgs = {
}
  & OutputArgs
  & Arguments

export const listCommand: CommandModule = {
  command: 'list',
  describe: 'List .NET software',
  aliases: ['ls', 'get'],
  builder: (args: Argv<{}>) => args
    .option('output', {
      alias: 'o',
      type: 'string',
      describe: 'Output format.'
    })
    .option('property', {
      alias: 'p',
      type: 'array',
      describe: 'Filter properties using JSON path.'
    })
    .option('exclude-empty', {
      type: 'boolean',
      describe: 'Exclude empty values from result.'
    })
    .command(getSdkCommand)
    .command(getRuntimeCommand),
  handler: async (args: ListCommandArgs) => {
    const installedSdks = await getInstalledSdkVersions()

    const installedRuntimes = await getInstalledRuntimeVersions()

    output(
      {
        'sdks': installedSdks,
        'runtimes': installedRuntimes
      },
      args.output,
      toPropertyOptions(args))
  }
}

export type GetSdkCommandArgs = {
}
  & ListCommandArgs
  & Arguments

const getSdkCommand: CommandModule = {
  command: 'sdk',
  describe: 'Get installed SDKs',
  handler: async (args: GetSdkCommandArgs) => {
    const installedSdks = await getInstalledSdkVersions()

    output(
      installedSdks,
      args.output,
      toPropertyOptions(args))
  }
}

export type GetRuntimeCommandArgs = {
}
  & ListCommandArgs
  & Arguments

const getRuntimeCommand: CommandModule = {
  command: 'runtime',
  describe: 'Get installed runtimes',
  handler: async (args: GetRuntimeCommandArgs) => {
    const installedRuntimes = await getInstalledRuntimeVersions()

    output(
      installedRuntimes,
      args.output,
      toPropertyOptions(args))
  }
}