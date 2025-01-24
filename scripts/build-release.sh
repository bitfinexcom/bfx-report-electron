#!/bin/bash

set -euo pipefail

SCRIPTPATH="${SCRIPTPATH:-"$(cd -- "$(dirname "$0")" >/dev/null 2>&1; pwd -P)"}"
ROOT="${ROOT:-"$(dirname "$SCRIPTPATH")"}"
BUILD_RELEASE_CURRDIR="$PWD"
DOT_ENV_FILE_PATH="$ROOT/.env"

set -a
[ -f "$DOT_ENV_FILE_PATH" ] && . "$DOT_ENV_FILE_PATH"
set +a

COLOR_RED=${COLOR_RED:-"\033[31m"}
COLOR_GREEN=${COLOR_GREEN:-"\033[32m"}
COLOR_YELLOW=${COLOR_YELLOW:-"\033[33m"}
COLOR_BLUE=${COLOR_BLUE:-"\033[34m"}
COLOR_NORMAL=${COLOR_NORMAL:-"\033[39m"}

export ARCH=${ARCH:-"x64"}
BFX_API_URL="https://api-pub.bitfinex.com"
STAGING_BFX_API_URL="https://api.staging.bitfinex.com"

ELECTRON_BUILDER_CONFIG_FILE_NAME="electron-builder-config.js"
ELECTRON_BUILDER_CONFIG_FILE_PATH="$ROOT/$ELECTRON_BUILDER_CONFIG_FILE_NAME"
LAST_COMMIT_FILE_NAME="lastCommit.json"
ELECTRON_ENV_FILE_NAME="electronEnv.json"

WORKER_FOLDER="$ROOT/bfx-reports-framework"
UI_FOLDER="$ROOT/bfx-report-ui"
EXPRESS_FOLDER="$UI_FOLDER/bfx-report-express"
UI_BUILD_FOLDER="$UI_FOLDER/build"
COMMON_UI_BUILD_FOLDER="${COMMON_UI_BUILD_FOLDER:-}"
DIST_FOLDER="$ROOT/dist"
COMMON_DIST_FOLDER="${COMMON_DIST_FOLDER:-}"
ELECTRON_CACHE="${ELECTRON_CACHE:-}"
ELECTRON_BUILDER_CACHE="${ELECTRON_BUILDER_CACHE:-}"

source "$ROOT/scripts/helpers/make-last-commit-json.sh"
source "$ROOT/scripts/helpers/run-ui-watchdog.sh"
source "$ROOT/scripts/helpers/escape-string.sh"
source "$ROOT/scripts/helpers/install-backend-deps.sh"
source "$ROOT/scripts/helpers/get-conf-value.sh"
source "$ROOT/scripts/helpers/change-dir-ownership-to-curr-user.sh"

programname=$0
targetPlatform=""
countReqOSs=0
bfxApiUrl="$BFX_API_URL"
productName=$(getConfValue "productName" "$ROOT" "$ELECTRON_BUILDER_CONFIG_FILE_NAME")
version=$(getConfValue "version" "$ROOT")
hasIUNotBeenBuilt=0

buildLinux=0
buildWin=0
buildMac=0
isBfxApiStaging=${IS_BFX_API_STAGING:-0}
isDevEnv=${IS_DEV_ENV:-0}
isAutoUpdateDisabled=${IS_AUTO_UPDATE_DISABLED:-0}
isPublished=${IS_PUBLISHED:-0}

function usage {
  echo -e "\
\n${COLOR_GREEN}Usage: $programname [options] [-h]${COLOR_BLUE}
\nOptions:
  -l    Build Linux release
  -w    Build Windows release
  -m    Build Mac release
  -s    Use staging BFX API
  -d    Set development environment
  -u    Turn off auto-update
  -p    Publish artifacts
  -h    Display help\
${COLOR_NORMAL}" 1>&2
}

