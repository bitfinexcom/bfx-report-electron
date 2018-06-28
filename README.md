# bfx-report-electron

## Setup

### Install

- install libraries. Once the project is cloned, execute the following commands from the root directory of the project:

```
npm install
```

- go to the bfx-report-ui project folder, clone `bfx-report-ui` repository, install the libraries and run build:

```
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

```
cd bfx-report
git clone git@github.com:bitfinexcom/bfx-report.git .
npm install --production
cp config/local-production.json.example config/local-production.json
cp config/common.json.example config/common.json
cp config/service.report.json.example config/service.report.json
cp config/facs/grc.config.json.example config/facs/grc.config.json
cd ..
```

> To use `https://dev-prdn.bitfinex.com:2998`, change in the configuration file `local-production.json` the parameter `"restUrl": "https://api.bitfinex.com"` to `https://dev-prdn.bitfinex.com:2998`

### Run the electron

```
npm run electron
```

### Build distributions

```
npm run dist-linux
npm run dist-win
npm run dist-mac
```

## Notes

- Close and reopen will show the empty list. It caused by we local cache the auth state(include auth status) so the ui can't recognize its been re-opened. Press auth button and fetch data again will work for now

- Current query are fixed to last 2 weeks and fetch max query, will implement the time range selector to allow user fetch data from different time range with different query limit

- No loading state indicators

- No infinite scroll or pagination

- No csv download