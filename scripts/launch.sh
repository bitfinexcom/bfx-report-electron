#!/bin/bash

set -euo pipefail

SCRIPTPATH="${SCRIPTPATH:-"$(cd -- "$(dirname "$0")" >/dev/null 2>&1; pwd -P)"}"
ROOT="${ROOT:-"$(dirname "$SCRIPTPATH")"}"
LAUNCH_CURRDIR="$PWD"
DOT_ENV_FILE_PATH="$ROOT/.env"

set -a
[ -f "$DOT_ENV_FILE_PATH" ] && . "$DOT_ENV_FILE_PATH"
set +a

COLOR_RED=${COLOR_RED:-"\033[31m"}
COLOR_GREEN=${COLOR_GREEN:-"\033[32m"}
COLOR_YELLOW=${COLOR_YELLOW:-"\033[33m"}
COLOR_BLUE=${COLOR_BLUE:-"\033[34m"}
COLOR_NORMAL=${COLOR_NORMAL:-"\033[39m"}

programname=$0

buildLinux=0
buildWin=0
buildMac=0
syncRepo=0
isBfxApiStaging=${IS_BFX_API_STAGING:-0}
isDevEnv=${IS_DEV_ENV:-0}

function usage {
  echo -e "\
\n${COLOR_GREEN}Usage: $programname [options] [-h]${COLOR_BLUE}
\nOptions:
  -a    Build all releases
  -l    Build Linux release
  -w    Build Windows release
  -m    Build Mac release
  -r    Sync all repositories
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

while getopts "alwmrsdh" opt; do
  case "${opt}" in
    a)
      buildLinux=1
      buildWin=1
      buildMac=1
      ;;
    l) buildLinux=1;;
    w) buildWin=1;;
    m) buildMac=1;;
    r) syncRepo=1;;
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

if [ $buildLinux != 1 ] \
  && [ $buildWin != 1 ] \
  && [ $buildMac != 1 ]
then
  echo -e "\n${COLOR_RED}A release for at least one OS may be required!${COLOR_NORMAL}" >&2
  exit 1
fi

if [ $isBfxApiStaging == 1 ]; then
  export IS_BFX_API_STAGING=1
fi
if [ $isDevEnv == 1 ]; then
  export IS_DEV_ENV=1
fi

composeCommonFlags="\
  --build \
  --force-recreate \
  --remove-orphans
"
uiBuilderServices="ui-builder"
linuxBuilderServices=""
winBuilderService=""
macBuilderService=""

if [ $buildLinux == 1 ]; then
  linuxBuilderServices="linux-builder"
fi
if [ $buildWin == 1 ]; then
  winBuilderService="win-builder"
fi
if [ $buildMac == 1 ]; then
  macBuilderService="mac-builder"
fi

if [ $syncRepo == 1 ]; then
  echo -e "\n${COLOR_BLUE}Syncing all repositories...${COLOR_NORMAL}"
  source "$ROOT/scripts/sync-repo.sh" "-a"
fi

docker-compose up $composeCommonFlags $uiBuilderServices \
  $linuxBuilderServices $winBuilderService $macBuilderService

cd "$LAUNCH_CURRDIR"
