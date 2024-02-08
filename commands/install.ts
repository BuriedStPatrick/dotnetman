import yargs, { ArgumentsCamelCase, Argv, CommandBuilder, CommandModule } from 'yargs'
import { getListPreference, outputList } from '../util/lists';
import { fetchInstallScript, getDotnetRootPath, getInstallScriptPath, getInstalledSdks, hasInstallScript } from '../util/dotnet';

const installDotnetCommand: CommandModule = {
  command: 'dotnet',
  describe: 'Install dotnet version',
  aliases: ['d'],
  builder: (command: CommandBuilder) => command
    .example('dotnetman install dotnet'),
  handler: async (argv: Argv) => {
    if (!(await hasInstallScript())) {
      await fetchInstallScript()
    }

    const proc = Bun.spawn(['bash', getInstallScriptPath()], {
      stdout: "inherit",
      stderr: "inherit",
      env: {
        ...process.env,
        DOTNET_ROOT: getDotnetRootPath()
      }
    })

    const exitCode = await proc.exited

    if (exitCode !== 0) {
      throw new Error('Non-zero exit code occurred.')
    }
  }
}

const installPowershellCommand: CommandModule = {
  command: 'pwsh',
  describe: 'Install powershell',
  aliases: ['p', 'powershell'],
  builder: (command: CommandBuilder) => command
    .example('dotnetman install pwsh'),
  handler: async (argv: Argv) => {
    // TODO: Check if `dotnet` is in PATH, error out if not

    const proc = Bun.spawn(['dotnet', 'tool', 'install', '--global', 'powershell'], {
      stdout: "inherit",
      stderr: "inherit",
      env: {
        ...process.env,
        DOTNET_ROOT: getDotnetRootPath()
      }
    })

    const exitCode = await proc.exited

    if (exitCode !== 0) {
      throw new Error('Non-zero exit code occurred.')
    }
  }
}

export const installCommand: CommandModule = {
  command: 'install',
  describe: 'Manage installations',
  aliases: ['i'],
  builder: (command: CommandBuilder) => command
    .command(installDotnetCommand)
    .command(installPowershellCommand)
}

export const sdkCommand: CommandModule = {
  command: 'sdk',
  describe: 'Manage SDKs',
  aliases: ['s'],
  builder: (command: CommandBuilder) => command
    .command(getSdkCommand)
}

export const getSdkCommand: CommandModule = {
  command: 'list',
  describe: 'Get installed SDKs',
  aliases: ['ls', 'get'],
  handler: async (argv: Argv) => {
    const installedSdks = await getInstalledSdks()
    outputList(installedSdks, getListPreference(argv))
  }
}