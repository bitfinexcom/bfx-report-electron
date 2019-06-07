# bfx-report-electron

## Binaries

Already complied binaries can be found on release section [release section](https://github.com/bitfinexcom/bfx-report-electron/releases). </br>
Download the correspondent binary according your operating system.</br>  

#### <font color="red">macOS Mojave known issue</font></br>
On macOS Mojave software is not running on double click.</br>
As to run it from macOs open a console from folder where software was exported to and run:

```
./bfx-report-electron
```
We are actually working on a solution for this.

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
