#!/bin/bash

frontendFolder="$PWD/bfx-report-ui"
backendFolder="$PWD/bfx-report"

npm i

rm -rf $frontendFolder
mkdir $frontendFolder
cd $frontendFolder
git clone git@github.com:bitfinexcom/bfx-report-ui.git .
npm i
export REACT_APP_PLATFORM=localhost
export PUBLIC_URL=./
export NODE_PATH=src/
npm run build

rm -rf $backendFolder
mkdir $backendFolder
cd $backendFolder
git clone git@github.com:bitfinexcom/bfx-report.git .
npm i --production
cp config/default.json.example config/default.json
cp config/common.json.example config/common.json
cp config/service.report.json.example config/service.report.json
cp config/facs/grc.config.json.example config/facs/grc.config.json
touch db/lokue_queue_1_aggregator.db.json
touch db/lokue_queue_1_processor.db.json
