import type { Arguments, Argv, CommandModule } from 'yargs'
import { getChannelFromVersion, getInstalledRuntimeVersions, getInstalledSdkVersions, syncRuntimeChannel, syncSdkChannel, type DotnetVersionConfig, syncVersionConfig } from '../util/dotnet'

export type SyncCommandArgs = {
  target?: 'all' | 'sdk' | 'runtime'
  file?: string
}
  & Arguments

export const syncCommand: CommandModule = {
  command: 'sync [target]',
  describe: 'Synchronize .NET software',
  aliases: ['s'],
  builder: (command: Argv<{}>) => command
    .positional('target', {
      type: 'string',
      describe: 'The target to sync.',
      default: 'all',
      choices: [
        'all',
        'sdk',
        'runtime'
      ]
    })
    .option('file', {
      type: 'string',
      describe: 'Specify a JSON configuration file to sync from. Mutually exclusive with all other arguments',
      require: false
    })
    .option('channel', {
      type: 'string',
      describe: 'Channel to sync.'
    }),
  handler: async (argv: SyncCommandArgs) => {
    if (argv.file) {
      const file = Bun.file(argv.file)
      if (!(await file.exists())) {
        throw new Error(`File not found at: ${file}`)
      }

      const config = (await file.json()) as DotnetVersionConfig

      await syncVersionConfig(config)

      return
    }

    // TODO: this is very stupid, but kind of amusing
    const targets = argv.target === 'all'
      ? ['sdk', 'runtime']
      : [argv.target]

    for (const target of targets) {
      if (target === 'sdk') {
        const channels: string[] = argv.channel
          ? Array.isArray(argv.channel) ? argv.channel : [argv.channel]
          : (await getInstalledSdkVersions()).map(version => getChannelFromVersion(version))

        for (const channel of channels) {
          await syncSdkChannel(channel)
        }
      }

      if (target === 'runtime') {
        const channels = argv.channel
          ? Array.isArray(argv.channel) ? argv.channel : [argv.channel]
          : (await getInstalledRuntimeVersions()).map(version => getChannelFromVersion(version))

        for (const channel of channels) {
          await syncRuntimeChannel(channel)
        }
      }
    }
  }
}