import yargs, { ArgumentsCamelCase, Argv, CommandBuilder, CommandModule } from 'yargs'
import path from 'path'
import { readdir } from 'node:fs/promises';
import { getListPreference, outputList } from '../util/lists';

const getDownloadDirectory = (): string => {
  if (!process.env['HOME']) {
    throw new Error(`ENV var 'HOME' not defined`)
  }

  return path.join(process.env['HOME'], 'Downloads')
}

const hasInstallScript = async (): Promise<boolean> => {
  return await Bun.file(getInstallScriptPath()).exists()
}

const fetchInstallScript = async (): Promise<any> => {
  const result = await fetch('https://dot.net/v1/dotnet-install.sh')
  await Bun.write(getInstallScriptPath(), result)
}

const getInstallScriptPath = () => {
  return path.join(getDownloadDirectory(), 'dotnet-install.sh')
}

const getDotnetRootPath = () => {
  if (!process.env['HOME']) {
    throw new Error(`ENV var 'HOME' not defined`)
  }

  return path.join(process.env['HOME'], '.dotnet')
}

const getInstalledSdks = async (): Promise<string[]> => {
  const sdkPath = path.join(getDotnetRootPath(), 'sdk')

  return await getDirectories(sdkPath)
}

const getDirectories = async (source: string) =>
  (await readdir(source, { withFileTypes: true }))
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

export const installCommand: CommandModule = {
  command: 'install',
  describe: 'Install dotnet version',
  aliases: ['i'],
  builder: (command: CommandBuilder) => command
    .example('dotnetman install'),
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