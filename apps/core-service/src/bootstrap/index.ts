import { Container } from "./container";

let container: Container;

/**
 * Initializes and returns the Hono application instance.
 *
 * This function implements lazy initialization pattern, creating a singleton container
 * only on the first invocation. The container is then reused across subsequent calls,
 * which is particularly useful for AWS Lambda warm invocations to improve performance.
 *
 * @returns The Hono application instance from the container
 */
const initApp = () => {
  // Lazy initialization (reused across warm Lambda invocation)
  if (!container) {
    container = Container.getInstance();
  }

  return container.hono;
};

export default initApp;
