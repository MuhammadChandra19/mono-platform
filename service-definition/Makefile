generate-openapi:
	@chmod 777 generator/openapi/openapi-v3-generator.sh
	@generator/openapi/openapi-v3-generator.sh

	@chmod 777 generator/openapi/openapi-v3-merge.sh
	@generator/openapi/openapi-v3-merge.sh

	@chmod 777 generator/openapi/normalize-definition-name.sh
	@generator/openapi/normalize-definition-name.sh

generate-openapigen:
	@chmod 777 generator/typescript/generate-spec.sh
	@generator/typescript/generate-spec.sh

	@chmod 777 generator/typescript/move-shared-files.sh
	@generator/typescript/move-shared-files.sh
generate-docs:
	@node generator/swagger-ui/generate-docs.js
