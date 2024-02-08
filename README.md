# .NET MAN

Anyone who has fought with installing more than 1 SDK and runtime version of .NET know the pain of getting that to work with existing package management solutions for your specific OS/distro combination. It never *just works*.

This repo is an optionated wrapper CLI for managing .NET installations. It uses the `dotnet-install.sh` script behind-the-scenes to run installations.

This installs all your .NET binaries in one location under `~/.dotnet`. No more guessing games. Inspired by the likes of Node Version Manager.

## Usage

```bash
dotnetman install --lts
```
