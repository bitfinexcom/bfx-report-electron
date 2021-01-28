#!/bin/bash

set -x

export CI_ENVIRONMENT_NAME=production

ROOT="$PWD"
frontendFolder="$ROOT/bfx-report-ui"
pathToTriggerElectronLoad="$frontendFolder/src/utils/triggerElectronLoad.js"
uiBuildFolder=/ui-build
uiReadyFile="$uiBuildFolder/READY"
branch=master

source $ROOT/scripts/update-submodules.sh

programname=$0
isDevEnv=0
isInitedSubmodules=0

if [ "$BRANCH" != "" ]
then
  branch=$BRANCH
fi

rm -rf $uiBuildFolder/*

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
    -i | --init )    isInitedSubmodules=1
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

if [ $isInitedSubmodules != 0 ]; then
  updateSubmodules $branch
fi

cd $frontendFolder

if ! [ -s "$frontendFolder/package.json" ]; then
  exit 1
fi

sed -i -e \
  "s/API_URL: .*,/API_URL: \'http:\/\/localhost:34343\/api\',/g" \
  $frontendFolder/src/config.js
sed -i -e \
  "s/WS_ADDRESS: .*,/WS_ADDRESS: \'ws:\/\/localhost:34343\/ws\',/g" \
  $frontendFolder/src/config.js

if [ $isDevEnv != 0 ]; then
  export CI_ENVIRONMENT_NAME=development

	sed -i -e \
    "s/KEY_URL: .*,/KEY_URL: \'https:\/\/api.staging.bitfinex.com\/api\',/g" \
    $frontendFolder/src/config.js
fi

sed -i -e \
  "s/localExport: false/localExport: true/g" \
  $frontendFolder/src/config.js
sed -i -e \
  "s/showAuthPage: false/showAuthPage: true/g" \
  $frontendFolder/src/config.js
sed -i -e \
  "s/isElectronApp: false/isElectronApp: true/g" \
  $frontendFolder/src/config.js
sed -i -e \
  "s/showFrameworkMode: false/showFrameworkMode: true/g" \
  $frontendFolder/src/config.js

rm -f "$ROOT/.eslintrc"

npm i --no-audit
npm run build

if ! [ -s "$frontendFolder/build/index.html" ]; then
  exit 1
fi

mv -f $frontendFolder/build/* $uiBuildFolder
cp $pathToTriggerElectronLoad $uiBuildFolder/triggerElectronLoad.js
touch $uiReadyFile
