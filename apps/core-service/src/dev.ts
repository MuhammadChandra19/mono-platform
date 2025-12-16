import initApp from "./bootstrap";
import { setupSwaggerDocs } from "./utils/swagger";

const app = initApp();
setupSwaggerDocs(app);
const server = Bun.serve({
  port: 3000,
  fetch: app.fetch,
});

console.log(`Server running on http://localhost:${server.port}`);

// graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down gracefully...");
  server.stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\nShutting down gracefully...");
  server.stop();
  process.exit(0);
});
