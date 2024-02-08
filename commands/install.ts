import yargs, { ArgumentsCamelCase, Argv, CommandBuilder, CommandModule } from 'yargs'
import path from 'path'

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

export const installCommand: CommandModule = {
  command: 'install',
  describe: 'Install dotnet version',
  aliases: ['i'],
  builder: (command: CommandBuilder) => command
    .example('dotnetvm install'),
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
  }
}
