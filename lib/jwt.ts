import jwt from "jsonwebtoken";

const INSECURE_PLACEHOLDERS = [
  "this_is_my_super_secret_key",
  "secret",
  "jwt_secret",
  "changeme",
  "password",
];

export interface JwtPayload {
  userId: string;
}

/**
 * Returns the validated JWT Secret.
 * Enforces strict production security:
 * Refuses execution in production if JWT_SECRET is missing or set to a known placeholder.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "FATAL SECURITY ERROR: JWT_SECRET environment variable is missing in production."
      );
    }
    return "dev_local_jwt_secret_development_only";
  }

  if (
    process.env.NODE_ENV === "production" &&
    (INSECURE_PLACEHOLDERS.includes(secret.toLowerCase()) || secret.length < 16)
  ) {
    throw new Error(
      "FATAL SECURITY ERROR: JWT_SECRET is set to an insecure placeholder in production. Set a cryptographically strong secret."
    );
  }

  return secret;
}

export function signJwt(payload: JwtPayload, expiresIn: string | number = "7d"): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn } as jwt.SignOptions);
}

export function verifyJwt(token: string): JwtPayload {
  return jwt.verify(token, getJwtSecret()) as JwtPayload;
}
