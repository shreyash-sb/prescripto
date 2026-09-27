import mongoose from "mongoose";

const Schema = mongoose.Schema;

const accessLogSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    accessorName: { type: String, required: true },
    accessorRole: { type: String, required: true }, // "doctor" | "admin" | "patient"
    accessorId: { type: String, default: "" },
    resource: { type: String, required: true }, // "Full Medical History", "Drug Allergies & Vitals", "E-Prescription & Notes", "Contact Details", "Lab Reports"
    action: { type: String, required: true }, // "VIEWED", "UPDATED", "PRESCRIBED", "EXPORTED"
    details: { type: String, default: "" },
    ipAddress: { type: String, default: "127.0.0.1" },
    device: { type: String, default: "Hospital Clinical Terminal (Encrypted)" },
  },
  { timestamps: true }
);

const accessLogModel =
  mongoose.models.accessLog || mongoose.model("accessLog", accessLogSchema);

export default accessLogModel;
