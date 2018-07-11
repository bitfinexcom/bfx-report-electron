# bfx-report-electron

## Setup

### Install

- install libraries. Once the project is cloned, execute the following commands from the root directory of the project:

```console
npm install
```

- go to the bfx-report-ui project folder, clone `bfx-report-ui` repository, install the libraries and run build:

```console
cd bfx-report-ui
git clone git@github.com:bitfinexcom/bfx-report-ui.git .
npm install
export REACT_APP_PLATFORM=localhost
export PUBLIC_URL=./
export NODE_PATH=src/
npm run build
cd ..
```

- go to the bfx-report project folder, clone `bfx-report` repository, install the libraries and configure service:

```console
cd bfx-report
git clone git@github.com:bitfinexcom/bfx-report.git .
npm install --production
cp config/default.json.example config/default.json
cp config/common.json.example config/common.json
cp config/service.report.json.example config/service.report.json
cp config/facs/grc.config.json.example config/facs/grc.config.json
```

- change the configuration file `config/default.json`, enter the parameter `"redirectCsvUrl": "https://dev-prdn.bitfinex.com:2995/"` in the root

```console
vim config/default.json
```

- change in the configuration file `common.json` the parameter `"isElectronEnv": false` to `true`

```console
vim config/common.json
```

- to use `https://dev-prdn.bitfinex.com:2998`, change in the configuration file `service.report.json` the parameter `"restUrl": "https://api.bitfinex.com"` to `https://dev-prdn.bitfinex.com:2998`

```console
vim config/service.report.json
cd ..
```

### Run the electron

```console
npm run electron
```

### Build distributions

```console
npm run dist-linux
npm run dist-win
npm run dist-mac
```

## Notes

- No loading state indicators

- No infinite scroll or pagination

- No csv download
