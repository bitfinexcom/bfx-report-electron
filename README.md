# bfx-report-electron

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
