#!/bin/bash

ROOT=$PWD

if [ ! -z "$1" ]; then
  ROOT=$1
fi

appFilePath="$ROOT/app"
logFilePath="$ROOT/error.log"

output=$("$appFilePath" 2>&1)
mess=$(echo "$output" | grep -v WARNING)

if [ "$mess" != "" ]; then
  echo $mess>>"$logFilePath"
  ./msg-box.sh "$mess"
fi
