#!/bin/bash

ROOT=$PWD

if [ ! -z "$1" ]; then
  ROOT=$1
fi

cd $ROOT

desktopFilePath="Bitfinex Report.desktop"
bakDesktopFilePath="$desktopFilePath-bak"
iconPath="$ROOT/resources/app/build/icon.png"

cp "$desktopFilePath" "$bakDesktopFilePath"
sed -i -e "s,Icon=.*,Icon=$iconPath,g" "$desktopFilePath"
rm -f "$bakDesktopFilePath"

./app 2>>$ROOT/error.log
