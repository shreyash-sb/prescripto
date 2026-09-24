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
  },
  { timestamps: true }
);

// Compound index for fast conflict lookups and doctor schedules
appointmentSchema.index({ docId: 1, slotDate: 1, slotTime: 1 });

const appointmentModel =
  mongoose.models.appointment || mongoose.model("appointment", appointmentSchema);

export default appointmentModel;
