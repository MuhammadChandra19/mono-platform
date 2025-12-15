import { Hono } from "hono";
import { readFileSync } from "fs";
import { join } from "path";

export function setupSwaggerDocs(app: Hono) {
  const docsDir = join(process.cwd(), "public/docs");

  // Manually serve files from docs directory
  app.get("/docs/index.html", (c) => {
    const content = readFileSync(join(docsDir, "index.html"), "utf-8");
    return c.html(content);
  });

  app.get("/docs/swagger-initializer.js", (c) => {
    const content = readFileSync(
      join(docsDir, "swagger-initializer.js"),
      "utf-8",
    );
    return c.text(content, 200, { "Content-Type": "application/javascript" });
  });

  app.get("/docs/modules/*", (c) => {
    const relativePath = c.req.path.replace("/docs/", "");
    const content = readFileSync(join(docsDir, relativePath), "utf-8");
    return c.text(content, 200, { "Content-Type": "application/x-yaml" });
  });

  // Redirect /docs to /docs/index.html
  app.get("/docs", (c) => c.redirect("/docs/index.html"));
}
