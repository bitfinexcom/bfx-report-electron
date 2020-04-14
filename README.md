# bfx-report-electron

## Binaries

Already complied binaries can be found on release section [release section](https://github.com/bitfinexcom/bfx-report-electron/releases). </br>
Download the correspondent binary according your operating system.</br>  

## Setup

### Install

Execute the following commands from the root directory of the project:

- Install libraries.

```console
npm install
```

- Install dependcies and configured them.

```console
npm run init
```

### Run the electron

```console
npm run electron
```

### Build distributions

For doing builds for other platforms please have “Multi Platform Build” in consideration: [electron-builder documentation](https://www.electron.build/multi-platform-build)

#### Requirements

- [Install Docker](https://docs.docker.com/engine/install)
- [Install Docker Compose](https://docs.docker.com/compose/install/#install-compose-on-linux-systems)
- For Linux, if you don’t want to preface the docker command with `sudo`, create a Unix group called docker and add users to it, [check the documentation](https://docs.docker.com/engine/install/linux-postinstall)

For creating the distributions please run the following commands, after the execution is finished the file would be in */dist* folder

- Individual:

```console
#Distribution for Linux
docker-compose up --build --force-recreate ui-builder linux-builder

#Distribution for Windows
docker-compose up --build --force-recreate ui-builder win-builder

#Distribution for MacOs
docker-compose up --build --force-recreate ui-builder mac-builder
```

- Linux + Windows + MacOs:

```console
docker-compose up --build --force-recreate
```

## Export CSV reports

Exported CSV reports are contained in the root folder of the application in `csv` directory for Linux and Windows releases, and in `~/Library/Application Support/bfx-report-electron/csv` directory for Mac release
