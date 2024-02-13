import yargs, { ArgumentsCamelCase, Argv, CommandBuilder, CommandModule } from 'yargs'
import { getChannelFromVersion, getInstalledRuntimeVersions, getInstalledSdkVersions, syncRuntimeChannel, syncSdkChannel } from '../util/dotnet'

export const syncCommand: CommandModule = {
  command: 'sync [target]',
  describe: 'Synchronize .NET software',
  aliases: ['s'],
  builder: (command: CommandBuilder) => command
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
    .option('channel', {
      type: 'string',
      describe: 'Channel to sync.'
    }),
  handler: async (argv: Argv) => {
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