import initApp from "./bootstrap";

const app = initApp();

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
