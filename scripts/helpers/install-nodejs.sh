#!/bin/bash

set -euo pipefail

COLOR_RED=${COLOR_RED:-"\033[31m"}
COLOR_GREEN=${COLOR_GREEN:-"\033[32m"}
COLOR_BLUE=${COLOR_BLUE:-"\033[34m"}
COLOR_NORMAL=${COLOR_NORMAL:-"\033[39m"}

if [ -z "${1:-}" ]; then
  echo -e "\n${COLOR_RED}Requires the first argument of '${0}' \
script as required NodeJS version!${COLOR_NORMAL}" >&2
  exit 1
fi

version="${1:-"20.18.1"}"

echo -e "\n${COLOR_BLUE}Installing the NodeJS v$version...${COLOR_NORMAL}"

# This package is used for snapcraft and
# we should not clear apt list - to avoid apt-get update during snap build
curl -L https://nodejs.org/dist/v$version/node-v$version-linux-x64.tar.gz | tar xz -C /usr/local --strip-components=1

unlink /usr/local/CHANGELOG.md
unlink /usr/local/LICENSE
unlink /usr/local/README.md

npm cache clear --force 2>/dev/null

echo -e "\n${COLOR_GREEN}The NodeJS has been installed successful${COLOR_NORMAL}"
