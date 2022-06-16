#!/bin/bash

function changeDirOwnershipToCurrUser {
  local path="${1:-}"
  local defaultUID="${CURRENT_UID:-"1000:1000"}"
  local currUID="${2:-"$defaultUID"}"

  if [ -n "$path" ] && [ -d "$path" ]; then
    chown -R "$currUID" "$path" || [[ $? == 1 ]]
  fi
}
