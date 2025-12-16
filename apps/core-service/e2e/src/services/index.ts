import { AuthServiceApi } from '@packages/openapigen/src/modules/authentication/v1/apis/AuthServiceApi/client';
import { IdentityServiceApi } from '@packages/openapigen/src/modules/authentication/v1/apis/IdentityServiceApi/client';
import { PermissionServiceApi } from '@packages/openapigen/src/modules/authentication/v1/apis/PermissionServiceApi/client';
import { Configuration } from '@packages/openapigen/src/shared/runtime';

const initServices = () => {
  const configuration = new Configuration({
    basePath: process.env.SERVICE_BASE_PATH || 'http://localhost:3000',
  });
  
  const services = {
    authService: new AuthServiceApi(configuration),
    identityService: new IdentityServiceApi(configuration),
    permissionService: new PermissionServiceApi(configuration),
  }
  return {
    services,
    configuration,
  }
}

export default initServices;
