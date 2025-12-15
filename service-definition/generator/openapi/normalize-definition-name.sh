set -e

OPENAPI_DIR=${1:-./openapi}

for filename in $(find ${OPENAPI_DIR}/modules -name *.openapi.yaml); do
    # normalize the generated file path to be relative to the modules dir
    # like all paths in manually added files (./modules/domain/...)
    # because the OPENAPI_DIR can be vary depends on the parameter
    openapi_path=$(echo $filename | sed "s/${OPENAPI_DIR//\//\\/}//" | sed -E "s/^(\/modules|modules)/\.\/modules/")

    if grep -Fxq "${openapi_path}" ${OPENAPI_DIR}/manually-added-files.txt
    then
        echo "$openapi_path (Skipped, manually added file)"
        continue
    fi

    echo $openapi_path

    # remove "_" for nested message
    # example: UpdateRequest_Payload -> UpdateRequestPayload
    sed -E -i 's/((modules|common|tools)\..+)_(.+)/\1\3/g' $filename

    for package in $(grep -rEho "(modules|common|tools)\..+\w+" $filename | sort -u); do
        # using the last package name as the definition name prefix
        # example: a.v1.public.Update -> publicUpdate
        definition_name=$(echo $package | awk '{n=split($1,arr,"."); print arr[n-1]arr[n]}')
        sed -i s/$package/$definition_name/g $filename
    done;
done;
