import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "chaicode-cinema-super-secret-change-in-prod";
const EXPIRES_IN = "24h";

/**
 * Creates a signed JWT for the given email.
 * @param {string} email
 * @returns {string} signed token
 */
export function createUserToken(email) {
  return jwt.sign({ email }, SECRET, { expiresIn: EXPIRES_IN });
}

/**
 * Verifies and decodes a JWT.
 * @param {string} token
 * @returns {{ email: string } | null} decoded payload, or null if invalid
 */
export function verifyUserToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}