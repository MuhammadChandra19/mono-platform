#!/bin/bash

# TODO: Remove this file

set -e

# copy shared files from any random directory
sample_file=$(find openapigen/src/modules -type f -name '*runtime.ts' -print -quit)

if [ -z "$sample_file" ]; then
    echo "Runtime file not found";
    exit 1;
fi

sample_dir=$(dirname $sample_file)

echo "Copying shared files from $sample_dir ..."
mkdir -p openapigen/src/shared
cp ${sample_dir}/runtime.ts openapigen/src/shared


# replace all import path into the shared file
echo "Replace all import path into the shared file ..."

if [[ "$(uname)" == "Darwin" ]]; then
    separator=" "
fi


# For models (unchanged - your original command)
find openapigen/src/modules -name '*.ts' | xargs sed -i${separator}'' "s/from ['\"]\.\.\/\(base\|runtime\)['\"]/from '..\/..\/..\/..\/shared\/\1'/g";
find openapigen/src/modules -name 'index.ts' | xargs sed -i${separator}'' "s/from ['\"]\.\/\(base\|runtime\)['\"]/from '..\/..\/..\/shared\/\1'/g";

find openapigen/src/modules -name '*.ts' | xargs sed -i${separator}'' "s/from ['\"]\.\.\/\.\.\/\(base\|runtime\)['\"]/from '..\/..\/..\/..\/..\/shared\/\1'/g";

echo "Deleting old shared files from modules directory...."
find openapigen/src/modules -type f -name '*runtime.ts' -exec rm -f {} \;

echo "Moving generated files to ../packages/openapigen/src..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TARGET_DIR="$PROJECT_ROOT/../packages/openapigen/src"

mkdir -p "$TARGET_DIR"
cp -r openapigen/src/* "$TARGET_DIR/"

echo "Cleaning up temporary openapigen/src directory..."
rm -rf openapigen/src

echo "Done."
