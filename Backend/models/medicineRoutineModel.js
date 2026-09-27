import mongoose from "mongoose";

const Schema = mongoose.Schema;

const medicineRoutineSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    medicineName: { type: String, required: true, trim: true },
    dosage: { type: String, default: "1 Tablet" }, // e.g. "500mg", "10ml", "1 Capsule"
    frequency: { type: String, default: "Twice daily" }, // e.g. "1-0-1", "Once daily", "Three times daily"
    scheduleSlots: {
      type: [String],
      default: ["Morning", "Night"], // "Morning", "Afternoon", "Evening", "Night"
    },
    mealTime: {
      type: String,
      default: "After Food", // "Before Food", "After Food", "With Food", "Empty Stomach"
    },
    startDate: { type: String, default: () => new Date().toISOString().split("T")[0] },
    durationDays: { type: Number, default: 7 },
    prescribedByDoctor: { type: String, default: "Self-Logged / Physician" },
    appointmentId: { type: String, default: "" },
    notes: { type: String, default: "" },
    remindersEnabled: { type: Boolean, default: true },
    reminderTimes: {
      type: Object,
      default: {
        morning: "08:00",
        afternoon: "13:00",
        evening: "18:00",
        night: "21:00",
      },
    },
    adherenceLogs: {
      type: [Object],
      default: [], // [{ date: "2026-09-27", slot: "Morning", taken: true, takenAt: Date }]
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const medicineRoutineModel =
  mongoose.models.medicineRoutine ||
  mongoose.model("medicineRoutine", medicineRoutineSchema);

export default medicineRoutineModel;
