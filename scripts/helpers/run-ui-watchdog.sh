#!/bin/bash

function runUIWatchdog {
  local COLOR_RED="${COLOR_RED:-"\033[31m"}"
  local COLOR_NORMAL="${COLOR_NORMAL:-"\033[39m"}"

  if [ -z "${1:-}" ]; then
    echo -e "\n${COLOR_RED}Requires the first argument of '${FUNCNAME[0]}' fn as UI build folder!${COLOR_NORMAL}" >&2
    exit 1
  fi

  local uiBuildFolder="$1"
  local requiredWatchTime="${2:-$((60 * 10))}"

  local uiReadyFile="$uiBuildFolder/READY"
  local watchTime=$requiredWatchTime
  local interval=0.5

  # Watch the UI build has been completed, in seconds
  # if not successful return 'false'
  while !(test -f "$uiReadyFile"); do
    local isExpired=$(echo "$watchTime <= 0" | bc)

    if [ $isExpired == 1 ]; then
      false
      return
    fi

    sleep $interval
    watchTime=$(echo "$watchTime - $interval" | bc)
  done

  true
}
