#!/bin/bash

ELECTRON_VER="2.0.18"
ARCH="x64"
ROOT=$PWD

export IOJS_ORG_MIRROR=https://atom.io/download/electron
export ATOM_ELECTRON_URL=https://atom.io/download/electron

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
  targetPlatform=$1
fi

backendFolder="$ROOT/bfx-reports-framework"
expressFolder="$ROOT/bfx-report-ui/bfx-report-express"

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

  npm i --production \
    --target_platform=$targetPlatform \
    --target=$ELECTRON_VER \
    --runtime="electron" \
    --arch=$ARCH \
    --target_arch=$ARCH \
    --dist-url=$ATOM_ELECTRON_URL

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

  ./node_modules/.bin/electron-rebuild -f -p \
    -t $types \
    -a $ARCH \
    -v $ELECTRON_VER \
    -d $ATOM_ELECTRON_URL \
    -m $folder

  cd $prevFolder
}

npmInstall $ROOT "--isDevNeeded"
postInstall $ROOT "prod"

npmInstall $backendFolder
postInstall $backendFolder

npmInstall $expressFolder
postInstall $expressFolder
