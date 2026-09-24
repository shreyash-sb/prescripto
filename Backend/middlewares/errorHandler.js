/**
 * Custom Application Error class for operational errors with HTTP status codes
 */
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async handler wrapper to forward errors to the centralized error middleware
 * @param {Function} fn - Controller function
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Centralized Express Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  let message = err.message || "An unexpected internal server error occurred";

  // Handle Mongoose duplicate key error (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `An account with this ${field} already exists`;
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join(", ");
  }

  // Handle Mongoose invalid ObjectId (CastError)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid resource ID format: ${err.value}`;
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token. Please login again.";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication session expired. Please login again.";
  }

  // Log non-operational server errors in dev/staging
  if (statusCode === 500) {
    console.error("Internal Server Error:", err.stack || err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

export default {
  AppError,
  asyncHandler,
  errorHandler,
};
