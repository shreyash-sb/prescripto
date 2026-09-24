import jwt from "jsonwebtoken";

const getJwtSecret = () =>
  process.env.JWT_SECRET || "prescripto_default_secure_jwt_secret_key_2026";

/**
 * Generate standard signed JWT token with 7-day expiration
 * @param {Object} payload - Object containing { id, role }
 * @returns {string} - Signed JWT token string
 */
export const createToken = (payload) => {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: "7d",
  });
};

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token string
 * @returns {Object} - Decoded payload { id, role, iat, exp }
 */
export const verifyToken = (token) => {
  if (!token || typeof token !== "string") {
    throw new Error("Authentication token is missing or invalid");
  }
  return jwt.verify(token, getJwtSecret());
};

export default {
  createToken,
  verifyToken,
};
