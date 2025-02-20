#!/bin/bash

set -euo pipefail

SCRIPTPATH="${SCRIPTPATH:-"$(cd -- "$(dirname "$0")" >/dev/null 2>&1; pwd -P)"}"
ROOT="${ROOT:-"$(dirname "$SCRIPTPATH")"}"
UI_CURRDIR="$PWD"
DOT_ENV_FILE_PATH="$ROOT/.env"

set -a
[ -f "$DOT_ENV_FILE_PATH" ] && . "$DOT_ENV_FILE_PATH"
set +a

COLOR_RED=${COLOR_RED:-"\033[31m"}
COLOR_GREEN=${COLOR_GREEN:-"\033[32m"}
COLOR_YELLOW=${COLOR_YELLOW:-"\033[33m"}
COLOR_BLUE=${COLOR_BLUE:-"\033[34m"}
COLOR_NORMAL=${COLOR_NORMAL:-"\033[39m"}

BFX_HOME_URL="${BFX_HOME_URL:-"https://bitfinex.com"}"
BFX_KEY_URL="${BFX_KEY_URL:-"https://setting.bitfinex.com/api"}"
STAGING_BFX_HOME_URL="${STAGING_BFX_HOME_URL:-"https://staging.bitfinex.com"}"
STAGING_BFX_KEY_URL="${STAGING_BFX_KEY_URL:-"https://bfx-ui-settings.staging.bitfinex.com/api"}"
BACKEND_ADDRESS="${BACKEND_ADDRESS:-"localhost:34343"}"

UI_FOLDER="${UI_FOLDER:-"$ROOT/bfx-report-ui"}"
UI_BUILD_FOLDER="$UI_FOLDER/build"
COMMON_UI_BUILD_FOLDER="${COMMON_UI_BUILD_FOLDER:-}"
UI_FONTS_FOLDER="$UI_FOLDER/src/styles/fonts"
UI_TRIGGER_ELECTRON_LOAD_SCRIPT_NAME="triggerElectronLoad.js"
UI_TRIGGER_ELECTRON_LOAD_SCRIPT="$UI_FOLDER/src/utils/$UI_TRIGGER_ELECTRON_LOAD_SCRIPT_NAME"
UI_CONFIGS_FILE="$UI_FOLDER/src/config.js"
UI_READY_FILE_NAME="READY"

source "$ROOT/scripts/helpers/check-node-modules-dir.sh"
source "$ROOT/scripts/helpers/escape-string.sh"
source "$ROOT/scripts/helpers/change-dir-ownership-to-curr-user.sh"

programname=$0
bfxHomeUrl="$BFX_HOME_URL"
bfxKeyUrl="$BFX_KEY_URL"

isBfxApiStaging=${IS_BFX_API_STAGING:-0}
isDevEnv=${IS_DEV_ENV:-0}

export CI_ENVIRONMENT_NAME="production"
export SKIP_PREFLIGHT_CHECK=true

function usage {
  echo -e "\
\n${COLOR_GREEN}Usage: $programname [options] [-h]${COLOR_BLUE}
\nOptions:
  -s    Use staging BFX API
  -d    Set development environment
  -h    Display help\
${COLOR_NORMAL}" 1>&2
}

while getopts "sdh" opt; do
  case "${opt}" in
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
  bfxHomeUrl="$STAGING_BFX_HOME_URL"
  bfxKeyUrl="$STAGING_BFX_KEY_URL"
fi
if [ $isDevEnv == 1 ]; then
  echo -e "\n${COLOR_YELLOW}UI developer environment is turned on!${COLOR_NORMAL}"
  export CI_ENVIRONMENT_NAME="development"
fi

rm -rf "$UI_BUILD_FOLDER/"*

if [ -d "$COMMON_UI_BUILD_FOLDER" ]; then
  rm -rf "$COMMON_UI_BUILD_FOLDER/"*
fi

echo -e "\n${COLOR_BLUE}Setting UI configs${COLOR_NORMAL}"

