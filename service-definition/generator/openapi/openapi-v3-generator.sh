#!/bin/bash

PROTO_DIR=${1:-./proto}
OUTPUT_DIR=${2:-./openapi}

rm -rf $OUTPUT_DIR

# delete all files that not listed in manually-added-files.txt, because we will regenerate it
find ${OUTPUT_DIR} -iname '*.openapi.yaml' | sort > ${OUTPUT_DIR}/all-files-sorted.txt

# normalize the generated file path to be relative to the products dir
# like all paths in manually added files (./products/domain/...)
# because the OUTPUT_DIR can be vary depends on the parameter
sed -i "s/^${OUTPUT_DIR//\//\\/}//" ${OUTPUT_DIR}/all-files-sorted.txt
sed -i -E "s/^(\/modules|modules)/\.\/modules/" ${OUTPUT_DIR}/all-files-sorted.txt

# sort ${OUTPUT_DIR}/manually-added-files.txt > ${OUTPUT_DIR}/manually-added-files-sorted.txt

# echo "Manually added files:"
# cat ${OUTPUT_DIR}/manually-added-files-sorted.txt

echo "Cleanup generated files:"
comm -23 ${OUTPUT_DIR}/all-files-sorted.txt ${OUTPUT_DIR}/manually-added-files-sorted.txt > ${OUTPUT_DIR}/cleanup-files.txt
cat ${OUTPUT_DIR}/cleanup-files.txt

# get back the $OUTPUT_DIR prefix path to remove the generated files
sed -i -E "s/\.\/modules/${OUTPUT_DIR//\//\\/}\/modules/" ${OUTPUT_DIR}/cleanup-files.txt
cat ${OUTPUT_DIR}/cleanup-files.txt | xargs rm -f

# remove temporary files
# rm -f ${OUTPUT_DIR}/manually-added-files-sorted.txt
rm -f ${OUTPUT_DIR}/all-files-sorted.txt
rm -f ${OUTPUT_DIR}/cleanup-files.txt

echo "Generating the common schema:"
tmpschema=$OUTPUT_DIR/tmpschema

rm -rf $tmpschema
mkdir -p $tmpschema

protoc common/v1/error.proto -I $PROTO_DIR \
--jsonschema_out=$tmpschema
if [ $? -ne 0 ]; then
    exit 1
fi

yq -P 'del(.title, .$id, .$schema) | {"components": { "schemas": { "ErrorInfo" : .  }  } }' $tmpschema/ErrorInfo.json > $tmpschema/error_info.yaml
yq -P 'del(.title, .$id, .$schema) | .properties.errors.items.$ref = "#/components/schemas/ErrorInfo" | {"components": { "schemas": { "ErrorResponse" : .  }  } }' $tmpschema/ErrorResponse.json > $tmpschema/error_response.yaml

echo "Generating openapi doc for modules:"
for module_path in ${PROTO_DIR}/modules/*/; do
  module=$(basename ${module_path})

	for version_path in ${PROTO_DIR}/modules/${module}/*/; do
		version=$(basename ${version_path})

		echo -n "  ${version_path}..."
		# Find all proto files in the version directory (recursively)
		find ${version_path} -name "*.proto" -type f | while read -r filename ; do
			# skip files without google.api.http annotations
			if ! grep -q "google.api.http" $filename; then
				echo -en "\n  $filename (Skipped - no google.api.http)"
				continue;
			fi;
			
			# skip non-v3 annotations
			if ! grep -q "openapi.v3" $filename; then
				echo -en "\n  $filename (Skipped - no openapi.v3)"
				continue;
			fi;
			
			echo -en "\n  $filename"
			# creating the output path and its dir
			output_path=$(echo $filename | sed "s/^${PROTO_DIR//\//\\/}/${OUTPUT_DIR//\//\\/}/" | sed 's/proto$/openapi.yaml/')
			mkdir -p "${output_path%/*}"

			# output will be on openapi.yaml
			protoc -I ${PROTO_DIR} \
			--openapi_out=enum_type=string,naming=proto,default_response=false,fq_schema_naming=false:. \
			$filename

			err=$?
			if [ $err -ne 0 ]; then
				exit 1
			fi
			# merge the generated openapi spec with the generated common schema
			yq ea '. as $item ireduce ({}; . * $item)' openapi.yaml $tmpschema/*.yaml > $output_path

			# merge the global responses into each path responses
			# only merge if the field / key not exists on the path responses
			yq -i '.components.responses as $res | with(.paths.*.*.responses; . = . *n $res)' $output_path

			rm openapi.yaml

			echo -n "Done."
		
		done || exit 1
		echo ""
	done
done

rm -rf $tmpschema
