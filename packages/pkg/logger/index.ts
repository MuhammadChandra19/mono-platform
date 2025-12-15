import winston from "winston";

const { combine, timestamp, json, errors } = winston.format;

/**
 * Creates a Winston logger instance with JSON formatting
 * @param options - Logger configuration options
 * @param options.level - Log level (default: 'info')
 * @param options.service - Service name to include in logs
 * @returns Configured Winston logger instance
 */
export const createLogger = (options?: {
  level?: string;
  service?: string;
}) => {
  const logLevel = options?.level || process.env.LOG_LEVEL || "info";
  const serviceName = options?.service || process.env.SERVICE_NAME || "app";

  return winston.createLogger({
    level: logLevel,
    format: combine(
      errors({ stack: true }),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      json(),
    ),
    defaultMeta: { service: serviceName },
    transports: [
      new winston.transports.Console({
        format: combine(
          errors({ stack: true }),
          timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
          json(),
        ),
      }),
    ],
  });
};

/**
 * Default logger instance
 */
export const logger = createLogger();

export default logger;
