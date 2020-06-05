#!/bin/bash

set -x

ROOT="$PWD"

function getConfValue {
  local dep=""
  local path=$ROOT
  local value=""

  if [ $# -ge 1 ]
  then
    dep=$1
  else
    exit 1
  fi

  if [ $# -ge 2 ]
  then
    path=$2
  else
    exit 1
  fi

  version=$(cat $path/package.json \
    | grep \"$dep\" \
    | head -1 \
    | awk -F: '{ print $2($3 ? ":" : "")$3($4 ? ":" : "")$4 }' \
    | sed 's/[",]//g' \
    | sed 's/#.*$//' \
    | tr -d '[[:space:]]')

  echo $version
}
