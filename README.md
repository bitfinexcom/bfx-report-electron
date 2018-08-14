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
touch db/lokue_queue_1_aggregator.db.json
touch db/lokue_queue_1_processor.db.json
```

- to use `https://test.bitfinex.com`, change in the configuration file `service.report.json` the parameter `"restUrl": "https://api.bitfinex.com"` to `https://test.bitfinex.com`

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
