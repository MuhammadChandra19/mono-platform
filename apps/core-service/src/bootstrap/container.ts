import repositories, { Repository } from "@/data/repositories";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import appConfig, { AppConfig } from "./config";
import {
  createPostgresConnection,
  createTransactionWrapper,
  TransactionWrapper,
} from "@packages/pkg/postgres";
import usecases, { Usecase } from "@/usecases";
import services, { Service } from "@/services";
import {
  Authenticator,
  createAuthenticator,
  createJWTMaker,
  Maker,
} from "@packages/pkg/oauth";
import { IdentityServiceApiRouterHandler, PermissionServiceApiRouterHandler } from "@packages/openapigen";
import { Hono } from "hono";
import { setupSwaggerDocs } from "@/utils/swagger";
import { loggerMiddleware } from "@/utils/middleware/logger";

/**
 * Dependency injection container that manages application-wide dependencies and services.
 * Implements the Singleton pattern to ensure only one instance exists throughout the application lifecycle.
 *
 * @remarks
 * This container initializes and manages:
 * - Application configuration
 * - Database client connections
 * - Repository layer
 * - Use case layer
 * - Service layer
 * - Authentication maker
 * - HTTP server (Hono)
 * - Route handlers
 *
 * @example
 * ```typescript
 * const container = Container.getInstance();
 * const app = container.hono;
 * ```
 */
export class Container {
  private static instance: Container;
  private appConfig: AppConfig;
  private dbClient: NodePgDatabase;
  private repositories: Repository;
  private usecases: Usecase;
  private services: Service;
  private authMaker: Maker;
  private authenticator: Authenticator;
  private transactionWrapper: TransactionWrapper;

  public hono: Hono;

  private constructor() {
    this.hono = new Hono();
    this.appConfig = appConfig;

    // Register logger middleware
    this.hono.use("*", loggerMiddleware);

    this.authMaker = createJWTMaker({
      secretKey: this.appConfig.oatuh.secretKey,
    });
    this.authenticator = createAuthenticator({
      maker: this.authMaker,
      accessTokenCookieKey: "",
    });
    this.dbClient = createPostgresConnection(appConfig.database);
    this.transactionWrapper = createTransactionWrapper(this.dbClient);

    this.repositories = repositories({ db: this.dbClient });
    this.usecases = usecases({
      repositories: this.repositories,
      transactionWrapper: this.transactionWrapper,
    });
    this.services = services({
      usecases: this.usecases,
      authMaker: this.authMaker,
      authenticator: this.authenticator,
    });

    this.registerRouteHandler();
  }

  private registerRouteHandler() {
    new IdentityServiceApiRouterHandler(this.hono, this.services.identity, []);
    new PermissionServiceApiRouterHandler(this.hono, this.services.permission, []);

    // Serve Swagger UI static files
    setupSwaggerDocs(this.hono);
  }

  /**
   * Gets the singleton instance of the Container.
   * If an instance doesn't exist, it creates one and returns it.
   *
   * @returns {Container} The singleton Container instance
   *
   * @example
   * ```typescript
   * const container = Container.getInstance();
   * ```
   */
  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }

    return Container.instance;
  }
}
