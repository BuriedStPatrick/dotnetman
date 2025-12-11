# .NET MAN

Anyone who has fought with installing more than 1 SDK and runtime version of .NET know the pain of getting that to work with existing package management solutions for your specific OS/distro combination. It never *just works*.

This repo is an optionated wrapper CLI for managing .NET installations. It uses the `dotnet-install.sh` script behind-the-scenes to run installations.

This installs all your .NET binaries in one location under `~/.dotnet`. No more guessing games.

## Pre-requisites

Make sure you've set the following system-wide environment variables:

```bash
# /etc/profile.d/dotnet.env
export DOTNET_ROOT=${HOME}/.dotnet
export PATH=${PATH}:${HOME}/.dotnet
export PATH=${PATH}:${HOME}/.dotnet/tools/
```

This should ensure you have system-wide paths for all your .NET shenanigans like binaries and tools.

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

### With Docker

This repository also builds a docker image and pushes it to Docker hub if you don't want to download the binary manually. You'll need to map your current user into the running image so we don't mess up file permissions and of course mount the desired install directory, indicated by the `DOTNET_ROOT` variable here:

```bash
## Run a command directly off the image
docker run \
    -v ${DOTNET_ROOT}:/home/bun/.dotnet \
    -u $(id -u):bun \
    buriedstpatrick/dotnetman:v0.0.1-alpha17 <dotnet-man-args-here>

## Optionally, make your life easier with an alias in your shell:
alias dotnetman="docker run -v ${DOTNET_ROOT}:/home/bun/.dotnet -u $(id -u):bun buriedstpatrick/dotnetman:v0.0.1-alpha19"
```

> You can leave out any section here except the `version` property. This file format will probably change in the future, but for now we're keeping it simple.

### Manage SDKs

List installed .NET SDKs (that `.NET MAN` knows about):

```bash
dotnetman list sdk
```

> .NET MAN is an opinionated fella'. He looks at ~/.dotnet/sdk and doesn't care what `dotnet --list-sdks` says. If you're seeing a discrepancy, then you might have another .NET installation spooking around on your system. I'd get that cleaned up or .NET MAN gets angry.

## Build

With bun:

```bash
# Install dependencies
bun install

# Run build
bun run build
```

This builds the binary to `./bin/dotnetman`.

With Docker:

```bash
# Build
docker build . --tag dotnetman

# Run with:
docker run \
    -v ${DOTNET_ROOT}:/home/bun/.dotnet \
    -u $(id -u):bun \
    dotnetman <dotnet-man-args-here>

# Make your life easier with an alias:
alias dotnetman="docker run -v ${DOTNET_ROOT}:/home/bun/.dotnet -u $(id -u):bun dotnetman"
```

This binds your host system's `DOTNET_ROOT` to the container's `DOTNET_ROOT` location as well as your user to the `bun`-user that runs inside the container.
