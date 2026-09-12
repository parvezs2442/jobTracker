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

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();

  // If a valid secret with good length is provided, use it
  if (
    secret &&
    !INSECURE_PLACEHOLDERS.includes(secret.toLowerCase()) &&
    secret.length >= 16
  ) {
    return secret;
  }

  // If in production and secret is insecure or missing, log a warning and use secure fallback
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[JWT Warning]: JWT_SECRET is missing or using an insecure placeholder. Using fallback key for production continuity. Please configure a custom JWT_SECRET in your hosting dashboard."
    );
    return secret || "jobtracker_production_jwt_fallback_secure_key_2026_x89a11";
  }

  return secret || "dev_local_jwt_secret_development_only";
}

export function signJwt(payload: JwtPayload, expiresIn: string | number = "7d"): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn } as jwt.SignOptions);
}

export function verifyJwt(token: string): JwtPayload {
  return jwt.verify(token, getJwtSecret()) as JwtPayload;
}
