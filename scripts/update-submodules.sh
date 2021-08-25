#!/bin/bash

set -x

function updateSubmodules {
  local branch=master

  if [ $# -ge 1 ]
  then
    branch=$1
  else
    exit 1
  fi

  git submodule sync --recursive
  git config url."https://github.com/".insteadOf git@github.com:
  git pull --recurse-submodules

  if [ $branch != "master" ]
  then
    git submodule foreach --recursive git checkout $branch
    git submodule foreach --recursive git fetch origin
    git submodule foreach --recursive git reset --hard origin/$branch
  fi

  git config --unset url."https://github.com/".insteadOf
}

if [ $# -ge 2 ] && [ $1 == "-b" ] && [ $2 != "" ]
then
  updateSubmodules $2
fi
