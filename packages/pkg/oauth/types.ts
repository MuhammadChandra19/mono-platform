import { UserRoleTypeEnum, User } from "@packages/openapigen";

/**
 * Access token payload
 */
export interface Payload {
  id: string; // Token ID (JTI)
  userID: string;
  username: string;
  permission: string;
  role: UserRoleTypeEnum;
  instanceID: string;
  roleID: string;
  user?: User; // User object
  metadata?: any;
  issuedAt: Date;
  expiresAt: Date;
}

/**
 * Payload class with scope checking methods
 */
export class PayloadWithScope implements Payload {
  id: string;
  userID: string;
  username: string;
  permission: string;
  role: UserRoleTypeEnum;
  instanceID: string;
  roleID: string;
  user?: User;
  metadata?: any;
  issuedAt: Date;
  expiresAt: Date;

  constructor(payload: Payload) {
    this.id = payload.id;
    this.userID = payload.userID;
    this.username = payload.username;
    this.permission = payload.permission;
    this.role = payload.role;
    this.instanceID = payload.instanceID;
    this.roleID = payload.roleID;
    this.user = payload.user;
    this.metadata = payload.metadata;
    this.issuedAt = payload.issuedAt;
    this.expiresAt = payload.expiresAt;
  }

  /**
   * Checks if the token payload is valid
   */
  isValid(): boolean {
    return new Date() <= this.expiresAt;
  }

  /**
   * Checks if the token payload has the required scope
   * @param roleMap - Map of roles that are allowed (if null/undefined, all roles allowed)
   * @param requiredPermissions - Required permission string (can contain wildcards)
   * @returns True if has required scope, false otherwise
   */
  hasScope(
    roleMap?: Record<UserRoleTypeEnum, boolean> | null,
    requiredPermissions?: string | null,
  ): boolean {
    // If no role map provided, allow all
    if (!roleMap) {
      return true;
    }

    if (requiredPermissions) {
      // Split on both whitespace and commas
      const requiredScopes = requiredPermissions
        .split(/[\s,]+/)
        .filter((s) => s.length > 0);
      const claimedScopes = this.permission
        .split(/[\s,]+/)
        .filter((s) => s.length > 0);

      // Check if all required scopes are present in claimed scopes or match wildcards
      for (const required of requiredScopes) {
        if (!required) continue;

        let found = false;

        // Check for exact match
        if (claimedScopes.includes(required)) {
          found = true;
        }

        // Check for wildcard matches
        if (!found) {
          for (const claimed of claimedScopes) {
            if (!claimed) continue;

            // Check for resource:* pattern
            if (claimed.endsWith(":*")) {
              const prefix = claimed.slice(0, -2); // Remove ':*'
              if (required.startsWith(prefix + ":")) {
                found = true;
                break;
              }
            }
            // Check for *:* (all permissions)
            else if (claimed === "*:*") {
              found = true;
              break;
            }
          }
        }

        // If required permission not found, check role map
        if (!found) {
          return roleMap[this.role] || false;
        }
      }
      return true;
    }

    // If no required permissions, just check role
    return roleMap[this.role] || false;
  }
}

/**
 * Refresh token payload
 */
export interface RefreshPayload {
  id: string; // Token ID (JTI)
  userID: string;
  linkedAccessTokenID: string;
  issuedAt: Date;
  expiresAt: Date;
}

/**
 * Token creation result
 */
export interface TokenResult {
  token: string;
  payload: Payload | RefreshPayload;
}

/**
 * Parameters for creating an access token
 */
export interface CreateTokenParams {
  userID: string;
  username: string;
  permission: string;
  role: UserRoleTypeEnum;
  duration: number;
  instanceID: string;
  roleID: string;
  user?: User;
  metadata?: any;
}

/**
 * Parameters for creating a refresh token
 */
export interface CreateRefreshTokenParams {
  userID: string;
  duration: number;
  linkedAccessTokenID: string;
}

/**
 * Maker interface for managing tokens
 */
export interface Maker {
  /**
   * Creates a new access token for a specific user
   * @param params - Token creation parameters
   * @returns Token string and payload
   */
  createToken(
    params: CreateTokenParams,
  ): Promise<{ token: string; payload: PayloadWithScope }>;

  /**
   * Verifies if the access token is valid
   * @param token - Token string to verify
   * @returns Decoded payload if valid
   */
  verifyToken(token: string): Promise<PayloadWithScope>;

  /**
   * Creates a new refresh token for a specific user
   * @param params - Refresh token creation parameters
   * @returns Token string and payload
   */
  createRefreshToken(
    params: CreateRefreshTokenParams,
  ): Promise<{ token: string; payload: RefreshPayload }>;

  /**
   * Verifies if the refresh token is valid
   * @param token - Refresh token string to verify
   * @returns Decoded payload if valid
   */
  verifyRefreshToken(token: string): Promise<RefreshPayload>;
}
