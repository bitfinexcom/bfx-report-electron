#!/bin/bash

set -x

ROOT="$PWD"
branch=master
dbDriver=better-sqlite
lastCommitFileName=lastCommit.json

source $ROOT/scripts/get-conf-value.sh
source $ROOT/scripts/escape-string.sh
source $ROOT/scripts/update-submodules.sh

programname=$0
isDevEnv=0
isNotSkippedReiDeps=1
targetPlatform=0
isSkippedUIBuild=0

if [ "$BRANCH" != "" ]
then
  branch=$BRANCH
fi
if [ "$DB_DRIVER" != "" ]
then
  dbDriver=$DB_DRIVER
fi

function usage {
  echo "Usage: $programname [-d] | [-h]"
  echo "  -d      turn on developer environment"
  echo "  -h      display help"
  exit 1
}

while [ "$1" != "" ]; do
  case $1 in
    -d | --dev )    isDevEnv=1
                    ;;
    -s | --skip-rei-deps )    isNotSkippedReiDeps=0
                    ;;
    -p | --target-platform )  targetPlatform=$2; shift
                    ;;
    -u | --skip-ui-build )    isSkippedUIBuild=1
                    ;;
    -h | --help )   usage
                    exit
                    ;;
    * )             usage
                    exit 1
  esac
  shift
done

if [ $isDevEnv != 0 ]; then
  echo "Developer environment is turned on"
fi

frontendFolder="$ROOT/bfx-report-ui"
expressFolder="$frontendFolder/bfx-report-express"
backendFolder="$ROOT/bfx-reports-framework"

linuxLauncherFolder="$ROOT/build/linux-launcher"
uiBuildFolder=/ui-build
uiReadyFile="$uiBuildFolder/READY"

mkdir $ROOT/dist 2>/dev/null
chmod a+xwr $ROOT/dist 2>/dev/null

updateSubmodules $branch

TZ=UTC git show \
  --quiet \
  --date='format-local:%Y-%m-%dT%H:%M:%SZ' \
  --format="{\"hash\":\"%H\",\"date\":\"%cd\"}" \
  > $ROOT/$lastCommitFileName

if [ $isSkippedUIBuild == 0 ]
then
  devFlag=""

  if [ $isDevEnv == 0 ]; then
    devFlag="-d"
  fi

  bash $ROOT/scripts/build-ui.sh $devFlag
fi

cp $expressFolder/config/default.json.example \
  $expressFolder/config/default.json

cd $backendFolder

cp config/schedule.json.example config/schedule.json
cp config/common.json.example config/common.json
cp config/service.report.json.example config/service.report.json
cp config/facs/grc.config.json.example config/facs/grc.config.json
sed -i -e \
  "s/\"syncMode\": false/\"syncMode\": true/g" \
  $backendFolder/config/service.report.json
sed -i -e \
  "s/\"dbDriver\": \".*\"/\"dbDriver\": \"$dbDriver\"/g" \
  $backendFolder/config/service.report.json

if [ $isDevEnv != 0 ]; then
  sed -i -e \
    "s/\"restUrl\": \".*\"/\"restUrl\": \"https:\/\/test.bitfinex.com\"/g" \
    $backendFolder/config/service.report.json
fi

bfxReportDep=$(getConfValue "bfx-report" $backendFolder)
escapedBfxReportDep=$(escapeString $bfxReportDep)

if [ $branch == "master" ]
then
  sed -i -e \
    "s/\"bfx-report\": \".*\"/\"bfx-report\": \"$escapedBfxReportDep\"/g" \
    $backendFolder/package.json
else
  sed -i -e \
    "s/\"bfx-report\": \".*\"/\"bfx-report\": \"$escapedBfxReportDep\#$branch\"/g" \
    $backendFolder/package.json
fi

cd $ROOT

if [ $isNotSkippedReiDeps != 0 ]; then
  if [ $targetPlatform != 0 ]
  then
    bash $ROOT/scripts/reinstall-deps.sh $targetPlatform

    if [ $isSkippedUIBuild != 0 ]
    then
      # Watch the UI build has been completed, in seconds
      # if not successful exit with an error
      requiredWatchTime=$((60 * 30))
      watchTime=$requiredWatchTime
      interval=0.5

      while !(test -f "$uiReadyFile"); do
        isExpired=$(echo "$watchTime <= 0" | bc)

        if [ $isExpired == 1 ]; then
          echo "Exit with error due to the UI has not been built in $requiredWatchTime seconds"

          exit 1
        fi

        sleep $interval
        watchTime=$(echo "$watchTime - $interval" | bc)
      done
    fi

    mkdir $frontendFolder/build 2>/dev/null
    rm -rf $frontendFolder/build/*
    cp -avr $uiBuildFolder/* $frontendFolder/build
    chmod -R a+xwr $frontendFolder/build
    ./node_modules/.bin/electron-builder build --$targetPlatform
    chmod -R a+xwr ./dist

    productName=$(getConfValue "productName" $ROOT)
    version=$(getConfValue "version" $ROOT)
    versionEnding=""

    if [ $branch != 'master' ]
    then
      versionEnding="-$branch"
    fi

    arch="x64"

    unpackedFolder=$(ls -d $ROOT/dist/*/ | grep $targetPlatform | head -1)
    artifactName="$productName-$version$versionEnding-$arch-$targetPlatform"
    zipFile="$ROOT/dist/$artifactName.zip"

    if ! [ -d $unpackedFolder ]; then
      exit 1
    fi

    cd $unpackedFolder

    if [ $targetPlatform == "linux" ]
    then
      # Build C executable launcher file
      make -C $linuxLauncherFolder

      cp -f \
        "$linuxLauncherFolder/launcher" \
        "Bitfinex Report"
      cp -f \
        "$linuxLauncherFolder/launcher.sh" \
        "launcher.sh"
      cp -f \
        "$linuxLauncherFolder/msg-box.sh" \
        "msg-box.sh"

      chmod +x "Bitfinex Report"
      chmod +x "launcher.sh"
      chmod +x "msg-box.sh"
    fi

    7z a -tzip $zipFile . -mmt | grep -v "Compressing"
    cd $ROOT

    rm -rf /dist/*$targetPlatform*
    mv -f ./dist/*$targetPlatform*.zip /dist

    if [ $targetPlatform == "win" ]
    then
      appFile="/dist/$artifactName.exe"
      blockmapFile="$appFile.blockmap"
      latestYmlFile="/dist/latest.yml"
      mv -f ./dist/*$targetPlatform*.exe "$appFile"
      mv -f ./dist/*$targetPlatform*.exe.blockmap "$blockmapFile"
      mv -f ./dist/latest.yml "$latestYmlFile"
    fi
    if [ $targetPlatform == "linux" ]
    then
      appFile="/dist/$artifactName.AppImage"
      latestYmlFile="/dist/latest-linux.yml"
      mv -f ./dist/*$targetPlatform*.AppImage "$appFile"
      mv -f ./dist/latest-linux.yml "$latestYmlFile"
    fi

    chmod -R a+xwr /dist 2>/dev/null

    exit 0
  else
    bash $ROOT/scripts/reinstall-deps.sh
  fi
fi
