import mongoose from "mongoose";

const Schema = mongoose.Schema;

const doctorSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    image: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop",
    },
    speciality: { type: String, required: true, index: true },
    degree: { type: String, required: true },
    experience: { type: String, required: true },
    about: { type: String, required: true },
    available: { type: Boolean, default: true, index: true },
    fees: { type: Number, required: true, min: 0 },
    address: { type: Object, required: true },
    date: { type: Number, default: () => Date.now() },
    slots_booked: { type: Object, default: {} },
    rating: { type: Number, default: 4.8 },
    ratingsCount: { type: Number, default: 12 },
    slotDuration: { type: Number, default: 30 }, // Consultation slot length in minutes (15, 20, 30, 45, 60)
    shifts: {
      type: Object,
      default: {
        morning: { enabled: true, start: "09:00", end: "13:00" },
        evening: { enabled: true, start: "16:00", end: "20:00" },
      },
    },
    vacationDates: { type: [String], default: [] }, // Array of blocked date strings e.g. ["25_9_2026", "2026-09-25"]
  },
  { minimize: false, timestamps: true }
);

const doctorModel = mongoose.models.doctor || mongoose.model("doctor", doctorSchema);

export default doctorModel;
