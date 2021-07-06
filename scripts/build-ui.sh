#!/bin/bash

set -x

export CI_ENVIRONMENT_NAME=production
export SKIP_PREFLIGHT_CHECK=true

ROOT="$PWD"
frontendFolder="$ROOT/bfx-report-ui"
pathToTriggerElectronLoad="$frontendFolder/src/utils/triggerElectronLoad.js"
pathToFonts="$frontendFolder/src/styles/fonts"
uiBuildFolder="$frontendFolder/build"
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
if [ "$UI_BUILD_FOLDER" != "" ]
then
  uiBuildFolder=$UI_BUILD_FOLDER
fi

mkdir $uiBuildFolder 2>/dev/null
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

mv -f "$ROOT/.eslintrc" "$ROOT/eslint-conf-disabled-for-ui"
npm i --no-audit
npm run build
mv -f "$ROOT/eslint-conf-disabled-for-ui" "$ROOT/.eslintrc"

if ! [ -s "$frontendFolder/build/index.html" ]; then
  exit 1
fi

mv -f $frontendFolder/build/* $uiBuildFolder
cp $pathToTriggerElectronLoad $uiBuildFolder/triggerElectronLoad.js
cp -avrf $pathToFonts $uiBuildFolder
touch $uiReadyFile
