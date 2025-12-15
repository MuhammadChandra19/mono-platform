// Server-side exports (types, routers, middleware)
export * from "./modules/authentication/v1/models/index";
export * from "./modules/authentication/v1/apis/AuthServiceApi/router";
export * from "./modules/authentication/v1/apis/AuthServiceApi/server-middleware";
export * from "./modules/authentication/v1/apis/IdentityServiceApi/router";
export * from "./modules/authentication/v1/apis/IdentityServiceApi/server-middleware";
export * from "./modules/authentication/v1/apis/PermissionServiceApi/router";

// Re-export only ServiceResult type from runtime (needed for server)
export type { ServiceResult } from "./shared/runtime";
