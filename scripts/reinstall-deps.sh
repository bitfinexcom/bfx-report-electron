#!/bin/bash

set -x

ROOT="$PWD"

source $ROOT/scripts/get-conf-value.sh

ARCH="x64"
ELECTRON_VER=$(getConfValue "electron" $ROOT)
DIST_URL=https://electronjs.org/headers

unameOut="$(uname -s)"

case "${unameOut}" in
    Linux*)     machine=linux;;
    Darwin*)    machine=darwin;;
    CYGWIN*)    machine=win32;;
    MINGW*)     machine=win32;;
    *)          machine="UNKNOWN:${unameOut}"
esac

targetPlatform=$machine

if [ $# -ge 1 ]
then
  targetPlatform=$(echo $1 | sed -e 's/win$/win32/' -e 's/mac/darwin/')
fi

backendFolder="$ROOT/bfx-reports-framework"
expressFolder="$ROOT/bfx-report-ui/bfx-report-express"

cd $ROOT
rm -f ./package-lock.json
rm -rf ./node_modules
npm i --development --no-audit

export npm_config_target_platform=$targetPlatform
export npm_config_platform=$targetPlatform
export npm_config_target=$ELECTRON_VER
export npm_config_runtime="electron"
export npm_config_target_arch=$ARCH
export npm_config_arch=$ARCH
export npm_config_dist_url=$DIST_URL
export npm_config_disturl=$DIST_URL

rm -f ./package-lock.json
npm i --production --no-audit

cd $expressFolder
rm -f ./package-lock.json
rm -rf ./node_modules
npm i --production --no-audit

cd $backendFolder
rm -f ./package-lock.json
rm -rf ./node_modules
npm i --production --no-audit

if [ $targetPlatform == 'win32' ]
then
  betterSqlite3BinPath=$backendFolder/node_modules/better-sqlite3/build/Release
  binArch=$ROOT/build/better-sqlite3-prebuild-bin-win/better_sqlite3.zip

  rm -rf $betterSqlite3BinPath/better_sqlite3.node
  7z x $binArch -o$betterSqlite3BinPath
fi

cd $ROOT
rm -rf "$ROOT/node_modules/ed25519-supercop/build"
