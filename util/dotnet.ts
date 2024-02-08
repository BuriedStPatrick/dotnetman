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

export const getInstalledSdks = async (): Promise<string[]> => {
  const sdkPath = path.join(getDotnetRootPath(), 'sdk')
  
  return await getDirectories(sdkPath)
}

const getDirectories = async (source: string) =>
  (await readdir(source, { withFileTypes: true }))
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)