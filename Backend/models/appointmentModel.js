import mongoose from "mongoose";

const Schema = mongoose.Schema;

const appointmentSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    docId: { type: String, required: true, index: true },
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
    userData: { type: Object, required: true },
    docData: { type: Object, required: true },
    amount: { type: Number, required: true },
    date: { type: Number, default: () => Date.now() },
    cancelled: { type: Boolean, default: false, index: true },
    payment: { type: Boolean, default: false },
    paymentMethod: { type: String, default: "Pending" }, // "Card (Demo)", "UPI (Demo)", "Cash on Visit"
    paymentId: { type: String, default: "" },
    isCompleted: { type: Boolean, default: false, index: true },
    prescription: { type: String, default: "" },
    diagnosisNotes: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    review: { type: String, default: "" },
    tokenNumber: { type: Number, default: 1 },
    crowdLevel: { type: String, default: "Low" }, // "Low" | "Moderate" | "Busy"
    estimatedWaitTime: { type: Number, default: 10 }, // in minutes
    allergyWarnings: { type: [String], default: [] },
    refundStatus: { type: String, default: "None" }, // "None" | "Initiated" | "Processing" | "Refunded"
    refundAmount: { type: Number, default: 0 },
    refundId: { type: String, default: "" },
    refundDate: { type: Number, default: null },
    refundReason: { type: String, default: "" },
    followUp: {
      type: Object,
      default: {
        isRequired: false,
        recommendedDays: 7,
        dueDate: "",
        status: "None", // "None" | "Pending" | "Completed"
        patientFeedback: null,
      },
    },
    structuredMedicines: {
      type: [Object],
      default: [],
    },
    queueStatus: { type: String, default: "Waiting" }, // "Waiting" | "In-Consultation" | "Completed" | "Cancelled"
  },
  { timestamps: true }
);

// Compound index for fast conflict lookups and doctor schedules
appointmentSchema.index({ docId: 1, slotDate: 1, slotTime: 1 });

const appointmentModel =
  mongoose.models.appointment || mongoose.model("appointment", appointmentSchema);

export default appointmentModel;
