import yargs, { ArgumentsCamelCase, Argv, CommandBuilder, CommandModule } from 'yargs'
import { fetchInstallScript, getDotnetRootPath, getInstalledSdks, hasInstallScript, syncSdk, updateSdk } from '../util/dotnet'

export const syncCommand: CommandModule = {
  command: 'sync',
  describe: 'Synchronize .NET software',
  aliases: ['s'],
  builder: (command: CommandBuilder) => command
    .command(syncSdkCommand)
}

const syncSdkCommand: CommandModule = {
  command: 'sdk',
  describe: 'Synchronize .NET SDKs',
  builder: (command: CommandBuilder) => command
    .option('channel', {
      type: 'string',
      default: 'LTS',
      describe: 'Channel to sync'
    }),
  handler: async (argv: Argv) => {
    if (!(await hasInstallScript())) {
      await fetchInstallScript()
    }

    const sdkMajorVersions = (await getInstalledSdks())
      // distinct by major version
      .filter((value, index, self) =>
        index === self.findIndex(x => x.major === value.major))

    for (const sdk of sdkMajorVersions) {
      await syncSdk(sdk)
    }
  }
}