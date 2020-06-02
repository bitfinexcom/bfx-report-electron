#!/bin/bash

set -x

ROOT=$PWD
branch=master

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

function getConfValue {
  local dep=""
  local path=$ROOT
  local value=""

  if [ $# -ge 1 ]
  then
    dep=$1
  else
    exit 1
  fi

  if [ $# -ge 2 ]
  then
    path=$2
  fi

  version=$(cat $path/package.json \
    | grep \"$dep\" \
    | head -1 \
    | awk -F: '{ print $2$3 }' \
    | sed 's/[",]//g' \
    | sed 's/#.*$//' \
    | tr -d '[[:space:]]')

  echo $version
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

git submodule foreach --recursive git clean -fdx
git submodule foreach --recursive git reset --hard HEAD
git submodule sync --recursive
git submodule update --init --recursive
git config url."https://github.com/".insteadOf git@github.com:
git submodule foreach --recursive git checkout $branch
git pull --recurse-submodules

if [ $branch == "master" ]
then
  git submodule update --remote --recursive
fi

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

bfxReportDep=$(getConfValue "bfx-report" $backendFolder)

if [ $branch != "master" ]
then
  # TODO:
fi

cd $ROOT

if [ $isNotSkippedReiDeps != 0 ]; then
  if [ $targetPlatform != 0 ]
  then
    bash ./reinstall-deps.sh $targetPlatform

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

    productName=$(getConfValue "productName")
    version=$(getConfValue "version")
    arch="x64"

    unpackedFolder=$(ls -d $ROOT/dist/*/ | grep $targetPlatform | head -1)
    zipFile="$ROOT/dist/$productName-$version-$arch-$targetPlatform.zip"

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
    bash ./reinstall-deps.sh
  fi
fi
