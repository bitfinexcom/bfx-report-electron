#!/bin/bash

function getConfValue {
  local COLOR_RED=${COLOR_RED:-"\033[31m"}
  local COLOR_NORMAL=${COLOR_NORMAL:-"\033[39m"}

  if [ -z "${1:-}" ]; then
    echo -e "\n${COLOR_RED}Requires the first argument of '${FUNCNAME[0]}' fn as dependency name!${COLOR_NORMAL}" >&2
    exit 1
  fi
  if [ -z "${2:-}" ]; then
    echo -e "\n${COLOR_RED}Requires the first argument of '${FUNCNAME[0]}' fn as path to folder where package.json!${COLOR_NORMAL}" >&2
    exit 1
  fi

  local dep="$1"
  local path="$2"
  local fileName="${3:-"package.json"}"

  local version=$(cat "$path/$fileName" \
    | grep $dep \
    | head -1 \
    | awk -F: '{ print $2($3 ? ":" : "")$3($4 ? ":" : "")$4 }' \
    | sed "s/[\'\",]//g" \
    | sed 's/#.*$//' \
    | tr -d '[[:space:]]')

  echo "$version"
}