escapedBfxHomeUrl=$(escapeString $bfxHomeUrl)
escapedBfxKeyUrl=$(escapeString $bfxKeyUrl)
sed -i".bak" -E -e \
  "s/HOME_URL: .*,/HOME_URL: \'$escapedBfxHomeUrl\',/g" \
  "$UI_CONFIGS_FILE"; rm -f "$UI_CONFIGS_FILE.bak"
sed -i".bak" -E -e \
  "s/API_URL: .*,/API_URL: \'http:\/\/${BACKEND_ADDRESS}\/api\',/g" \
  "$UI_CONFIGS_FILE"; rm -f "$UI_CONFIGS_FILE.bak"
sed -i".bak" -E -e \
  "s/WS_ADDRESS: .*,/WS_ADDRESS: \'ws:\/\/${BACKEND_ADDRESS}\/ws\',/g" \
  "$UI_CONFIGS_FILE"; rm -f "$UI_CONFIGS_FILE.bak"
sed -i".bak" -E -e \
  "s/KEY_URL: .*,/KEY_URL: \'$escapedBfxKeyUrl\/api\',/g" \
  "$UI_CONFIGS_FILE"; rm -f "$UI_CONFIGS_FILE.bak"

sed -i".bak" -E -e \
  "s/localExport: false/localExport: true/g" \
  "$UI_CONFIGS_FILE"; rm -f "$UI_CONFIGS_FILE.bak"
sed -i".bak" -E -e \
  "s/showAuthPage: false/showAuthPage: true/g" \
  "$UI_CONFIGS_FILE"; rm -f "$UI_CONFIGS_FILE.bak"
sed -i".bak" -E -e \
  "s/showFrameworkMode: false/showFrameworkMode: true/g" \
  "$UI_CONFIGS_FILE"; rm -f "$UI_CONFIGS_FILE.bak"
sed -i".bak" -E -e \
  "s/hostedFrameworkMode: true/hostedFrameworkMode: false/g" \
  "$UI_CONFIGS_FILE"; rm -f "$UI_CONFIGS_FILE.bak"
sed -i".bak" -E -e \
  "s/isElectronApp: false/isElectronApp: true/g" \
  "$UI_CONFIGS_FILE"; rm -f "$UI_CONFIGS_FILE.bak"

cd "$UI_FOLDER"
echo -e "\n${COLOR_BLUE}Installing the UI deps...${COLOR_NORMAL}"
rm -rf ./node_modules
npm ci --no-audit --progress=false
checkNodeModulesDir "$UI_FOLDER"
npm ls --depth=0 --only=prod 1<&-

echo -e "\n${COLOR_BLUE}UI building...${COLOR_NORMAL}"
mv -f "$ROOT/.eslintrc" "$ROOT/off-eslintrc" || [[ $? == 1 ]]
npm run build || (
    echo -e "\n${COLOR_RED}The UI has not been built successful${COLOR_NORMAL}" >&2 &&
    exit 1
  )
mv -f "$ROOT/off-eslintrc" "$ROOT/.eslintrc" || [[ $? == 1 ]]

if ! [ -s "$UI_BUILD_FOLDER/index.html" ]; then
  echo -e "\n${COLOR_RED}The UI has not been built successful${COLOR_NORMAL}" >&2
  exit 1
fi

cp -f "$UI_TRIGGER_ELECTRON_LOAD_SCRIPT" "$UI_BUILD_FOLDER/$UI_TRIGGER_ELECTRON_LOAD_SCRIPT_NAME"
cp -rf "$UI_FONTS_FOLDER" "$UI_BUILD_FOLDER"

if ! [ -d "$COMMON_UI_BUILD_FOLDER" ]; then
  chmod -fR a+xwr "$UI_BUILD_FOLDER" || [[ $? == 1 ]]
  touch "$UI_BUILD_FOLDER/$UI_READY_FILE_NAME"

  cd "$UI_CURRDIR"
  exit 0
fi

mv -f "$UI_BUILD_FOLDER/"* "$COMMON_UI_BUILD_FOLDER"
chmod -fR a+xwr "$COMMON_UI_BUILD_FOLDER" || [[ $? == 1 ]]
touch "$COMMON_UI_BUILD_FOLDER/$UI_READY_FILE_NAME"

cd "$UI_CURRDIR"
