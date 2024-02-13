import path from 'path'
import { readdir } from 'node:fs/promises';

export const getDownloadDirectory = (): string => {
  if (!process.env['HOME']) {
    throw new Error(`ENV var 'HOME' not defined`)
  }
  
  return path.join(process.env['HOME'], 'Downloads')
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
  if (!process.env['HOME']) {
    throw new Error(`ENV var 'HOME' not defined`)
  }

  return path.join(process.env['HOME'], '.dotnet')
}

export type DotnetSdk = {
  major: number
  minor: number
  patch: number
}

export type DotnetRuntime = {
  major: number
  minor: number
  patch: number
}

export const getInstalledSdks = async (): Promise<DotnetSdk[]> => {
  const sdkPath = path.join(getDotnetRootPath(), 'sdk')

  const dirs = await getDirectories(sdkPath)

  return dirs.map(dir => {
    const split = dir
      .split('.')
      .map(n => parseInt(n))

    return {
      major: split[0],
      minor: split[1],
      patch: split[2]
    } as DotnetSdk
  })
}

const getDirectories = async (source: string) =>
  (await readdir(source, { withFileTypes: true }))
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)


export const syncSdk = async (sdk: DotnetSdk) => {
  const proc = Bun.spawn([
    'bash',
    getInstallScriptPath(),
    '--channel',
    `${sdk.major}.${sdk.minor}`
  ], {
    stdout: 'inherit',
    stderr: 'inherit',
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

export const syncRuntime = async (runtime: DotnetRuntime) => {
  const proc = Bun.spawn([
    'bash',
    getInstallScriptPath(),
    '--channel',
    `${runtime.major}.${runtime.minor}`,
    '--runtime'
  ], {
    stdout: 'inherit',
    stderr: 'inherit',
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