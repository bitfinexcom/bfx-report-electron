#!/bin/bash

ROOT=$PWD

if [ ! -z "$1" ]; then
  ROOT=$1
fi

appFilePath="$ROOT/app"
desktopFilePath="$ROOT/Bitfinex Report.desktop"
iconPath="$ROOT/resources/app/build/icon.png"

bakDesktopFilePath="$desktopFilePath-bak"
logFilePath="$ROOT/error.log"

{
  cp "$desktopFilePath" "$bakDesktopFilePath" \
  && sed -i -e "s,Exec=.*,Exec=\"$ROOT/launcher.sh\" \"$ROOT\",g" "$desktopFilePath" \
  && sed -i -e "s,Icon=.*,Icon=$iconPath,g" "$desktopFilePath" \
  && rm -f "$bakDesktopFilePath"
} || {
  echo "Error setting icon path">>"$logFilePath"
}

appFilePath 2>>"$logFilePath"
