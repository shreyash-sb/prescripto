import mongoose from "mongoose";

const Schema = mongoose.Schema;

const adminSchema = new Schema(
  {
    name: { type: String, required: true, default: "Admin", trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin" },
    date: { type: Number, default: () => Date.now() },
  },
  { timestamps: true }
);

const adminModel = mongoose.models.admin || mongoose.model("admin", adminSchema);

export default adminModel;
