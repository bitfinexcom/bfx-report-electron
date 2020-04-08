#!/bin/bash

set -x

ROOT=$PWD

programname=$0
isDevEnv=0
isNotSkippedReiDeps=1
targetPlatform=0
isSkippedUIBuild=0

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
    -u | --skip-ui-build )    isSkippedUIBuild=1
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

mkdir $ROOT/dist 2>/dev/null
chmod a+xwr $ROOT/dist 2>/dev/null

git submodule foreach --recursive git reset --hard HEAD
git submodule sync
git submodule update --init --recursive
git pull --recurse-submodules
git submodule update --remote
git submodule foreach --recursive git clean -f

if [ $isSkippedUIBuild == 0 ]
then
  devFlag=""

  if [ $isDevEnv == 0 ]; then
    devFlag="-d"
  fi

  bash ./build-ui.sh $devFlag
fi

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

    if [ $isSkippedUIBuild != 0 ]
    then
      file="$frontendFolder/build/READY"

      while !(test -f "$file"); do
        sleep 0.5
      done
    fi

    ./node_modules/.bin/electron-builder build --$targetPlatform 2>/dev/null
    chmod -R a+wr ./dist

    exit 0
  else
    bash ./reinstall-deps.sh
  fi
fi
