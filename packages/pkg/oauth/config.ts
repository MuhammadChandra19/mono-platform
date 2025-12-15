export const oauthConfig = {
  secretKey:
    process.env.OATH_SECRET ?? "different-secret-key-with-minimum-32-chars",
};

export type OauthConfig = typeof oauthConfig;
