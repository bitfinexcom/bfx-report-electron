#!/bin/bash

set -x

function getModuleVersion {
  local prevFolder=$PWD
  local dep=""
  local version=""

  if [ $# -ge 1 ]
  then
    dep=$1
  else
    return
  fi
  if [ $# -ge 2 ]
  then
    cd $2
  fi

  version=$(cat package.json \
    | grep \"$dep\" \
    | head -1 \
    | awk -F: '{ print $2 }' \
    | sed 's/[",]//g' \
    | tr -d '[[:space:]]')

  if [ $# -ge 1 ]
  then
    cd $prevFolder
  fi

  echo $version
}

ELECTRON_VER=$(getModuleVersion "electron" $PWD)
ARCH="x64"
ROOT=$PWD
DIST_URL=https://atom.io/download/electron

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

function npmInstallDep {
  local prevFolder=$PWD
  local dep=""
  local version=""

  if [ $# -ge 1 ]
  then
    cd $1
  fi
  if [ $# -ge 2 ]
  then
    dep=$2
  else
    return
  fi
  if [ $# -ge 3 ]
  then
    version="@$3"
  fi

  rm -rf ./node_modules/$dep

  npm i "$dep$version" \
    --no-save \
    --target_platform=$targetPlatform \
    --target=$ELECTRON_VER \
    --runtime="electron" \
    --target_arch=$ARCH \
    --dist-url=$DIST_URL

  if [ $# -ge 1 ]
  then
    cd $prevFolder
  fi
}

function npmInstall {
  local prevFolder=$PWD
  local isDevNeeded=0

  if [ $# -ge 1 ]
  then
    cd $1
  fi

  rm -f ./package-lock.json
  rm -rf ./node_modules

  if [ $# -ge 2 ] && [ $2 == "--isDevNeeded" ]
  then
    npm i --development
  fi

  npm i --production

  if [ $# -ge 1 ]
  then
    cd $prevFolder
  fi
}

function postInstall {
  local prevFolder=$PWD
  local types="dev,prod,optional"
  local folder=$prevFolder

  if [ $# -ge 1 ]
  then
    folder=$1
  fi
  if [ $# -ge 2 ]
  then
    types=$2
  fi

  cd $ROOT

  ./node_modules/.bin/electron-rebuild -p \
    -t $types \
    -a $ARCH \
    -v $ELECTRON_VER \
    -d $DIST_URL \
    -m $folder

  cd $prevFolder
}

npmInstall $ROOT "--isDevNeeded"
postInstall $ROOT "prod"

npmInstall $expressFolder
postInstall $expressFolder

npmInstall $backendFolder
postInstall $backendFolder
sqliteVer=$(getModuleVersion "sqlite3" $backendFolder)
npmInstallDep $backendFolder "sqlite3" $sqliteVer
