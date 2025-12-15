import { Context, Next } from "hono";
import { logger } from "@packages/pkg/logger";

/**
 * Hono middleware for logging HTTP requests and responses
 */
export const loggerMiddleware = async (c: Context, next: Next) => {
  const start = Date.now();
  const { method, url } = c.req;

  // Log incoming request
  logger.info("Incoming request", {
    method,
    url,
    userAgent: c.req.header("user-agent"),
  });

  await next();

  // Log response
  const duration = Date.now() - start;
  const status = c.res.status;

  logger.info("Request completed", {
    method,
    url,
    status,
    duration: `${duration}ms`,
  });
};
