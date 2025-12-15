import { handle } from "hono/aws-lambda";
import initApp from "./bootstrap";

const app = initApp();

/**
 * The main handler function that wraps the Express application for serverless deployment.
 * This handler is used to process incoming HTTP requests and route them through the app middleware and routes.
 *
 * @remarks
 * This is typically used as the entry point for serverless functions (e.g., AWS Lambda, Azure Functions)
 * where the `handle` function adapts the Express app to work with the serverless environment.
 *
 * @example
 * ```typescript
 * // In a serverless configuration
 * exports.handler = handler;
 * ```
 */
export const handler = handle(app);
