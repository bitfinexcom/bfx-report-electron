# bfx-report-electron

## Binaries

Already complied binaries can be found on release section [release section](https://github.com/bitfinexcom/bfx-report-electron/releases)

Download the correspondent binary according your operating system

## Setup

Functionality has been tested on `Ubuntu 20.04 LTS`

### Main Structure

To simplify setup/build/publish processes the following bash scripts are provided:

- `./scripts/setup.sh` - CLI as an easy way to get through the setup process. It will launch `./scripts/sync-repo.sh` script and then setup the development environment
- `./scripts/sync-repo.sh` - CLI to fetch the last changes of the repository/sub-modules from the main remote repo
- `./scripts/launch.sh` - CLI to launch docker-compose services to build releases and publish executable artifacts of the electron app with the last fetched changes

Additional bash scripts:

- `./scripts/build-release.sh` - CLI as the entrypoint to start the build release process, uses in the docker container, but can be used independently
- `./scripts/build-ui.sh` - CLI as the entrypoint to start the build UI process, uses in the docker container, but can be used independently
- `./scripts/helpers` - folder with addition bash functions
- `./scripts/node` - folder with addition NodeJS scripts

### Requirements

The setup was tested with the following dependencies:

- Docker version 20.10.12
- docker-compose version 1.29.2
- git version 2.24.1

To install `Docker`/`docker-compose` check the corresponding sections of the official docs:

- [install Docker](https://docs.docker.com/engine/install)
- [install docker-compose](https://docs.docker.com/compose/install)
- if you don’t want to preface the docker command with sudo, create a Unix group called docker and add users to it, [check the doc](https://docs.docker.com/engine/install/linux-postinstall)

### Setup electron app

After cloning the repository there's needed to configure the app. For it can be used `./scripts/setup.sh` bash script.
Available the following arguments:

```console
./scripts/setup.sh -h

Usage: ./scripts/setup.sh [options] [-h]

Options:
  -r    Sync all repositories
  -o    Sync only sub-modules
  -s    Use staging BFX API
  -d    Set development environment
  -h    Display help
```

Also there will be executed the following steps:

- setup backend configs
- install all backend dependencies
- setup and build the UI static files

To launch `./scripts/setup.sh` script also can be used the following NPM script:

```console
npm run setup -- -r
```

### Sync repo process

In case needs to fetch the last changes all repository/sub-modules might be used `./scripts/sync-repo.sh` bash script.
Available the following arguments:

```console
./scripts/sync-repo.sh -h

Usage: ./scripts/sync-repo.sh [options] | [-h]

Options:
  -a    Sync all repositories
  -m    Sync bfx-report-electron only
  -w    Sync bfx-reports-framework only
  -u    Sync bfx-report-ui only
  -e    Sync bfx-report-express only
  -h    Display help
```

To launch `./scripts/sync-repo.sh` script also can be used the following NPM script:

```console
npm run sync-repo -- -wue
```

### Launch Electron App for dev purpose

For Dev purpose to launch the Electron app locally might be used the following NPM script:

```console
npm start
```

### Launch build process

For doing builds for other platforms please have [Multi Platform Build](https://www.electron.build/multi-platform-build) in consideration

To launch docker-compose services to build releases and publish executable artifacts of the electron app available the `./scripts/launch.sh` bash script.
Available the following arguments:

```console
./scripts/launch.sh -h

Usage: ./scripts/launch.sh [options] [-h]

Options:
  -a    Build all releases
  -l    Build Linux release
  -w    Build Windows release
  -m    Build Mac release
  -r    Sync all repositories
  -o    Sync only sub-modules
  -s    Use staging BFX API
  -d    Set development environment
  -p    Publish artifacts
  -h    Display help
```

It provides the following steps:

- if the corresponding flag is added will be fetched the last changes repository/sub-modules
- launch Docker container to build UI using `./scripts/build-ui.sh` entrypoint, compiled UI files will be used in the build process of the Electron app
- launch Docker containers for selected OSs (Linux, Windows, Mac) to build releases of the Electron app using `./scripts/build-release.sh` entrypoint
- if `-p` flag is passed and `GH_TOKEN` or `GITHUB_TOKEN` environment variable is set:
  - after the binary artifacts are successfully built
  - publish artifacts on the github releases page as a `draft`
  - after which they can be downloaded/tested and if everything is fine, press the buttons for editing and then publishing the release with the corresponding tag, check this [Recommended GitHub Releases Workflow](https://www.electron.build/configuration/publish#recommended-github-releases-workflow)
- without `-p` flag, artifacts will be in the `./dist` folder

To launch `./scripts/launch.sh` script also can be used the following NPM script:

```console
npm run launch -- -aop
```

> Also, we provide [GitHub Actioins workflows](https://docs.github.com/en/actions/using-workflows/about-workflows) configs for automated building and publishing of the Electron app artifacts using the above-described scripts `./scripts/launch.sh` and `./scripts/build-release.sh`, see the corresponding file `.github/workflows/build-electron-app.yml`
