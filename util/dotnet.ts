import path from 'path'
import { readdir } from 'node:fs/promises';

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

export type DotnetSdkVersion = {
  major: number
  minor: number
  patch: number
}

export type DotnetRuntimeVersion = {
  major: number
  minor: number
  patch: number
  type: 'net' | 'aspnetcore' | 'netcoreapp'
}

export const getInstalledSdkVersions = async (): Promise<DotnetSdkVersion[]> => {
  const sdkPath = path.join(getDotnetRootPath(), 'sdk')

  const dirs = await getDirectories(sdkPath)

  return dirs.map(dir => {
    const split = dir.name
      .split('.')
      .map(n => parseInt(n))

    return {
      major: split[0],
      minor: split[1],
      patch: split[2],
      path: dir.path
    } as DotnetSdkVersion
  })
}

export const getInstalledRuntimeVersions = async (): Promise<DotnetSdkVersion[]> => {
  const netcoreRuntimePath = path.join(getDotnetRootPath(), 'shared', 'Microsoft.NETCore.App')
  const aspnetCoreAllPath = path.join(getDotnetRootPath(), 'shared', 'Microsoft.AspNetCore.All') // old ASPNET Core 2.1 stuff
  const aspnetCoreAppPath = path.join(getDotnetRootPath(), 'shared', 'Microsoft.AspNetCore.App')

  const dirs = (await getDirectories(netcoreRuntimePath))
    .concat((await getDirectories(aspnetCoreAllPath)))
    .concat((await getDirectories(aspnetCoreAppPath)))

  return dirs.map(dir => {
    const versionSplit = dir.name
      .split('.')
      .map(n => parseInt(n))

    return {
      major: versionSplit[0],
      minor: versionSplit[1],
      patch: versionSplit[2],
      type: dir.path.startsWith(netcoreRuntimePath) ? 'net'
        : dir.path.startsWith(aspnetCoreAppPath) ? 'aspnetcore'
        : dir.path.startsWith(aspnetCoreAllPath) ? 'netcoreapp' : null,
      path: dir.path
    } as DotnetRuntimeVersion
  })
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