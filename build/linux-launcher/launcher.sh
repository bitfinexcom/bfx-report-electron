#!/bin/bash

ROOT=$PWD

if [ ! -z "$1" ]; then
  ROOT=$1
fi

appFilePath="$ROOT/app"
logFilePath="$ROOT/error.log"

output=$("$appFilePath" 2>&1)
mess=$(echo "$output" | grep -v WARNING | grep -v electron\/issues\/23506 | grep -v Cannot\ download\ differentially | grep -v GtkDialog mapped without a transient parent)

if [ "$mess" != "" ]; then
  echo $mess>>"$logFilePath"
  ./msg-box.sh "$mess"
fi
