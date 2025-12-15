#!/bin/sh

set -e

OPENAPI_DIR=${1:-./openapi}

echo "Merge generated openapi files:"

for module_path in ${OPENAPI_DIR}/modules/*/; do
    # Skip if no modules found
    [ -d "$module_path" ] || continue
    
    module=$(basename ${module_path})

    for version_path in ${OPENAPI_DIR}/modules/${module}/*/; do
        # Skip if no versions found
        [ -d "$version_path" ] || continue
        
        version=$(basename ${version_path})

        openapi_desc=""
        merged_file="${version_path}/${module}-${version}.openapi.yaml"
        
        # Find all .openapi.yaml files recursively in this version directory
        # Exclude the merged file itself from the list
        openapi_files=$(find ${version_path} -name '*.openapi.yaml' -type f ! -name "${module}-${version}.openapi.yaml")
        
        # Skip if no files to merge
        if [ -z "$openapi_files" ]; then
            continue
        fi
        
        touch $merged_file 

        for filename in $openapi_files; do
            # normalize the generated file path to be relative to the modules dir
            openapi_path=$(echo $filename | sed "s/${OPENAPI_DIR//\//\\/}//" | sed -E "s/^(\/modules|modules)/\.\/modules/")

            # Skip if it's a manually added file
            if [ -f "${OPENAPI_DIR}/manually-added-files.txt" ] && grep -Fxq "${openapi_path}" ${OPENAPI_DIR}/manually-added-files.txt 2>/dev/null
            then
                echo "$openapi_path (skipped, manually added file)"
                continue
            fi

            echo "$openapi_path (merge to $module $version)"

            # merge the file into the merged file
            yq ea --inplace '. as $item ireduce ({}; . * $item )' $merged_file $filename

            # merge the file title to be the description
            openapi_desc="$openapi_desc, $(yq '.info.title' $filename)"

            rm $filename
        done

        # empty merged file (no openapi specs generated for this version)
        if [ ! -s "$merged_file" ]; then
            rm $merged_file
            continue
        fi

        openapi_desc=$(echo ${openapi_desc} | sed 's/^, //')
        export openapi_desc
        export openapi_title="$(echo ${module} | awk '{print toupper(substr($0,1,1)) substr($0,2);}') ${version}"

        # fill the title with the module and version name
        # fill the description with merged titles
        # remove unnecessary openapi tags
        yq e -i '.info.title = strenv(openapi_title) | .info.description = strenv(openapi_desc) | del(.tags)' $merged_file

        # backfill the gnostic comments as credits to their tools
        yq e -i '... comments=""' $merged_file
        yq e -i '. head_comment="Generated with gnostic protoc-gen-openapi"' $merged_file
    done
done

# Clean up empty directories
for module_path in ${OPENAPI_DIR}/modules/*/; do
    [ -d "$module_path" ] || continue

    for version_path in ${OPENAPI_DIR}/modules/$(basename ${module_path})/*/; do
        [ -d "$version_path" ] || continue
        
        # Remove empty subdirectories in version path
        find ${version_path} -type d -empty -delete 2>/dev/null || true
    done
done

# Run prettier only if there are yaml files
if find ${OPENAPI_DIR} -name "*.yaml" -o -name "*.yml" 2>/dev/null | grep -q .; then
    npx prettier@^3.3.2 ${OPENAPI_DIR} --write --ignore-path
else
    echo "No OpenAPI files found to format"
fi

