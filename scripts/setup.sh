#!/bin/bash

set -euo pipefail

SCRIPTPATH="${SCRIPTPATH:-"$(cd -- "$(dirname "$0")" >/dev/null 2>&1; pwd -P)"}"
ROOT="${ROOT:-"$(dirname "$SCRIPTPATH")"}"
SETUP_CURRDIR="$PWD"
DOT_ENV_FILE_PATH="$ROOT/.env"

set -a
[ -f "$DOT_ENV_FILE_PATH" ] && . "$DOT_ENV_FILE_PATH"
set +a

COLOR_RED=${COLOR_RED:-"\033[31m"}
COLOR_GREEN=${COLOR_GREEN:-"\033[32m"}
COLOR_YELLOW=${COLOR_YELLOW:-"\033[33m"}
COLOR_BLUE=${COLOR_BLUE:-"\033[34m"}
COLOR_NORMAL=${COLOR_NORMAL:-"\033[39m"}

BFX_API_URL="https://api-pub.bitfinex.com"
STAGING_BFX_API_URL="https://api.staging.bitfinex.com"

LAST_COMMIT_FILE_NAME="lastCommit.json"
ELECTRON_ENV_FILE_NAME="electronEnv.json"

WORKER_FOLDER="$ROOT/bfx-reports-framework"
UI_FOLDER="$ROOT/bfx-report-ui"
EXPRESS_FOLDER="$UI_FOLDER/bfx-report-express"
UI_BUILD_FOLDER="$UI_FOLDER/build"

source "$ROOT/scripts/helpers/make-last-commit-json.sh"
source "$ROOT/scripts/helpers/run-ui-watchdog.sh"
source "$ROOT/scripts/helpers/escape-string.sh"
source "$ROOT/scripts/helpers/install-backend-deps.sh"

programname=$0
bfxApiUrl="$BFX_API_URL"

syncRepo=0
syncSubModules=0
isBfxApiStaging=${IS_BFX_API_STAGING:-0}
isDevEnv=${IS_DEV_ENV:-0}

function usage {
  echo -e "\
\n${COLOR_GREEN}Usage: $programname [options] [-h]${COLOR_BLUE}
\nOptions:
  -r    Sync all repositories
  -o    Sync only sub-modules
  -s    Use staging BFX API
  -d    Set development environment
  -h    Display help\
${COLOR_NORMAL}" 1>&2
}

while getopts "rosdh" opt; do
  case "${opt}" in
    r) syncRepo=1;;
    o) syncSubModules=1;;
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

if [ $isBfxApiStaging == 1 ]; then
  bfxApiUrl="$STAGING_BFX_API_URL"
fi
if [ $isDevEnv == 1 ]; then
  echo -e "\n${COLOR_YELLOW}Developer environment is turned on!${COLOR_NORMAL}"

  echo "{\"NODE_ENV\":\"development\"}" > "$ROOT/$ELECTRON_ENV_FILE_NAME"
fi

if [ $syncRepo == 1 ]; then
  echo -e "\n${COLOR_BLUE}Syncing all repositories...${COLOR_NORMAL}"
  source "$ROOT/scripts/sync-repo.sh" "-a"
fi
if [ $syncSubModules == 1 ]; then
  echo -e "\n${COLOR_BLUE}Syncing only all sub-modules...${COLOR_NORMAL}"
  source "$ROOT/scripts/sync-repo.sh" "-wue"
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

installBackendDeps # TODO:

echo -e "\n${COLOR_BLUE}Watching for UI build...${COLOR_NORMAL}"

"$ROOT/scripts/build-ui.sh"

if ! runUIWatchdog "$UI_BUILD_FOLDER" 10; then
  echo -e "\n${COLOR_RED}The UI has not been built within the specified time!${COLOR_NORMAL}" >&2
  exit 1
fi

echo -e "\n${COLOR_GREEN}The UI has been built successful${COLOR_NORMAL}"
echo -e "\n${COLOR_GREEN}The electron app has been set up successful${COLOR_NORMAL}"

cd "$SETUP_CURRDIR"
