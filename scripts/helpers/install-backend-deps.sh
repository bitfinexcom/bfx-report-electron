#!/bin/bash

function installBackendDeps {
  local SCRIPTPATH="${SCRIPTPATH:-"$(cd -- "$(dirname "$0")" >/dev/null 2>&1; pwd -P)"}"
  local ROOT="${ROOT:-"$(dirname "$SCRIPTPATH")"}"
  CURRDIR="$PWD"

  local COLOR_RED=${COLOR_RED:-"\033[31m"}
  local COLOR_BLUE=${COLOR_BLUE:-"\033[34m"}
  local COLOR_NORMAL=${COLOR_NORMAL:-"\033[39m"}

  local WORKER_FOLDER="${WORKER_FOLDER:-"$ROOT/bfx-reports-framework"}"
  local EXPRESS_FOLDER="${EXPRESS_FOLDER:-"$ROOT/bfx-report-ui/bfx-report-express"}"

  source "$ROOT/scripts/helpers/get-conf-value.sh"
  source "$ROOT/scripts/helpers/check-node-modules-dir.sh"

  local ARCH=${ARCH:-"x64"}
  local DIST_URL="https://electronjs.org/headers"
  local ELECTRON_VER=$(getConfValue "electron" "$ROOT")

  local unameOut="$(uname -s)"
  local machine="${1:-"$unameOut"}"
  local targetPlatform=""

  case "${machine}" in
    Linux*) targetPlatform="linux";;
    linux) targetPlatform="linux";;
    Darwin*) targetPlatform="darwin";;
    mac) targetPlatform="darwin";;
    CYGWIN*) targetPlatform="win32";;
    MINGW*) targetPlatform="win32";;
    *win) targetPlatform="win32";;
    *)
      echo -e "\n${COLOR_RED}Unable to recognize operating system type!${COLOR_NORMAL}" >&2
      exit 1
      ;;
  esac

  echo -e "\n${COLOR_BLUE}Target platform entered is $targetPlatform${COLOR_NORMAL}"

  cd "$ROOT"
  echo -e "\n${COLOR_BLUE}Installing the main dev deps...${COLOR_NORMAL}"
  rm -rf ./node_modules
  npm i --development --no-audit
  npm ls --depth=0 --only=dev 1<&-

  export npm_config_target_platform="$targetPlatform"
  export npm_config_platform="$targetPlatform"
  export npm_config_target="$ELECTRON_VER"
  export npm_config_runtime="electron"
  export npm_config_target_arch="$ARCH"
  export npm_config_arch="$ARCH"
  export npm_config_dist_url="$DIST_URL"
  export npm_config_disturl="$DIST_URL"

  echo -e "\n${COLOR_BLUE}Installing the main prod deps...${COLOR_NORMAL}"
  npm i --production --no-audit
  rm -rf "$ROOT/node_modules/ed25519-supercop/build"
  checkNodeModulesDir "$ROOT"
  depsErr=$(npm ls --depth=0 --only=prod 2>&1 >/dev/null | grep -v "missing: eslint" || [[ $? == 1 ]])
  if [ -n "$depsErr" ]; then
    echo -e "$depsErr" >&2
    exit 1
  fi

  cd "$EXPRESS_FOLDER"
  echo -e "\n${COLOR_BLUE}Installing the prod express deps...${COLOR_NORMAL}"
  rm -rf ./node_modules
  npm i --production --no-audit
  checkNodeModulesDir "$EXPRESS_FOLDER"
  npm ls --depth=0 --only=prod 1<&-

  cd "$WORKER_FOLDER"
  echo -e "\n${COLOR_BLUE}Installing the prod worker deps...${COLOR_NORMAL}"
  rm -rf ./node_modules
  npm i --production --no-audit
  checkNodeModulesDir "$WORKER_FOLDER"
  npm ls --depth=0 --only=prod 1<&-

  cd "$CURRDIR"
}
