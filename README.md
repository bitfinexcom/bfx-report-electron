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
