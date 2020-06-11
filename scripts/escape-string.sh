#!/bin/bash

set -x

function escapeString {
  local str=""

  if [ $# -ge 1 ]
  then
    str=$1
  else
    exit 1
  fi

  escapedStr=$(echo $str \
    | sed 's/\//\\\//g' \
    | sed 's/\+/\\\+/g' \
    | sed 's/\./\\\./g')

  echo $escapedStr
}
