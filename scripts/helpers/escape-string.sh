#!/bin/bash

function escapeString {
  local COLOR_RED=${COLOR_RED:-"\033[31m"}
  local COLOR_NORMAL=${COLOR_NORMAL:-"\033[39m"}

  if [ -z "${1:-}" ]; then
    echo -e "\n${COLOR_RED}Requires the first argument of '${FUNCNAME[0]}' fn as escaping string!${COLOR_NORMAL}" >&2
    exit 1
  fi

  local escapedStr=$(echo $1 \
    | sed 's/\//\\\//g' \
    | sed 's/\+/\\\+/g' \
    | sed 's/\./\\\./g')

  echo "$escapedStr"
}
