import { sign, verify, JwtPayload } from "jsonwebtoken";
import { randomUUID } from "crypto";
import {
  Maker,
  Payload,
  RefreshPayload,
  PayloadWithScope,
  CreateTokenParams,
  CreateRefreshTokenParams,
} from "./types";

type JWTMakerDeps = {
  secretKey: string;
};

/**
 * Factory function to create a JWT maker instance
 * @param deps - Dependencies for JWT maker
 * @returns JWT maker instance
 */
const createJWTMaker = ({ secretKey }: JWTMakerDeps): Maker => {
  if (!secretKey || secretKey.length < 32) {
    throw new Error("Secret key must be at least 32 characters long");
  }

  const createToken = async ({
    userID,
    username,
    permission,
    role,
    duration,
    instanceID,
    roleID,
    user,
    metadata,
  }: CreateTokenParams): Promise<{
    token: string;
    payload: PayloadWithScope;
  }> => {
    const tokenID = randomUUID();
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + duration);

    const payload: Payload = {
      id: tokenID,
      userID,
      username,
      permission,
      role,
      instanceID,
      roleID,
      user,
      metadata,
      issuedAt,
      expiresAt,
    };

    const token = sign(
      {
        jti: tokenID,
        sub: userID,
        username,
        permission,
        role,
        instanceID,
        roleID,
        user,
        metadata,
        iat: Math.floor(issuedAt.getTime() / 1000),
        exp: Math.floor(expiresAt.getTime() / 1000),
      },
      secretKey,
      {
        algorithm: "HS256",
      },
    );

    return { token, payload: new PayloadWithScope(payload) };
  };

  const verifyToken = async (token: string): Promise<PayloadWithScope> => {
    try {
      const decoded = verify(token, secretKey, {
        algorithms: ["HS256"],
      }) as JwtPayload;

      if (!decoded.jti || !decoded.sub) {
        throw new Error("Invalid token structure");
      }

      const payload: Payload = {
        id: decoded.jti,
        userID: decoded.sub,
        username: decoded.username,
        permission: decoded.permission,
        role: decoded.role,
        instanceID: decoded.instanceID,
        roleID: decoded.roleID,
        user: decoded.user,
        metadata: decoded.metadata,
        issuedAt: new Date((decoded.iat || 0) * 1000),
        expiresAt: new Date((decoded.exp || 0) * 1000),
      };

      const payloadWithScope = new PayloadWithScope(payload);

      // Check if token is expired
      if (!payloadWithScope.isValid()) {
        throw new Error("Token has expired");
      }

      return payloadWithScope;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Token verification failed: ${error.message}`);
      }
      throw new Error("Token verification failed");
    }
  };

  const createRefreshToken = async ({
    userID,
    duration,
    linkedAccessTokenID,
  }: CreateRefreshTokenParams): Promise<{
    token: string;
    payload: RefreshPayload;
  }> => {
    const tokenID = randomUUID();
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + duration);

    const payload: RefreshPayload = {
      id: tokenID,
      userID,
      linkedAccessTokenID,
      issuedAt,
      expiresAt,
    };

    const token = sign(
      {
        jti: tokenID,
        sub: userID,
        linkedAccessTokenID,
        iat: Math.floor(issuedAt.getTime() / 1000),
        exp: Math.floor(expiresAt.getTime() / 1000),
        type: "refresh",
      },
      secretKey,
      {
        algorithm: "HS256",
      },
    );

    return { token, payload };
  };

  const verifyRefreshToken = async (token: string): Promise<RefreshPayload> => {
    try {
      const decoded = verify(token, secretKey, {
        algorithms: ["HS256"],
      }) as JwtPayload;

      if (!decoded.jti || !decoded.sub || decoded.type !== "refresh") {
        throw new Error("Invalid refresh token structure");
      }

      const payload: RefreshPayload = {
        id: decoded.jti,
        userID: decoded.sub,
        linkedAccessTokenID: decoded.linkedAccessTokenID,
        issuedAt: new Date((decoded.iat || 0) * 1000),
        expiresAt: new Date((decoded.exp || 0) * 1000),
      };

      // Check if token is expired
      if (payload.expiresAt < new Date()) {
        throw new Error("Refresh token has expired");
      }

      return payload;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Refresh token verification failed: ${error.message}`);
      }
      throw new Error("Refresh token verification failed");
    }
  };

  return {
    createToken,
    verifyToken,
    createRefreshToken,
    verifyRefreshToken,
  };
};

export default createJWTMaker;
export type { JWTMakerDeps };
export { createJWTMaker };
