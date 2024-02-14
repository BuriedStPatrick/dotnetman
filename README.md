# .NET MAN

Anyone who has fought with installing more than 1 SDK and runtime version of .NET know the pain of getting that to work with existing package management solutions for your specific OS/distro combination. It never *just works*.

This repo is an optionated wrapper CLI for managing .NET installations. It uses the `dotnet-install.sh` script behind-the-scenes to run installations.

This installs all your .NET binaries in one location under `~/.dotnet`. No more guessing games.

## Usage

Run the binary any way you like. Here I've put it somewhere within my `PATH`. Dotnetman uses the `sync` command to install and update your local SDKs and runtimes:

```bash
# NOTE: All SDK sync commands include the runtime as well:
dotnetman sync sdk                  # Update all installed SDKs
dotnetman sync sdk --channel 8.0      # Install/Update .NET 8 SDK

# In case you don't need the SDK:
dotnetman sync runtime              # Update all installed runtimes
dotnetman sync runtime --channel 8  # Install/Update .NET 8 SDK
```

You can also throw a sync config JSON file after it:

```bash
# Sync SDKs and runtimes based on config
dotnetman sync --file ./config.json
```

Here's what that file can look like:

```json
{
    "version": "0.1.0",
    "sdk": [
        "8.0",
        "6.0"
    ],
    "runtime": [
        "3.1"
    ]
}
```

> You can leave out any section here except the `version` property. This file format will probably change in the future, but for now we're keeping it simple.

### Manage SDKs

List installed .NET SDKs (that `.NET MAN` knows about):

```bash
dotnetman list sdk
```

> .NET MAN is an opinionated fella'. He looks at ~/.dotnet/sdk and doesn't care what `dotnet --list-sdks` says. If you're seeing a discrepancy, then you might have another .NET installation spooking around on your system. I'd get that cleaned up or .NET MAN gets angry.
