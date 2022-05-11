#!/bin/bash

set -euox pipefail

SCRIPTPATH="${SCRIPTPATH:-"$(cd -- "$(dirname "$0")" >/dev/null 2>&1; pwd -P)"}"
ROOT="${ROOT:-"$(dirname "$SCRIPTPATH")"}"
UI_CURRDIR="$PWD"

COLOR_RED=${COLOR_RED:-"\033[31m"}
COLOR_GREEN=${COLOR_GREEN:-"\033[32m"}
COLOR_YELLOW=${COLOR_YELLOW:-"\033[33m"}
COLOR_BLUE=${COLOR_BLUE:-"\033[34m"}
COLOR_NORMAL=${COLOR_NORMAL:-"\033[39m"}

BFX_API_URL="${BFX_API_URL:-"https://api-pub.bitfinex.com"}"
STAGING_BFX_API_URL="${STAGING_BFX_API_URL:-"https://api.staging.bitfinex.com"}"
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

programname=$0
bfxApiUrl="$BFX_API_URL"

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
  bfxApiUrl="$STAGING_BFX_API_URL"
fi
if [ $isDevEnv == 1 ]; then
  echo -e "\n${COLOR_YELLOW}UI developer environment is turned on!${COLOR_NORMAL}"
  export CI_ENVIRONMENT_NAME="development"
fi

rm -rf "$UI_BUILD_FOLDER/*"

echo -e "\n${COLOR_BLUE}Setting UI configs${COLOR_NORMAL}"

escapedBfxApiUrl=$(escapeString $bfxApiUrl)
sed -i -e \
  "s/HOME_URL: .*,/HOME_URL: \'$escapedBfxApiUrl\',/g" \
  "$UI_CONFIGS_FILE"
sed -i -e \
  "s/API_URL: .*,/API_URL: \'http:\/\/${BACKEND_ADDRESS}\/api\',/g" \
  "$UI_CONFIGS_FILE"
sed -i -e \
  "s/WS_ADDRESS: .*,/WS_ADDRESS: \'ws:\/\/${BACKEND_ADDRESS}\/ws\',/g" \
  "$UI_CONFIGS_FILE"
sed -i -e \
  "s/KEY_URL: .*,/KEY_URL: \'$escapedBfxApiUrl\/api\',/g" \
  "$UI_CONFIGS_FILE"

sed -i -e \
  "s/localExport: false/localExport: true/g" \
  "$UI_CONFIGS_FILE"
sed -i -e \
  "s/showAuthPage: false/showAuthPage: true/g" \
  "$UI_CONFIGS_FILE"
sed -i -e \
  "s/showFrameworkMode: false/showFrameworkMode: true/g" \
  "$UI_CONFIGS_FILE"
sed -i -e \
  "s/hostedFrameworkMode: true/hostedFrameworkMode: false/g" \
  "$UI_CONFIGS_FILE"
sed -i -e \
  "s/isElectronApp: false/isElectronApp: true/g" \
  "$UI_CONFIGS_FILE"

cd "$UI_FOLDER"
echo -e "\n${COLOR_BLUE}Installing the UI deps...${COLOR_NORMAL}"
rm -rf ./node_modules
npm i --no-audit
checkNodeModulesDir "$UI_FOLDER"
npm ls --depth=0 --only=prod 1<&-

echo -e "\n${COLOR_BLUE}UI building...${COLOR_NORMAL}"
mv -f "$ROOT/.eslintrc" "$ROOT/off-eslintrc"
npm run build
mv -f "$ROOT/off-eslintrc" "$ROOT/.eslintrc"

if ! [ -s "$UI_BUILD_FOLDER/index.html" ]; then
  echo -e "\n${COLOR_RED}The UI has not been built successful${COLOR_NORMAL}" >&2
  exit 1
fi

cp -f "$UI_TRIGGER_ELECTRON_LOAD_SCRIPT" "$UI_BUILD_FOLDER/$UI_TRIGGER_ELECTRON_LOAD_SCRIPT_NAME"
cp -rf "$UI_FONTS_FOLDER" "$UI_BUILD_FOLDER"
chmod -R a+xwr "$UI_BUILD_FOLDER" 2>/dev/null

if [ -n "${COMMON_UI_BUILD_FOLDER:-}" ]; then
  cp -rf "$UI_BUILD_FOLDER/*" "$COMMON_UI_BUILD_FOLDER"
  touch "$COMMON_UI_BUILD_FOLDER/$UI_READY_FILE_NAME"
fi

touch "$UI_BUILD_FOLDER/$UI_READY_FILE_NAME"

cd "$UI_CURRDIR"
