#!/bin/bash

function checkNodeModulesDir {
  local COLOR_RED=${COLOR_RED:-"\033[31m"}
  local COLOR_NORMAL=${COLOR_NORMAL:-"\033[39m"}

  if [ -z "${1:-}" ]; then
    echo -e "\n${COLOR_RED}Requires the first argument of '${FUNCNAME[0]}' fn as path!${COLOR_NORMAL}" >&2
    exit 1
  fi

  local path="${1:-"."}"

  if ! [ -d "$path/node_modules" ]; then
    echo -e "\n${COLOR_RED}NPM dependencies have not been installed \
in the '$path' root dir!${COLOR_NORMAL}" >&2
    exit 1
  fi
}
