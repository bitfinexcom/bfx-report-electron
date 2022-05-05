#!/bin/bash

set -euox pipefail

SCRIPTPATH="$(cd -- "$(dirname "$0")" >/dev/null 2>&1; pwd -P)"
ROOT="$(dirname "$SCRIPTPATH")"

COLOR_RED="\033[31m"
COLOR_GREEN="\033[32m"
COLOR_YELLOW="\033[33m"
COLOR_BLUE="\033[34m"
COLOR_NORMAL="\033[39m"

BFX_API_URL="https://api-pub.bitfinex.com"
STAGING_BFX_API_URL="https://api.staging.bitfinex.com"

LAST_COMMIT_FILE_NAME="lastCommit.json"

WORKER_FOLDER="$ROOT/bfx-reports-framework"
UI_FOLDER="$ROOT/bfx-report-ui"
EXPRESS_FOLDER="$UI_FOLDER/bfx-report-express"
UI_BUILD_FOLDER="${UI_BUILD_FOLDER:-"$UI_FOLDER/build"}"

source "$ROOT/scripts/helpers/make-last-commit-json.sh"
source "$ROOT/scripts/helpers/run-ui-watchdog.sh"
source "$ROOT/scripts/helpers/escape-string.sh"
source "$ROOT/scripts/helpers/install-backend-deps.sh"

programname=$0
targetPlatform=""
countReqOSs=0
bfxApiUrl="$BFX_API_URL"

buildLinux=0
buildWin=0
buildMac=0
isBfxApiStaging=0
isDevEnv=0

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

if ! runUIWatchdog "$UI_BUILD_FOLDER"; then
  echo -e "\n${COLOR_YELLOW}The UI has not been built within the specified time. \
Trying to build it again...${COLOR_NORMAL}"

  "$ROOT/scripts/build-ui.sh"

  if ! runUIWatchdog "$UI_BUILD_FOLDER" 10; then
    echo -e "\n${COLOR_RED}The UI has not been built within the specified time!${COLOR_NORMAL}" >&2
    exit 1
  fi
fi

echo -e "\n${COLOR_GREEN}The UI has been built successful${COLOR_NORMAL}"
