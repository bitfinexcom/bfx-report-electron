# bfx-report-electron

## Setup

### Install

- Install libraries. Once the project is cloned, execute the following commands from the root directory of the project:

```console
npm install
```

- Install dependcies and configured them:

```console
npm run init
```

### Run the electron

```console
npm run electron
```

### Build distributions

For doing builds for other platforms please have “Multi Platform Build” in consideration: https://www.electron.build/multi-platform-build

- Individual:
```console
npm run dist-linux
npm run dist-win
npm run dist-mac
```

- Linux + Windows + MacOs:
```console
npm start
```
