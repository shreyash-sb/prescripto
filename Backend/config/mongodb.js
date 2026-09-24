import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from current cwd, Backend directory, and root directory
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const getDbUrl = () =>
  process.env.MONGODB_URI || process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/prescripto";

const connectDB = async () => {
  const url = getDbUrl();
  console.log(`Connecting to MongoDB at: ${url.replace(/:([^:@]{4})[^:@]*@/, ":****@")}`);
  await mongoose.connect(url);
};

export default connectDB;
