#!/bin/bash

set -x

export NODE_PATH=src/
export PUBLIC_URL=/
export REACT_APP_PLATFORM=localhost
export REACT_APP_TITLE=Bitfinex Reports
export REACT_APP_LOGO_PATH=favicon.ico
export REACT_APP_ELECTRON=true

ROOT=$PWD

programname=$0
isDevEnv=0
isNotSkippedReiDeps=1
targetPlatform=0

function usage {
  echo "Usage: $programname [-d] | [-h]"
  echo "  -d      turn on developer environment"
  echo "  -h      display help"
  exit 1
}

while [ "$1" != "" ]; do
  case $1 in
    -d | --dev )    isDevEnv=1
                    ;;
    -s | --skip-rei-deps )    isNotSkippedReiDeps=0
                    ;;
    -p | --target-platform )  targetPlatform=$2; shift
                    ;;
    -h | --help )   usage
                    exit
                    ;;
    * )             usage
                    exit 1
  esac
  shift
done

if [ $isDevEnv != 0 ]; then
  echo "Developer environment is turned on"
fi

frontendFolder="$ROOT/bfx-report-ui"
expressFolder="$frontendFolder/bfx-report-express"
backendFolder="$ROOT/bfx-reports-framework"

rm -rf $frontendFolder
rm -rf $backendFolder
mkdir $frontendFolder
mkdir $backendFolder

git submodule sync
git submodule update --init --recursive
git pull --recurse-submodules
git submodule update --remote

cd $frontendFolder

git submodule sync
git submodule update --init --recursive
git pull --recurse-submodules
git submodule update --remote
npm i

sed -i -e "s/API_URL: .*,/API_URL: \'http:\/\/localhost:34343\/api\',/g" $frontendFolder/src/var/config.js
sed -i -e "s/WS_ADDRESS: .*,/WS_ADDRESS: \'ws:\/\/localhost:34343\/ws\',/g" $frontendFolder/src/var/config.js
echo "SKIP_PREFLIGHT_CHECK=true" >> $frontendFolder/.env

if [ $isDevEnv != 0 ]; then
	sed -i -e "s/KEY_URL: .*,/KEY_URL: \'https:\/\/test.bitfinex.com\/api\',/g" $frontendFolder/src/var/config.js
fi

sed -i -e "s/showAuthPage: .*,/showAuthPage: true,/g" $frontendFolder/src/var/config.js
sed -i -e "s/showSyncMode: .*,/showSyncMode: true,/g" $frontendFolder/src/var/config.js
sed -i -e "s/showFrameworkMode: .*,/showFrameworkMode: true,/g" $frontendFolder/src/var/config.js
npm run build

cp $expressFolder/config/default.json.example $expressFolder/config/default.json

cd $backendFolder

cp config/schedule.json.example config/schedule.json
cp config/common.json.example config/common.json
cp config/service.report.json.example config/service.report.json
cp config/facs/grc.config.json.example config/facs/grc.config.json
sed -i -e "s/\"syncMode\": false/\"syncMode\": true/g" $backendFolder/config/service.report.json

if [ $isDevEnv != 0 ]; then
  sed -i -e "s/\"restUrl\": .*,/\"restUrl\": \"https:\/\/test.bitfinex.com\",/g" $backendFolder/config/service.report.json
fi

cd $ROOT

if [ $isNotSkippedReiDeps != 0 ]; then
  if [ $targetPlatform != 0 ]
  then
    bash ./reinstall-deps.sh $targetPlatform
    ./node_modules/.bin/electron-builder build --$targetPlatform 2>/dev/null
    exit 0
  else
    bash ./reinstall-deps.sh
  fi
fi
