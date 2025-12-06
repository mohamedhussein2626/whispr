import crypto from "crypto";
import { SignJWT, jwtVerify } from "jose";

// ─── Environment Variables ────────────────────────────────────────────────────

const SECRET_KEY = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;

if (!SECRET_KEY || !REFRESH_SECRET) {
  throw new Error(
    "JWT_SECRET and REFRESH_SECRET must be defined in environment variables.",
  );
}

const secretKey = new TextEncoder().encode(SECRET_KEY);
const refreshSecretKey = new TextEncoder().encode(REFRESH_SECRET);

// ─── Constants ────────────────────────────────────────────────────────────────

const PASSWORD_ITERATIONS = 10000;
const SALT_LENGTH = 16;
const KEY_LENGTH = 64;
const DIGEST = "sha512";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface JWTPayload {
  adminId: number;
  email: string;
  role: "admin";
  iat?: number;
  exp?: number;
}

// ─── Type Guard ───────────────────────────────────────────────────────────────

const isJWTPayload = (payload: unknown): payload is JWTPayload => {
  if (typeof payload !== "object" || payload === null) return false;

  const obj = payload as Record<string, unknown>;

  return (
    typeof obj.adminId === "number" &&
    typeof obj.email === "string" &&
    obj.role === "admin"
  );
};

// ─── Password Utilities ───────────────────────────────────────────────────────

export const generateSalt = (): string => {
  return crypto.randomBytes(SALT_LENGTH).toString("hex");
};

export const hashPassword = (password: string, salt: string): string => {
  return crypto
    .pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, KEY_LENGTH, DIGEST)
    .toString("hex");
};

export const verifyPassword = (
  password: string,
  salt: string,
  hashedPassword: string,
): boolean => {
  const hashToCompare = hashPassword(password, salt);
  return crypto.timingSafeEqual(
    Buffer.from(hashToCompare),
    Buffer.from(hashedPassword),
  );
};

// ─── JWT Generators ───────────────────────────────────────────────────────────

export const generateAdminToken = async (
  payload: Omit<JWTPayload, "iat" | "exp">,
): Promise<string> => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .setIssuer("admin-app")
    .setAudience("admin-dashboard")
    .sign(secretKey);
};

export const generateRefreshToken = async (
  payload: Omit<JWTPayload, "iat" | "exp">,
): Promise<string> => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .setIssuer("admin-app")
    .setAudience("admin-dashboard")
    .sign(refreshSecretKey);
};

// ─── JWT Verifier ─────────────────────────────────────────────────────────────

export const verifyToken = async (
  token: string,
  isRefresh = false,
): Promise<JWTPayload | null> => {
  try {
    const key = isRefresh ? refreshSecretKey : secretKey;
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
      issuer: "admin-app",
      audience: "admin-dashboard",
      clockTolerance: 5,
    });

    if (isJWTPayload(payload)) {
      return payload;
    }

    console.warn("Invalid JWT payload structure.");
    return null;
  } catch (err) {
    console.error("Token verification failed:", err);
    return null;
  }
};

// ─── Debug Utility ────────────────────────────────────────────────────────────

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    const base64Payload = token.split(".")[1];
    const jsonPayload = Buffer.from(base64Payload, "base64").toString();
    const parsed = JSON.parse(jsonPayload);

    return isJWTPayload(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

// ─── Random Token Generators ──────────────────────────────────────────────────

export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

export const generateCSRFToken = (): string => {
  return crypto.randomBytes(16).toString("hex");
};