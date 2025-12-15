#!/bin/sh

echo "Generating merged openapi spec:"


rm -rf openapigen/src/*

for module_path in openapi/modules/*/; do
  module=$(basename ${module_path})

  for version_path in openapi/modules/${module}/*/; do
    version=$(basename ${version_path})

    client_path="src/modules/$module/$version"

    mkdir -p openapigen/$client_path

    openapi_path=$module/$version
    if [ -z $(find openapi/modules/$openapi_path -maxdepth 1 -name *.openapi.yaml -print -quit) ]; then
      continue;
    fi

    echo  $openapi_path $module
    ./generator/typescript/merge-spec.sh $openapi_path $module
    java -jar openapi-generator-cli.jar generate -g typescript-fetch \
        -i openapigen/$client_path/merged.openapi.yaml \
        -o openapigen/$client_path \
        --additional-properties=useSingleRequestParameter=true,withInterfaces=true,withServerHandlers=true,stringEnums=true,withValidate=true

    err=$?
    if [ $err -ne 0 ]; then
          exit 1
    fi

    rm -rf openapigen/$client_path/git_push.sh \
      openapigen/$client_path/.npmignore \
      openapigen/$client_path/.gitignore \
      openapigen/$client_path/.openapi-generator \
      openapigen/$client_path/.openapi-generator-ignore \
      openapigen/$client_path/merged.openapi.yaml

    echo "$client_path is successfully generated."
  done
done


echo "Done."