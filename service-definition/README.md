# Service Definition

This directory contains API service definitions using Protocol Buffers (protobuf) and OpenAPI specifications for the mono-platform project. It serves as a central source of truth for all service contracts and generates client/server code for multiple targets.

## 📁 Directory Structure

```
service-definition/
├── Makefile                      # Build commands for generation
├── openapi-generator-cli.jar    # OpenAPI code generator
├── proto/                        # Protocol Buffer definitions
│   ├── common/                   # Common/shared proto definitions
│   ├── core/                     # Core annotations and utilities
│   ├── google/                   # Google API annotations
│   ├── modules/                  # Service modules
│   │   └── authentication/       # Authentication domain services
│   │       └── v1/              # Version 1 API
│   │           ├── auth.proto
│   │           ├── identity.proto
│   │           ├── permission.proto
│   │           └── shared/      # Shared types for authentication
│   └── openapiv3/               # OpenAPI v3 annotations
├── openapi/                      # Generated OpenAPI YAML files
│   └── modules/
│       └── authentication/
│           └── v1/
└── generator/                    # Code generation scripts
    ├── openapi/                  # OpenAPI generation scripts
    │   ├── openapi-v3-generator.sh
    │   ├── openapi-v3-merge.sh
    │   └── normalize-definition-name.sh
    ├── typescript/               # TypeScript client generation
    │   ├── generate-spec.sh
    │   └── move-shared-files.sh
    └── swagger-ui/              # Swagger UI documentation
        └── generate-docs.js
```

## 🎯 Overview

The service definition workflow follows these steps:

1. **Define Services** - Write API contracts in `.proto` files with OpenAPI v3 annotations
2. **Generate OpenAPI** - Convert protobuf definitions to OpenAPI YAML specifications
3. **Generate Clients** - Create TypeScript clients from OpenAPI specs
4. **Generate Docs** - Build interactive API documentation with Swagger UI

## 🚀 Quick Start

### Prerequisites

- Protocol Buffer Compiler (`protoc`)
- Java Runtime (for OpenAPI Generator)
- Node.js (for documentation generation)
- Bash shell

### Generate All

```bash
# Generate OpenAPI specs from proto files
make generate-openapi

# Generate TypeScript clients
make generate-openapigen

# Generate API documentation
make generate-docs
```

## 📝 Service Modules

### Authentication Module (`modules/authentication/v1`)

The authentication domain provides identity, authorization, and permission management services:

- **Identity Service** (`identity.proto`)
  - User registration
  - User profile management
- **Auth Service** (`auth.proto`)
  - User authentication
  - Token management
- **Permission Service** (`permission.proto`)
  - Role-based access control
  - Permission assignment
  - User permission queries

## 🔧 Make Commands

### `make generate-openapi`

Generates OpenAPI YAML specifications from Protocol Buffer definitions.

**Steps:**

1. Runs `openapi-v3-generator.sh` - Converts `.proto` files to `.openapi.yaml`
2. Runs `openapi-v3-merge.sh` - Merges multiple specs per module/version
3. Runs `normalize-definition-name.sh` - Normalizes schema names

**Output:** `openapi/modules/{module}/{version}/*.openapi.yaml`

### `make generate-openapigen`

Generates TypeScript client code from OpenAPI specifications.

**Steps:**

1. Runs `generate-spec.sh` - Processes each module/version
2. Uses OpenAPI Generator to create TypeScript clients
3. Runs `move-shared-files.sh` - Organizes shared runtime files

**Output:** `../packages/openapigen/src/modules/{module}/{version}/`

**Generated Files:**

- `apis/` - Service API implementations
- `models/` - Type definitions
- `client.ts` - Client configuration
- `router.ts` - Server-side handlers

### `make generate-docs`

Generates interactive Swagger UI documentation for all API services.

**Steps:**

1. Scans OpenAPI YAML files
2. Copies files to core-service public directory
3. Generates swagger-initializer.js with API catalog

**Output:** `../apps/core-service/public/docs/`

**Access:** Navigate to `http://localhost:3000/docs` when core-service is running

## 📐 Protocol Buffer Annotations

Services use OpenAPI v3 annotations to define rich API specifications:

