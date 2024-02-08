# .NET MAN

Anyone who has fought with installing more than 1 SDK and runtime version of .NET know the pain of getting that to work with existing package management solutions for your specific OS/distro combination. It never *just works*.

This repo is an optionated wrapper CLI for managing .NET installations. It uses the `dotnet-install.sh` script behind-the-scenes to run installations.

This installs all your .NET binaries in one location under `~/.dotnet`. No more guessing games. Inspired by the likes of Node Version Manager.

## Usage

You just need to run the binary any way you like. Here I've just put it somewhere within my `PATH`.

### Installing

Install .NET:

```bash
dotnetman install dotnet
```

Install PowerShell (assumes you have installed .NET already):

```bash
dotnetman install pwsh
```

### Updating

Update .NET (NOT SUPPORTED YET):

```bash
dotnetman update dotnet
```

Update PowerShell:

```bash
dotnetman update pwsh
```

### Manage SDKs

List installed .NET SDKs (that `.NET MAN` knows about):

```bash
dotnetman sdk list
```

> .NET MAN is an opinionated fella'. He only looks at ~/.dotnet/sdk and doesn't care what `dotnet --list-sdks` says. If you're seeing a discrepancy, then you might have another .NET installation spooking around on your system. I'd get that cleaned up or .NET MAN gets angry.
