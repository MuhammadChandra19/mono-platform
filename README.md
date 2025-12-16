# mono-platform

A TypeScript monorepo implementing a layered serverless architecture for building scalable backend services. This project demonstrates best practices for structuring serverless applications with clear separation of concerns between orchestration, business logic, and data access layers.

## Architecture Overview

The platform follows a layered architecture pattern:

```
AWS Lambda → Hono App → Container (DI) → Service → Usecase → Repository → Data Source
```

**Key Principles:**
- **Services** orchestrate HTTP requests, handle authentication, and format responses
- **Usecases** contain business logic and manage transaction boundaries
- **Repositories** abstract all data sources (databases, caches, external services)
- **Result types** propagate errors through layers: `DatabaseResult → Result → ServiceResult`

## Project Structure

```
mono-platform/
├── apps/
│   └── core-service/              # Main application service
│       ├── src/
│       │   ├── index.ts           # Lambda entry point (hono/aws-lambda)
│       │   ├── dev.ts             # Local development server (Bun)
│       │   ├── bootstrap/         # DI container and app initialization
│       │   ├── services/          # HTTP orchestration layer
│       │   ├── usecases/          # Business logic layer
│       │   ├── data/
│       │   │   ├── repositories/  # Data access layer
│       │   │   └── schemas/       # Drizzle ORM schemas
│       │   ├── auth/              # JWT authentication
│       │   ├── api/               # OpenAPI-generated route handlers
│       │   └── utils/             # Shared utilities and types
│       └── public/docs/           # Swagger UI documentation
│
├── packages/
│   ├── openapigen/                # Generated TypeScript clients from OpenAPI
│   │   └── src/
│   │       ├── modules/           # Generated service APIs and models
│   │       └── shared/            # Shared runtime utilities
│   │
│   └── pkg/                       # Shared utilities package
│       ├── postgres/              # Database connection and transactions
│       ├── oauth/                 # JWT maker and authenticator
│       └── logger/                # Winston logger configuration
│
├── service-definition/            # API contract definitions
│   ├── proto/                     # Protocol Buffer definitions with OpenAPI annotations
│   ├── openapi/                   # Generated OpenAPI YAML specifications
│   └── generator/                 # Code generation scripts
│
├── docker-compose.yml             # Local PostgreSQL database
└── pnpm-workspace.yaml            # Workspace configuration
```

## Prerequisites

- Node.js >= 21
- pnpm 9.4.0+
- Bun (for local development)
- Docker (for local PostgreSQL)
- Protocol Buffer Compiler (`protoc`) - for API generation
- Java Runtime - for OpenAPI Generator

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start Local Database

```bash
docker-compose up -d
```

This starts PostgreSQL on port 5433 with:
- Database: `mono_platform`
- User: `postgres`
- Password: `password`

### 3. Run Database Migrations

```bash
cd apps/core-service
pnpm db:push
```

### 4. Start Development Server

```bash
cd apps/core-service
pnpm dev
```

The server runs at `http://localhost:3000` with Swagger docs at `http://localhost:3000/docs`.

## Packages

### @packages/openapigen

Auto-generated TypeScript clients and server handlers from OpenAPI specifications. The Hono router handlers are generated via OpenAPI Generator from Protocol Buffer definitions.

**Usage:**
```typescript
import {
  IdentityServiceApiRouterHandler,
  AuthServiceApiRouterHandler,
  PermissionServiceApiRouterHandler,
} from "@packages/openapigen";

// Register handlers with Hono app
new IdentityServiceApiRouterHandler(app, identityService, []);
```

### @packages/pkg

Shared utilities used across applications:

- **postgres/** - Database connection (`createPostgresConnection`) and transaction wrapper (`createTransactionWrapper`)
- **oauth/** - JWT token creation (`createJWTMaker`) and authentication (`createAuthenticator`)
- **logger/** - Winston logger configuration

**Usage:**
```typescript
import { createPostgresConnection, createTransactionWrapper } from "@packages/pkg/postgres";
import { createJWTMaker, createAuthenticator } from "@packages/pkg/oauth";
```

## API Generation Workflow

The platform uses a contract-first approach where APIs are defined in Protocol Buffers with OpenAPI annotations:

```bash
cd service-definition

# 1. Generate OpenAPI specs from proto files
make generate-openapi

# 2. Generate TypeScript clients and server handlers
make generate-openapigen

# 3. Generate Swagger UI documentation
make generate-docs
```

See `service-definition/README.md` for detailed documentation on the generation workflow.

## Scripts

### Root Level

```bash
pnpm test              # Run all tests
pnpm test:watch        # Run tests in watch mode
pnpm test:coverage     # Run tests with coverage
```

### Core Service

```bash
cd apps/core-service

pnpm dev               # Start development server (Bun)
pnpm build             # Build for Lambda (esbuild)
pnpm deploy            # Build, zip, and deploy to Lambda

pnpm test              # Run tests
pnpm test:watch        # Run tests in watch mode
pnpm test:coverage     # Run tests with coverage

pnpm db:generate       # Generate Drizzle migrations
pnpm db:migrate        # Run migrations
pnpm db:push           # Push schema to database
pnpm db:studio         # Open Drizzle Studio
```

## Deployment

The core-service is designed for AWS Lambda deployment:

```bash
cd apps/core-service
pnpm deploy
```

This runs:
1. `esbuild` - Bundles the application for Node 20
2. `zip` - Creates `lambda.zip`
3. `aws lambda update-function-code` - Deploys to Lambda

**Note:** For production deployments, consider using [SST (sst.dev)](https://sst.dev) which handles bundling, VPC configuration, and infrastructure as code.

## Technology Stack

| Component | Technology |
|-----------|------------|
| Runtime | AWS Lambda / Bun (local) |
| Framework | Hono |
| ORM | Drizzle ORM |
| Database | PostgreSQL |
| Authentication | JWT (custom implementation) |
| API Spec | OpenAPI (generated from Protocol Buffers) |
| Language | TypeScript |
| Package Manager | pnpm |
| Bundler | esbuild |

## Architecture Layers

### Service Layer
Services act as HTTP orchestrators. They handle authentication checks, coordinate usecases, and format responses. Services do not contain business logic.

### Usecase Layer
Usecases contain the actual business logic. They manage transaction boundaries using `transactionWrapper` and call repositories for data access. Each usecase method represents a single business operation.

### Repository Layer
Repositories are the data access layer. They abstract all data sources including databases, caches, and external services. Repositories return `DatabaseResult<T>` types for consistent error handling.

## Testing

```bash
# Run all tests
pnpm test

# Run tests for a specific package
pnpm -C apps/core-service test
pnpm -C packages/pkg test
```

## Author

Muhammad Chandra Zulfikar

## License

ISC

---
