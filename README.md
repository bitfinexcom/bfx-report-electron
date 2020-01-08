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

For doing builds for other platforms please have “Multi Platform Build” in consideration: https://www.electron.build/multi-platform-build <br/>
For creating the distributions please run the following commands, after the execution is finished the file would be in */dist* folder

- Individual:

```console
#Distribution for Linux
npm run dist-linux

#Distribution for Windows
npm run dist-win

#Distribution for MacOs
npm run dist-mac
```

- Linux + Windows + MacOs:

```console
npm start
```

## Export CSV reports

Exported CSV reports are contained in the root folder of the application in `csv` directory for Linux and Windows releases, and in `~/Library/Application Support/bfx-report-electron/csv` directory for Mac release
