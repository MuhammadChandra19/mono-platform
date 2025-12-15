#!/bin/sh

set -e

DIR=$1
DOMAIN=$2
if [ -z "$DIR" ] || [ -z "$DOMAIN" ]; then
    echo "dir and domain should be provided"
    exit 1;
fi

OUTPUT_PATH="openapigen/src/modules/$DIR/merged.openapi.yaml"
DOMAIN=$(echo ${DOMAIN} | awk '{print toupper(substr($0,1,1)) substr($0,2);}')
export TITLE="$DOMAIN Domain"

rm -rf $OUTPUT_PATH

yq ea '. as $item ireduce ({}; . * $item )' openapi/modules/$DIR/*.openapi.yaml > $OUTPUT_PATH
yq e -i '.info.title = strenv(TITLE) | del(.tags)' $OUTPUT_PATH