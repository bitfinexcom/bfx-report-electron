#!/bin/bash
export IOJS_ORG_MIRROR=https://atom.io/download/electron
export ATOM_ELECTRON_URL=https://atom.io/download/electron
export NODE_PATH=src/
export PUBLIC_URL=/
export REACT_APP_PLATFORM=localhost
export REACT_APP_TITLE=Bitfinex Reports
export REACT_APP_LOGO_PATH=favicon.ico

frontendFolder="$PWD/bfx-report-ui"
backendFolder="$PWD/bfx-report"

rm -f ./package-lock.json
rm -rf ./node_modules
npm i
./node_modules/.bin/electron-rebuild -f --arch=x64 -v=2.0.11 --dist-url=https://atom.io/download/electron

rm -rf $frontendFolder
mkdir $frontendFolder
cd $frontendFolder
git clone git@github.com:bitfinexcom/bfx-report-ui.git .
npm i

sed -i -e "s/API_URL: .*,/API_URL: \'http:\/\/localhost:34343\/api\',/g" $frontendFolder/src/var/config.js
# sed -i -e "s/KEY_URL: .*,/KEY_URL: \'https:\/\/test.bitfinex.com\/api\',/g" $frontendFolder/src/var/config.js
sed -i -e "s/showSyncMode: .*,/showSyncMode: true,/g" $frontendFolder/src/var/config.js
npm run build

rm -rf $backendFolder
mkdir $backendFolder
cd $backendFolder
git clone git@github.com:bitfinexcom/bfx-report.git .
npm i --production --target=2.0.11 --runtime=electron --arch=x64 --dist-url=https://atom.io/download/electron

cp config/schedule.json.example config/schedule.json
cp config/default.json.example config/default.json
cp config/common.json.example config/common.json
cp config/service.report.json.example config/service.report.json
cp config/facs/grc.config.json.example config/facs/grc.config.json
sed -i -e "s/\"syncMode\": false/\"syncMode\": true/g" $backendFolder/config/service.report.json
# sed -i -e "s/\"restUrl\": .*,/\"restUrl\": \"https:\/\/test.bitfinex.com\",/g" $backendFolder/config/service.report.json
touch db/lokue_queue_1_aggregator.db.json
touch db/lokue_queue_1_processor.db.json
touch db/db-sqlite_sync_m0.db
