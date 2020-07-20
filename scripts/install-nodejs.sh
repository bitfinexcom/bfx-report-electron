#!/bin/bash

set -x

version=""

if [ $# -ge 1 ]
then
  version=$1
else
  exit 1
fi

# this package is used for snapcraft and we should not clear apt list - to avoid apt-get update during snap build
curl -L https://nodejs.org/dist/v$version/node-v$version-linux-x64.tar.gz | tar xz -C /usr/local --strip-components=1 && \
unlink /usr/local/CHANGELOG.md && unlink /usr/local/LICENSE && unlink /usr/local/README.md && \
# https://github.com/npm/npm/issues/4531
npm config set unsafe-perm true
