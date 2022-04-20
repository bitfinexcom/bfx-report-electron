#!/bin/bash

set -euox pipefail

COLOR_RED="\033[31m"
COLOR_NORMAL="\033[39m"

function makeLastCommitJson {
  if [ -z "${1:-}" ]; then
    echo -e "\n${COLOR_RED}Requires the first argument as file path!${COLOR_NORMAL}" >&2
    exit 1
  fi

  local filePath="$1"

  TZ=UTC git show \
    --quiet \
    --date='format-local:%Y-%m-%dT%H:%M:%SZ' \
    --format="{\"hash\":\"%H\",\"date\":\"%cd\"}" \
    > "$filePath"
}
