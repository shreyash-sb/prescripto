import { verifyToken } from "../utils/token.js";
import { AppError } from "./errorHandler.js";

/**
 * Unified JWT Extraction helper
 * Supports custom headers (e.g. 'token', 'dtoken', 'atoken') or standard 'Authorization: Bearer <jwt>'
 */
const extractToken = (req, headerKey) => {
  let token = req.headers[headerKey.toLowerCase()];
  if (!token && req.headers.authorization) {
    if (req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else {
      token = req.headers.authorization;
    }
  }
  return token;
};

/**
 * Admin authentication & role-verification middleware
 * Attaches verified admin context to req.admin
 */
export const authAdmin = async (req, res, next) => {
  try {
    const atoken = extractToken(req, "atoken");
    if (!atoken) {
      return next(new AppError("Admin authorization required. Please login.", 401));
    }

    const tokenData = verifyToken(atoken);
    if (tokenData.role !== "admin" || !tokenData.id) {
      return next(new AppError("Access denied. Admin privileges required.", 403));
    }

    req.admin = {
      _id: tokenData.id.toString(),
      role: "admin",
    };

    next();
  } catch (error) {
    return next(new AppError("Invalid or expired admin session. Please login again.", 401));
  }
};

/**
 * Doctor authentication & role-verification middleware
 * Attaches verified doctor context to req.doctor
 */
export const authDoctor = async (req, res, next) => {
  try {
    const dtoken = extractToken(req, "dtoken");
    if (!dtoken) {
      return next(new AppError("Doctor authorization required. Please login.", 401));
    }

    const tokenData = verifyToken(dtoken);
    if (tokenData.role !== "doctor" || !tokenData.id) {
      return next(new AppError("Access denied. Doctor privileges required.", 403));
    }

    req.doctor = {
      _id: tokenData.id.toString(),
      role: "doctor",
    };

    next();
  } catch (error) {
    return next(new AppError("Invalid or expired doctor session. Please login again.", 401));
  }
};

/**
 * User / Patient authentication & role-verification middleware
 * Attaches verified patient context to req.user
 */
export const authUser = async (req, res, next) => {
  try {
    const token = extractToken(req, "token");
    if (!token) {
      return next(new AppError("User authorization required. Please login.", 401));
    }

    const tokenData = verifyToken(token);
    if (tokenData.role !== "user" || !tokenData.id) {
      return next(new AppError("Access denied. Patient authorization required.", 403));
    }

    req.user = {
      _id: tokenData.id.toString(),
      role: "user",
    };

    next();
  } catch (error) {
    return next(new AppError("Invalid or expired session. Please login again.", 401));
  }
};

export default {
  authAdmin,
  authDoctor,
  authUser,
};
