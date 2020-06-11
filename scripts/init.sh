#!/bin/bash

set -x

ROOT="$PWD"
branch=master

source $ROOT/scripts/get-conf-value.sh
source $ROOT/scripts/escape-string.sh
source $ROOT/scripts/update-submodules.sh

programname=$0
isDevEnv=0
isNotSkippedReiDeps=1
targetPlatform=0
isSkippedUIBuild=0

if [ "$BRANCH" != "" ]
then
  branch=$BRANCH
fi

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
uiBuildFolder=/ui-build
uiReadyFile="$uiBuildFolder/READY"

mkdir $ROOT/dist 2>/dev/null
chmod a+xwr $ROOT/dist 2>/dev/null

updateSubmodules $branch

if [ $isSkippedUIBuild == 0 ]
then
  devFlag=""

  if [ $isDevEnv == 0 ]; then
    devFlag="-d"
  fi

  bash $ROOT/scripts/build-ui.sh $devFlag
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

bfxReportDep=$(getConfValue "bfx-report" $backendFolder)
escapedBfxReportDep=$(escapeString $bfxReportDep)

if [ $branch == "master" ]
then
  sed -i -e "s/\"bfx-report\": .*,/\"bfx-report\": \"$escapedBfxReportDep\",/g" $backendFolder/package.json
else
  sed -i -e "s/\"bfx-report\": .*,/\"bfx-report\": \"$escapedBfxReportDep\#$branch\",/g" $backendFolder/package.json
fi

cd $ROOT

if [ $isNotSkippedReiDeps != 0 ]; then
  if [ $targetPlatform != 0 ]
  then
    bash $ROOT/scripts/reinstall-deps.sh $targetPlatform

    if [ $isSkippedUIBuild != 0 ]
    then
      while !(test -f "$uiReadyFile"); do
        sleep 0.5
      done
    fi

    mkdir $frontendFolder/build 2>/dev/null
    rm -rf $frontendFolder/build/*
    cp -avr $uiBuildFolder/* $frontendFolder/build
    chmod -R a+xwr $frontendFolder/build
    ./node_modules/.bin/electron-builder build --$targetPlatform
    chmod -R a+xwr ./dist

    productName=$(getConfValue "productName" $ROOT)
    version=$(getConfValue "version" $ROOT)
    versionEnding=""

    if [ $branch != 'master' ]
    then
      versionEnding="-$branch"
    fi

    arch="x64"

    unpackedFolder=$(ls -d $ROOT/dist/*/ | grep $targetPlatform | head -1)
    zipFile="$ROOT/dist/$productName-$version$versionEnding-$arch-$targetPlatform.zip"

    if ! [ -d $unpackedFolder ]; then
      exit 1
    fi

    cd $unpackedFolder
    7z a -tzip $zipFile . -mmt | grep -v "Compressing"
    cd $ROOT

    rm -rf /dist/*$targetPlatform*
    mv -f ./dist/*$targetPlatform*.zip /dist
    chmod -R a+xwr /dist 2>/dev/null

    exit 0
  else
    bash $ROOT/scripts/reinstall-deps.sh
  fi
fi
