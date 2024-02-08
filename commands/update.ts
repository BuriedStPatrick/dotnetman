import yargs, { ArgumentsCamelCase, Argv, CommandBuilder, CommandModule } from 'yargs'
import { getDotnetRootPath } from '../util/dotnet'

export const updateCommand: CommandModule = {
  command: 'update',
  describe: 'Update installations',
  aliases: ['u'],
  builder: (command: CommandBuilder) => command
    .command(updatePowershellCommand)
}

const updatePowershellCommand: CommandModule = {
  command: 'pwsh',
  describe: 'Update powershell',
  aliases: ['p', 'powershell'],
  builder: (command: CommandBuilder) => command
    .example('dotnetman update pwsh'),
  handler: async (argv: Argv) => {
    // TODO: Check if `dotnet` is in PATH, error out if not

    const proc = Bun.spawn(['dotnet', 'tool', 'update', '--global', 'powershell'], {
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