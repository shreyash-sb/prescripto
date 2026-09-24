import multer from "multer";
import path from "path";
import crypto from "crypto";
import { AppError } from "./errorHandler.js";

// Safe disk storage using sanitized unique filenames and temporary directory
const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
    callback(null, `upload-${uniqueSuffix}${ext}`);
  },
});

// File filter to only allow standard image formats (JPEG, PNG, WEBP, JPG)
const fileFilter = (req, file, callback) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(
      new AppError(
        "Invalid file type. Only JPEG, JPG, PNG, and WEBP image formats are supported.",
        400
      ),
      false
    );
  }
};

// 5MB maximum file size limit
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

export default upload;