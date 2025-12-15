window.onload = function () {
  const ui = SwaggerUIBundle({
    urls: [
      {
        url: "./modules/authentication/v1/authentication-v1.openapi.yaml",
        name: "authentication-v1.openapi",
      },
    ],
    dom_id: "#swagger-ui",
    deepLinking: true,
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    plugins: [SwaggerUIBundle.plugins.DownloadUrl],
    layout: "StandaloneLayout",
  });

  window.ui = ui;
};