if [ $# == 0 ]; then
  echo -e "\n${COLOR_RED}Requires at least one option!${COLOR_NORMAL}" >&2
  usage
  exit 1
fi

while getopts "lwmsduph" opt; do
  case "${opt}" in
    l) buildLinux=1;;
    w) buildWin=1;;
    m) buildMac=1;;
    s) isBfxApiStaging=1;;
    d) isDevEnv=1;;
    u) isAutoUpdateDisabled=1;;
    p) isPublished=1;;
    h)
      usage
      exit 0
      ;;
    *)
      echo -e "\n${COLOR_RED}No reasonable options found!${COLOR_NORMAL}" >&2
      usage
      exit 1
      ;;
  esac
done

declare -a areqOSArr=(
  $buildLinux
  $buildWin
  $buildMac
)

for i in "${areqOSArr[@]}"; do
  if [ $i == 1 ]; then
    ((countReqOSs+=1))
  fi
  if [[ $countReqOSs > 1 ]]; then
    echo -e "\n${COLOR_RED}A release for only one OS may be required!${COLOR_NORMAL}" >&2
    exit 1
  fi
done

if [ $countReqOSs != 1 ]; then
  echo -e "\n${COLOR_RED}A release for at least one OS may be required!${COLOR_NORMAL}" >&2
  exit 1
fi

if [ $buildLinux == 1 ]; then
  targetPlatform="linux"
fi
if [ $buildWin == 1 ]; then
  targetPlatform="win"
fi
if [ $buildMac == 1 ]; then
  targetPlatform="mac"
fi

cp "$ROOT/$ELECTRON_ENV_FILE_NAME.example" \
  "$ROOT/$ELECTRON_ENV_FILE_NAME"

if [ $isBfxApiStaging == 1 ]; then
  bfxApiUrl="$STAGING_BFX_API_URL"
fi
if [ $isDevEnv == 1 ]; then
  echo -e "\n${COLOR_YELLOW}Developer environment is turned on!${COLOR_NORMAL}"

  sed -i".bak" -E -e \
    "s/\"NODE_ENV\": \".*\"/\"NODE_ENV\": \"development\"/g" \
    "$ROOT/$ELECTRON_ENV_FILE_NAME"; rm -f "$ROOT/$ELECTRON_ENV_FILE_NAME.bak"
else
  sed -i".bak" -E -e \
    "s/\"NODE_ENV\": \".*\"/\"NODE_ENV\": \"production\"/g" \
    "$ROOT/$ELECTRON_ENV_FILE_NAME"; rm -f "$ROOT/$ELECTRON_ENV_FILE_NAME.bak"
fi
if [ $isAutoUpdateDisabled == 1 ]; then
  echo -e "\n${COLOR_YELLOW}Auto-update is turned off!${COLOR_NORMAL}"

  sed -i".bak" -E -e \
    "s/\"IS_AUTO_UPDATE_DISABLED\": ((false)|(true))/\"IS_AUTO_UPDATE_DISABLED\": true/g" \
    "$ROOT/$ELECTRON_ENV_FILE_NAME"; rm -f "$ROOT/$ELECTRON_ENV_FILE_NAME.bak"
else
  sed -i".bak" -E -e \
    "s/\"IS_AUTO_UPDATE_DISABLED\": ((false)|(true))/\"IS_AUTO_UPDATE_DISABLED\": false/g" \
    "$ROOT/$ELECTRON_ENV_FILE_NAME"; rm -f "$ROOT/$ELECTRON_ENV_FILE_NAME.bak"
fi

makeLastCommitJson "$ROOT/$LAST_COMMIT_FILE_NAME"

echo -e "\n${COLOR_BLUE}Making backend config files${COLOR_NORMAL}"

cp "$WORKER_FOLDER/config/schedule.json.example" \
  "$WORKER_FOLDER/config/schedule.json"
cp "$WORKER_FOLDER/config/common.json.example" \
  "$WORKER_FOLDER/config/common.json"
cp "$WORKER_FOLDER/config/service.report.json.example" \
  "$WORKER_FOLDER/config/service.report.json"
cp "$WORKER_FOLDER/config/facs/grc.config.json.example" \
  "$WORKER_FOLDER/config/facs/grc.config.json"
cp "$WORKER_FOLDER/config/facs/grc-slack.config.json.example" \
  "$WORKER_FOLDER/config/facs/grc-slack.config.json"
