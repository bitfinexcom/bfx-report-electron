#!/bin/bash

function makeLastCommitJson {
  local COLOR_RED=${COLOR_RED:-"\033[31m"}
  local COLOR_NORMAL=${COLOR_NORMAL:-"\033[39m"}

  if [ -z "${1:-}" ]; then
    echo -e "\n${COLOR_RED}Requires the first argument of '${FUNCNAME[0]}' as file path!${COLOR_NORMAL}" >&2
    exit 1
  fi

  local filePath="$1"

  TZ=UTC git show \
    --quiet \
    --date='format-local:%Y-%m-%dT%H:%M:%SZ' \
    --format="{\"hash\":\"%H\",\"date\":\"%cd\"}" \
    > "$filePath"
}
