#!/bin/bash

ROOT=$PWD

if [ ! -z "$1" ]; then
  ROOT=$1
fi

desktopFilePath="Bitfinex Report.desktop"
bakDesktopFilePath="$desktopFilePath-bak"
iconPath="$ROOT/resources/app/build/icon.png"
logFilePath="$ROOT/error.log"

{
  cp "$ROOT/$desktopFilePath" "$ROOT/$bakDesktopFilePath" \
  && sed -i -e "s,Icon=.*,Icon=$iconPath,g" "$ROOT/$desktopFilePath" \
  && rm -f "$ROOT/$bakDesktopFilePath"
} || {
  echo "Error setting icon path">>"$logFilePath"
}

cd "$ROOT"
./app 2>>"$logFilePath"
