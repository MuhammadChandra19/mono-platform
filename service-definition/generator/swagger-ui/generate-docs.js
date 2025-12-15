const fs = require("fs");
const path = require("path");

// Directory containing OpenAPI specs
const openapiDir = path.join(__dirname, "../../openapi");
// Output directory for docs - now in core-service
const docsDir = path.join(__dirname, "../../../apps/core-service/public/docs");

// Function to recursively find OpenAPI files
function getOpenAPIFiles(dir, baseDir = dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getOpenAPIFiles(filePath, baseDir, fileList);
    } else if (
      file.endsWith(".yaml") ||
      file.endsWith(".yml") ||
      file.endsWith(".json")
    ) {
      const relativePath = path.relative(baseDir, filePath);
      fileList.push(relativePath);
    }
  });

  return fileList;
}

// Generate swagger-initializer.js
function generateSwaggerInitializer(files) {
  const urls = files.map((file) => {
    const name = path.basename(file, path.extname(file));
    return {
      url: `./${file}`,
      name: name,
    };
  });

  const initializerContent = `
window.onload = function() {
  const ui = SwaggerUIBundle({
    urls: ${JSON.stringify(urls, null, 2)},
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  });
  
  window.ui = ui;
};
`;

  return initializerContent;
}

// Main function
function generateDocs() {
  console.log("Generating Swagger UI documentation...");

  // Create docs directory if it doesn't exist
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Find all OpenAPI files
  const openapiFiles = getOpenAPIFiles(openapiDir);
  console.log(`Found ${openapiFiles.length} OpenAPI files`);

  // Copy OpenAPI files to docs directory maintaining structure
  openapiFiles.forEach((file) => {
    const sourcePath = path.join(openapiDir, file);
    const destPath = path.join(docsDir, file);

    // Create directory if needed
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied: ${file}`);
  });

  // Generate swagger-initializer.js
  const initializerContent = generateSwaggerInitializer(openapiFiles);
  fs.writeFileSync(
    path.join(docsDir, "swagger-initializer.js"),
    initializerContent,
  );
  console.log("Generated swagger-initializer.js");

  // Copy index.html template
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
    <link rel="icon" type="image/png" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/favicon-32x32.png" sizes="32x32" />
    <link rel="icon" type="image/png" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/favicon-16x16.png" sizes="16x16" />
    <style>
      html {
        box-sizing: border-box;
        overflow: -moz-scrollbars-vertical;
        overflow-y: scroll;
      }
      *, *:before, *:after {
        box-sizing: inherit;
      }
      body {
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js" charset="UTF-8"></script>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js" charset="UTF-8"></script>
    <script src="./swagger-initializer.js" charset="UTF-8"></script>
  </body>
</html>`;

  fs.writeFileSync(path.join(docsDir, "index.html"), indexHtml);
  console.log("Generated index.html");

  console.log(`\nDocumentation generated successfully in: ${docsDir}`);
}

// Run
generateDocs();
