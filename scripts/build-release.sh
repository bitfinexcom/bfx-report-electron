#!/bin/bash

set -euox pipefail

SCRIPTPATH="$(cd -- "$(dirname "$0")" >/dev/null 2>&1; pwd -P)"
ROOT="$(dirname "$SCRIPTPATH")"

COLOR_RED="\033[31m"
COLOR_GREEN="\033[32m"
COLOR_YELLOW="\033[33m"
COLOR_BLUE="\033[34m"
COLOR_NORMAL="\033[39m"

ARCH="x64"
BFX_API_URL="https://api-pub.bitfinex.com"
STAGING_BFX_API_URL="https://api.staging.bitfinex.com"

ELECTRON_BUILDER_CONFIG_FILE_PATH="$ROOT/electron-builder.json"
LAST_COMMIT_FILE_NAME="lastCommit.json"

WORKER_FOLDER="$ROOT/bfx-reports-framework"
UI_FOLDER="$ROOT/bfx-report-ui"
EXPRESS_FOLDER="$UI_FOLDER/bfx-report-express"
UI_BUILD_FOLDER="$UI_FOLDER/build"
COMMON_UI_BUILD_FOLDER="${COMMON_UI_BUILD_FOLDER:-}"
DIST_FOLDER="$ROOT/dist"
COMMON_DIST_FOLDER="${COMMON_DIST_FOLDER:-}"

source "$ROOT/scripts/helpers/make-last-commit-json.sh"
source "$ROOT/scripts/helpers/run-ui-watchdog.sh"
source "$ROOT/scripts/helpers/escape-string.sh"
source "$ROOT/scripts/helpers/install-backend-deps.sh"
source "$ROOT/scripts/helpers/get-conf-value.sh"

programname=$0
targetPlatform=""
countReqOSs=0
bfxApiUrl="$BFX_API_URL"
productName=$(getConfValue "productName" "$ROOT")
version=$(getConfValue "version" "$ROOT")
hasIUNotBeenBuilt=0

buildLinux=0
buildWin=0
buildMac=0
isBfxApiStaging=${IS_BFX_API_STAGING:-0}
isDevEnv=${IS_DEV_ENV:-0}

function usage {
  echo -e "\
\n${COLOR_GREEN}Usage: $programname [options] [-h]${COLOR_BLUE}
\nOptions:
  -l    Build Linux release
  -w    Build Windows release
  -m    Build Mac release
  -s    Use staging BFX API
  -d    Set development environment
  -h    Display help\
${COLOR_NORMAL}" 1>&2
}

if [ $# == 0 ]; then
  echo -e "\n${COLOR_RED}Requires at least one option!${COLOR_NORMAL}" >&2
  usage
  exit 1
fi

while getopts "lwmsdh" opt; do
  case "${opt}" in
    l) buildLinux=1;;
    w) buildWin=1;;
    m) buildMac=1;;
    s) isBfxApiStaging=1;;
    d) isDevEnv=1;;
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

if [ $isBfxApiStaging == 1 ]; then
  bfxApiUrl="$STAGING_BFX_API_URL"
fi
if [ $isDevEnv == 1 ]; then
  echo -e "\n${COLOR_YELLOW}Developer environment is turned on!${COLOR_NORMAL}"
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
sed -i -e \
  "s/\"restUrl\": \".*\"/\"restUrl\": \"$escapedBfxApiUrl\"/g" \
  "$WORKER_FOLDER/config/service.report.json"

installBackendDeps "$targetPlatform"

echo -e "\n${COLOR_BLUE}Watching for UI build...${COLOR_NORMAL}"

if [ -n "${COMMON_UI_BUILD_FOLDER:-}" ]; then
  if ! runUIWatchdog "$COMMON_UI_BUILD_FOLDER"; then
    hasIUNotBeenBuilt=1
    echo -e "\n${COLOR_YELLOW}The UI has not been built within the specified time. \
Trying to build it again...${COLOR_NORMAL}" >&2
  else
    mkdir -p "$UI_BUILD_FOLDER" 2>/dev/null
    rm -rf "$UI_BUILD_FOLDER/*"
    cp -rf "$COMMON_UI_BUILD_FOLDER/*" "$UI_BUILD_FOLDER"
  fi
fi
if [ -z "${COMMON_UI_BUILD_FOLDER:-}" ] || [ $hasIUNotBeenBuilt == 1 ]; then
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

node "$ROOT/node_modules/.bin/electron-builder" \
  "build" "--$targetPlatform" \
  "--config" "$ELECTRON_BUILDER_CONFIG_FILE_PATH"
unpackedFolder=$(ls -d "$DIST_FOLDER"/*/ | grep $targetPlatform | head -1)
artifactName="$productName-$version-$ARCH-$targetPlatform"
appFilePath="$DIST_FOLDER/$artifactName"

if ! [ -d "$unpackedFolder" ]; then
  echo -e "\n${COLOR_RED}The electron app has not been built successful${COLOR_NORMAL}" >&2
  exit 1
fi

if [ $buildLinux == 1 ]; then
  fullAppFilePath="$appFilePath.AppImage"

  mv -f "$DIST_FOLDER/*$targetPlatform*.AppImage" "$fullAppFilePath"

  node "$ROOT/scripts/node/make-app-update-yml.js" "$unpackedFolder"
fi
if [ $buildWin == 1 ]; then
  fullAppFilePath="$appFilePath.exe"

  mv -f "$DIST_FOLDER/*$targetPlatform*.exe" "$fullAppFilePath"
  mv -f ./dist/*$targetPlatform*.exe.blockmap "$fullAppFilePath.blockmap"

  node "$ROOT/scripts/node/make-app-update-yml.js" "$unpackedFolder"
fi
if [ $buildMac == 1 ]; then
  fullAppFilePath="$appFilePath.zip"

  rm -rf "$DIST_FOLDER/$targetPlatform/Bitfinex Report.app.zip"
  rm -rf "$fullAppFilePath"

  7z a -tzip "$fullAppFilePath" -r "$unpackedFolder" -mmt | grep -v "Compressing"
  node "$ROOT/scripts/node/generate-zipand-blockmap.js"
fi

rm -rf "$unpackedFolder"

if ! [ -d "$COMMON_DIST_FOLDER" ]; then
  chmod -R a+xwr "$DIST_FOLDER" 2>/dev/null

  echo -e "\n${COLOR_GREEN}The electron app has been built successful${COLOR_NORMAL}"
  exit 0
fi

rm -rf "$COMMON_DIST_FOLDER/*$targetPlatform*"
mv -f "$DIST_FOLDER/*" "$COMMON_DIST_FOLDER"

chmod -R a+xwr "$COMMON_DIST_FOLDER" 2>/dev/null

echo -e "\n${COLOR_GREEN}The electron app has been built successful${COLOR_NORMAL}"
exit 0
