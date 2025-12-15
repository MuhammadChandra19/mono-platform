# Core Service

Core authentication and authorization service for the mono-platform. Built with Hono framework and implements identity management, authentication, and permission-based access control.

## Architecture

### Project Structure

```
apps/core-service/
├── src/
│   ├── bootstrap/          # Application initialization
│   │   ├── config.ts       # Configuration management
│   │   ├── container.ts    # Dependency injection container
│   │   └── index.ts
│   ├── data/
│   │   ├── repositories/   # Data access layer
│   │   │   ├── permission/ # Permission repository with tests & mocks
│   │   │   └── user/       # User repository with tests & mocks
│   │   └── schemas/        # Database schemas & transformations
│   │       ├── permission/
│   │       ├── user/
│   │       └── userPermission/
│   ├── services/           # Service layer (API implementations)
│   │   ├── identity/       # Identity service with tests
│   │   └── permission/     # Permission service
│   ├── usecases/           # Business logic layer
│   │   ├── __mocks__/      # Mocks for usecases
│   │   ├── __tests__/      # Usecase tests
│   │   ├── identity.ts     # Identity usecase
│   │   └── permission.ts   # Permission usecase
│   ├── utils/              # Utilities
│   │   ├── helpers/        # Helper functions
│   │   ├── middleware/     # Hono middleware
│   │   └── types/          # Type definitions
│   ├── docs/               # API documentation
│   ├── dev.ts              # Development server
│   └── index.ts            # Lambda entry point
├── drizzle/                # Database migrations
├── public/docs/            # Generated Swagger UI
├── coverage/               # Test coverage reports
└── dist/                   # Build output
```

## Features

### Authentication & Identity Management

- User registration with password hashing (bcrypt)
- JWT-based authentication with access & refresh tokens
- Role-based access control (RBAC)
- User profile management (CRUD operations)
- Email-based user lookup

### Permission Management

- Fine-grained permission system (`action:resourceName` format)
- User-permission assignment
- Permission revocation
- Dynamic permission creation
- Transactional permission operations

### Security

- Token-based authentication via Authorization header or cookies
- Scope validation for API endpoints
- ServiceResult pattern for consistent error handling
- Database error mapping

## Technology Stack

- **Framework**: [Hono](https://hono.dev/) - Fast web framework
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Testing**: Jest with table-driven test approach
- **Documentation**: Swagger UI
- **Deployment**: AWS Lambda (esbuild)

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- AWS CLI (for deployment)

### Installation

```bash
# Install dependencies (from monorepo root)
pnpm install

# Or from this directory
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your-secret-key-min-32-chars
ACCESS_TOKEN_COOKIE_KEY=access_token
```

### Database Setup

```bash
# Generate migrations from schema
npm run db:generate

# Apply migrations
npm run db:migrate

# Push schema directly (dev only)
npm run db:push

# Open Drizzle Studio
npm run db:studio
```

## Development

### Running the Development Server

```bash
npm run dev
```

Server will start on `http://localhost:3000`

### API Documentation

Swagger UI is available at `http://localhost:3000/docs` when running the dev server.

### Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

#### Test Structure

The project uses a comprehensive testing strategy:

- **Repository Tests**: Data layer with mock databases
- **Usecase Tests**: Business logic with table-driven tests (Go-style)
- **Service Tests**: API implementation with mocked dependencies
- **Mocks**: Centralized mock factories in `__mocks__` directories

Example table-driven test:

```typescript
const testCases = [
  {
    name: "should handle success case",
    input: { userId: 1 },
    expected: { ok: true, data: mockData },
  },
  {
    name: "should handle error case",
    input: { userId: 999 },
    expected: { ok: false, error: mockError },
  },
];

test.each(testCases)("$name", async ({ input, expected }) => {
  // Test implementation
});
```

## Deployment

### Build for AWS Lambda

```bash
# Build, zip, and deploy to AWS Lambda
npm run deploy

# Or step by step:
npm run build    # Bundle with esbuild
npm run zip      # Create lambda.zip
npm run update   # Update AWS Lambda function
```

## API Endpoints

### Identity Service

- `POST /v1/identity/register` - Register new user
  - Returns access & refresh tokens

### Permission Service

- `POST /v1/permission/assign` - Assign permissions to user
  - Requires `write:permission` scope
- `GET /v1/permission/user/:user_id` - Get user permissions
  - Requires `read:permission` scope
- `POST /v1/permission/revoke` - Revoke user permissions
  - Requires `delete:permission` scope

## Architecture Patterns

### ServiceResult Pattern

All services return a consistent `ServiceResult<T>` type:

```typescript
type ServiceResult<T> =
  | { ok: true; data: T; status?: StatusCode }
  | {
      ok: false;
      error: { code: string; message: string; details?: any };
      status: StatusCode;
    };
```

### Dependency Injection

Services are instantiated through a container pattern in `bootstrap/container.ts`:

```typescript
const container = {
  db: database,
  userRepo: userRepository({ db: database }),
  identityUsecase: identityUsecase({ userRepo }),
  identityService: identityService({ identityUsecase, maker }),
};
```

### Permission Format

Permissions follow the format: `${action}:${resourceName}`

Examples:

- `read:user`
- `write:permission`
- `delete:post`
- `create:comment`

## Contributing

### Adding New Repositories

1. Create repository in `src/data/repositories/`
2. Add mock in `__mocks__/index.ts`
3. Add tests in `__tests__/index.test.ts`
4. Follow existing repository patterns (Result type, error handling)

### Adding New Usecases

1. Create usecase in `src/usecases/`
2. Add mock in `__mocks__/`
3. Add table-driven tests in `__tests__/`
4. Use transaction wrapper for multi-step operations

### Adding New Services

1. Implement API interface from `@packages/openapigen`
2. Add tests with mocked dependencies
3. Use helper functions: `toServiceSuccess`, `toServiceError`, `toServiceException`
4. Register in dependency container

## Code Quality

- **Linting**: Follow TypeScript strict mode
- **Testing**: Maintain >80% coverage
- **Mocking**: Use centralized mock factories
- **Error Handling**: Use Result pattern, never throw in business logic
- **Type Safety**: Leverage TypeScript for compile-time safety

## License

Proprietary - All rights reserved