cp "$EXPRESS_FOLDER/config/default.json.example" \
  "$EXPRESS_FOLDER/config/default.json"

echo -e "\n${COLOR_BLUE}Setting backend configs${COLOR_NORMAL}"

escapedBfxApiUrl=$(escapeString $bfxApiUrl)
sed -i".bak" -E -e \
  "s/\"restUrl\": \".*\"/\"restUrl\": \"$escapedBfxApiUrl\"/g" \
  "$WORKER_FOLDER/config/service.report.json"; rm -f "$WORKER_FOLDER/config/service.report.json.bak"

installBackendDeps "$targetPlatform"

echo -e "\n${COLOR_BLUE}Watching for UI build...${COLOR_NORMAL}"

if [ -d "$COMMON_UI_BUILD_FOLDER" ]; then
  if ! runUIWatchdog "$COMMON_UI_BUILD_FOLDER"; then
    hasIUNotBeenBuilt=1
    echo -e "\n${COLOR_YELLOW}The UI has not been built within the specified time. \
Trying to build it again...${COLOR_NORMAL}" >&2
  else
    mkdir -p "$UI_BUILD_FOLDER" 2>/dev/null
    rm -rf "$UI_BUILD_FOLDER/"*
    cp -rf "$COMMON_UI_BUILD_FOLDER/"* "$UI_BUILD_FOLDER"
  fi
fi
if ! [ -d "$COMMON_UI_BUILD_FOLDER" ] || [ $hasIUNotBeenBuilt == 1 ]; then
  COMMON_UI_BUILD_FOLDER=""
  "$ROOT/scripts/build-ui.sh"

  if ! runUIWatchdog "$UI_BUILD_FOLDER" 10; then
    echo -e "\n${COLOR_RED}The UI has not been built within the specified time!${COLOR_NORMAL}" >&2
    exit 1
  fi

  hasIUNotBeenBuilt=0
fi

echo -e "\n${COLOR_GREEN}The UI has been built successful${COLOR_NORMAL}"

echo -e "\n${COLOR_BLUE}Electron app buiding...${COLOR_NORMAL}"

publishOption=""

if [ $isPublished == 1 ]; then
  # Available: 'onTag', 'onTagOrDraft', 'always', 'never'
  publishOption="--publish always"
else
  publishOption="--publish never"
fi

rm -rf "$DIST_FOLDER/"*"$targetPlatform"*
node "$ROOT/node_modules/.bin/electron-builder" \
  "build" "--$targetPlatform" "--$ARCH" \
  "--config" "$ELECTRON_BUILDER_CONFIG_FILE_PATH" \
  $publishOption

unpackedFolder=$(ls -d "$DIST_FOLDER/"*/ | grep $targetPlatform | head -1)

# Don't remove the unpacked folder of the app for e2e test runner
# but keep it for further debugging purposes
# rm -rf "$unpackedFolder"
rm -rf "$DIST_FOLDER/.icon-ico"
rm -f "$DIST_FOLDER/builder-effective-config.yaml"
rm -f "$DIST_FOLDER/builder-debug.yml"

if ! [ -d "$COMMON_DIST_FOLDER" ]; then
  chmod -fR a+xwr "$DIST_FOLDER" || [[ $? == 1 ]]

  echo -e "\n${COLOR_GREEN}The electron app has been built successful${COLOR_NORMAL}"
  cd "$BUILD_RELEASE_CURRDIR"
  exit 0
fi

if [ $buildWin == 1 ]; then
  rm -f "$COMMON_DIST_FOLDER/latest.yml"
  rm -f "$COMMON_DIST_FOLDER/beta.yml"
  rm -f "$COMMON_DIST_FOLDER/alpha.yml"
fi

rm -rf "$COMMON_DIST_FOLDER/"*"$targetPlatform"*
mv -f "$DIST_FOLDER/"* "$COMMON_DIST_FOLDER"

chmod -fR a+xwr "$COMMON_DIST_FOLDER" || [[ $? == 1 ]]

echo -e "\n${COLOR_GREEN}The electron app has been built successful${COLOR_NORMAL}"
cd "$BUILD_RELEASE_CURRDIR"