```protobuf
service IdentityService {
  rpc Register(RegisterRequest) returns (RegisterResponse) {
    option (google.api.http) = {
      post: "/v1/identity/register",
      body: "*"
    };
    option (openapi.v3.operation) = {
      summary: "Register New User"
      description: "Register a new user account."
    };
  }
}

message RegisterRequest {
  string fullname = 1 [
    (openapi.v3.property) = {
      description: "User full name"
      example: { yaml: "John F. Doe" }
    }
  ];
}
```

## 🔄 Development Workflow

### Adding a New Service

1. **Define the Service**

   ```bash
   # Create proto file
   touch proto/modules/{module}/v1/{service}.proto
   ```

2. **Write Service Definition**
   - Define service methods with gRPC/HTTP annotations
   - Define request/response messages
   - Add OpenAPI documentation

3. **Generate Code**

   ```bash
   make generate-openapi
   make generate-openapigen
   ```

4. **Implement Service**
   - Import generated types from `@packages/openapigen`
   - Implement service interface in your application

### Updating an Existing Service

1. Modify the `.proto` file
2. Run generators:
   ```bash
   make generate-openapi
   make generate-openapigen
   ```
3. Update implementation to match new interface
4. Run tests to verify compatibility

## 🏗️ Code Generation Details

### OpenAPI Generation

The `openapi-v3-generator.sh` script:

- Processes all `.proto` files in the proto directory
- Extracts OpenAPI v3 annotations
- Generates individual `.openapi.yaml` files
- Tracks manually added vs generated files

### TypeScript Client Generation

The `generate-spec.sh` script:

- Iterates through each module and version
- Merges multiple OpenAPI specs per domain
- Uses `openapi-generator-cli.jar` with `typescript-fetch` generator
- Configuration:
  - `useSingleRequestParameter=true` - Single params object
  - `withInterfaces=true` - Generate TypeScript interfaces
  - `withServerHandlers=true` - Generate server router code
  - `stringEnums=true` - Use string literal types for enums
  - `withValidate=true` - Include validation

### Documentation Generation

The `generate-docs.js` script:

- Recursively scans OpenAPI directory
- Copies YAML files to docs directory
- Generates Swagger UI initializer with multi-spec support
- Creates index.html with embedded Swagger UI

## 📦 Output Packages

Generated code is organized into the monorepo structure:

```
packages/openapigen/
└── src/
    ├── modules/
    │   └── authentication/
    │       └── v1/
    │           ├── apis/           # Service APIs
    │           ├── models/         # Data models
    │           └── client.ts       # API client
    └── shared/
        └── runtime.ts             # Shared utilities
```

Import in your application:

```typescript
import {
  IdentityServiceApi,
  RegisterRequest,
  RegisterResponse,
} from "@packages/openapigen";
```

## 🔍 Troubleshooting

### Permission Denied on Scripts

```bash
chmod +x generator/openapi/*.sh
chmod +x generator/typescript/*.sh
```

### OpenAPI Generator Not Found

Ensure `openapi-generator-cli.jar` is present in the root directory.

### Proto Compiler Issues

Install protoc:

```bash
# macOS
brew install protobuf

# Ubuntu/Debian
apt-get install protobuf-compiler
```

### Generated Code Not Found

Make sure to run generation commands in order:

1. `make generate-openapi`
2. `make generate-openapigen`

## 🎨 Best Practices

1. **Versioning**
   - Always version your APIs (v1, v2, etc.)
   - Keep backward compatibility within versions
   - Create new versions for breaking changes

2. **Documentation**
   - Add detailed descriptions to all services and methods
   - Include examples in OpenAPI annotations
   - Document error responses

3. **Naming Conventions**
   - Use PascalCase for messages and services
   - Use snake_case for fields
   - Use descriptive names (avoid abbreviations)

4. **Organization**
   - Group related services in modules
   - Keep shared types in `shared/` directories
   - Maintain clean separation of concerns

## 📚 Additional Resources

- [Protocol Buffers Documentation](https://developers.google.com/protocol-buffers)
- [OpenAPI Specification](https://swagger.io/specification/)
- [OpenAPI Generator](https://openapi-generator.tech/)
- [gRPC HTTP Transcoding](https://cloud.google.com/endpoints/docs/grpc/transcoding)

## 🤝 Contributing

When adding or modifying service definitions:

1. Update the `.proto` files with proper annotations
2. Run all generators to ensure consistency
3. Update tests to match new contracts
4. Document breaking changes
5. Update this README if workflow changes

## 📄 License

Part of the mono-platform project.
