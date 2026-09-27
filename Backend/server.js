import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";
import aiRouter from "./routes/aiRoute.js";
import path from "path";
import { fileURLToPath } from "url";
import { seedDatabase } from "./utils/seedData.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from both Backend/.env and root .env
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Production HTTP security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Resilient CORS configuration
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "token",
      "atoken",
      "dtoken",
      "Authorization",
    ],
  })
);
app.options("*", cors());

// Body Parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate Limiter for Authentication Endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // Developer & demonstration friendly
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many authentication attempts from this IP, please try again after a few minutes",
  },
});

// Apply rate limiting to auth routes
app.use("/api/user/login", authLimiter);
app.use("/api/user/register", authLimiter);
app.use("/api/doctor/login", authLimiter);
app.use("/api/doctor/register", authLimiter);
app.use("/api/admin/login", authLimiter);
app.use("/api/admin/register", authLimiter);

// Database and cloud connections
connectDB()
  .then(async () => {
    console.log("Connected to MongoDB successfully");

    // Seed initial doctors & demo accounts if database is empty
    await seedDatabase(false);
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err.message);
  });

connectCloudinary();

// API Endpoints
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);
app.use("/api/ai", aiRouter);

// Health check endpoint for deployment monitoring
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: "Prescripto Doctor Appointment API",
    version: "2.0.0",
  });
});

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "online",
    message:
      "Prescripto Healthcare Consultation & Doctor Appointment API is running",
    endpoints: {
      user: "/api/user",
      doctor: "/api/doctor",
      admin: "/api/admin",
      health: "/api/health",
    },
    version: "2.0.0",
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Endpoint ${req.method} ${req.originalUrl} not found`,
  });
});

// Centralized Global Error Handler Middleware
app.use(errorHandler);

// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is listening at port ${PORT}`);
  console.log(`Health endpoint: http://localhost:${PORT}/api/health`);
});

export default app;
