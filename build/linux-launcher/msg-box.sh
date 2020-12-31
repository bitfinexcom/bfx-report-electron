#!/bin/bash

mess=""

if [ $# -ge 1 ]
then
  mess=$1
else
  exit 0
fi

zenity \
  --error \
  --width=600\
  --ok-label="OK" \
  --title="Error of Bitfinex Report" \
  --text="$mess" \
  2>/dev/null
