import path from 'path'
import { readdir } from 'node:fs/promises';
import { getDotnetLifeCycles, type DotnetLifeCycle } from './endoflife';

export const getDownloadDirectory = (): string => {
  if (!Bun.env.HOME) {
    throw new Error(`ENV var 'HOME' not defined`)
  }
  
  return path.join(Bun.env.HOME, 'Downloads')
}

export const hasInstallScript = async (): Promise<boolean> => {
  return await Bun.file(getInstallScriptPath()).exists()
}

export const fetchInstallScript = async (): Promise<any> => {
  const result = await fetch('https://dot.net/v1/dotnet-install.sh')
  await Bun.write(getInstallScriptPath(), result)
}

export const getInstallScriptPath = () => {
  return path.join(getDownloadDirectory(), 'dotnet-install.sh')
}

export const getDotnetRootPath = () => {
  if (!Bun.env.HOME) {
    throw new Error(`ENV var 'HOME' not defined`)
  }

  return path.join(Bun.env.HOME, '.dotnet')
}

export type DotnetVersion = {
  major: number
  minor: number
  patch: number,
  lifeCycle?: DotnetLifeCycle
}

export type DotnetSdkVersion = {
  path: string
} & DotnetVersion

export type DotnetRuntimeVersion = {
  type: 'net' | 'aspnetcore' | 'netcoreapp'
} & DotnetVersion

export const getInstalledSdkVersions = async (withLifeCycle: boolean = true): Promise<DotnetSdkVersion[]> => {
  const sdkPath = path.join(getDotnetRootPath(), 'sdk')

  const dirs = await getDirectories(sdkPath)

  const lifeCycles = withLifeCycle
    ? (await getDotnetLifeCycles())
    : null

  return await Promise.all(dirs.map(async dir => {
    const split = dir.name
      .split('.')

    return {
      major: parseInt(split[0]),
      minor: parseInt(split[1]),
      patch: parseInt(split[2]),
      path: dir.path,
      lifeCycle: lifeCycles?.find(lc => lc.cycle.split('.')[0] === split[0])
    } as DotnetSdkVersion
  }))
}

export const getInstalledRuntimeVersions = async (withLifeCycle: boolean = true): Promise<DotnetRuntimeVersion[]> => {
  const netcoreRuntimePath = path.join(getDotnetRootPath(), 'shared', 'Microsoft.NETCore.App')
  const aspnetCoreAllPath = path.join(getDotnetRootPath(), 'shared', 'Microsoft.AspNetCore.All') // old ASPNET Core 2.1 stuff
  const aspnetCoreAppPath = path.join(getDotnetRootPath(), 'shared', 'Microsoft.AspNetCore.App')

  const dirs = (await getDirectories(netcoreRuntimePath))
    .concat((await getDirectories(aspnetCoreAllPath)))
    .concat((await getDirectories(aspnetCoreAppPath)))

  const lifeCycles = withLifeCycle
    ? (await getDotnetLifeCycles())
    : null

  return await Promise.all(dirs.map(async dir => {
    const versionSplit = dir.name
      .split('.')

    return {
      major: parseInt(versionSplit[0]),
      minor: parseInt(versionSplit[1]),
      patch: parseInt(versionSplit[2]),
      type: dir.path.startsWith(netcoreRuntimePath) ? 'net'
        : dir.path.startsWith(aspnetCoreAppPath) ? 'aspnetcore'
        : dir.path.startsWith(aspnetCoreAllPath) ? 'netcoreapp' : null,
      path: dir.path,
      lifeCycle: lifeCycles?.find(lc => lc.cycle.split('.')[0] === versionSplit[0])
    } as DotnetRuntimeVersion
  }))
}

const getDirectories = async (source: string): Promise<Directory[]> =>
  (await readdir(source, { withFileTypes: true }))
    .filter(dirent => dirent.isDirectory())
    .map(dirent => ({
      name: dirent.name,
      path: path.resolve(source, dirent.name)
    }) as Directory)

type Directory = {
  name: string
  path: string
}

export const syncSdkVersion = async (sdk: DotnetSdkVersion) => {
  await syncSdkChannel(`${sdk.major}.${sdk.minor}`)
}

export const getChannelFromVersion = (version: DotnetSdkVersion | DotnetRuntimeVersion) =>
  `${version.major}.${version.minor}`

export const syncSdkChannel = async (channel: string) => {
  if (!(await hasInstallScript())) {
    await fetchInstallScript()
  }

  const proc = Bun.spawn([
    'bash',
    getInstallScriptPath(),
    '--channel',
    channel
  ], {
    stdout: 'inherit',
    stderr: 'inherit',
    env: {
      ...Bun.env,
      DOTNET_ROOT: getDotnetRootPath()
    }
  })

  const exitCode = await proc.exited

  if (exitCode !== 0) {
    throw new Error('Non-zero exit code occurred.')
  }
}

export const syncRuntime = async (runtime: DotnetRuntimeVersion) =>
  await syncRuntimeChannel(`${runtime.major}/${runtime.minor}`)

export const syncRuntimeChannel = async (channel: string) => {
  if (!(await hasInstallScript())) {
    await fetchInstallScript()
  }

  const proc = Bun.spawn([
    'bash',
    getInstallScriptPath(),
    '--channel',
    channel,
    '--runtime'
  ], {
    stdout: 'inherit',
    stderr: 'inherit',
    env: {
      ...Bun.env,
      DOTNET_ROOT: getDotnetRootPath()
    }
  })

  const exitCode = await proc.exited

  if (exitCode !== 0) {
    throw new Error('Non-zero exit code occurred.')
  }
}