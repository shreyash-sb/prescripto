import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    image: { type: String, default: "" },
    address: {
      type: Object,
      default: { line1: "", line2: "" },
    },
    gender: { type: String, default: "Not Selected" },
    dob: { type: String, default: "Not Selected" },
    phone: { type: String, default: "0000000000" },
    bloodGroup: { type: String, default: "O+" },
    allergies: { type: [String], default: [] },
    chronicConditions: { type: [String], default: [] },
    vitals: {
      type: Object,
      default: {
        bp: "120/80",
        sugar: "95",
        heartRate: "72",
        weight: "68",
        height: "172",
        bmi: "23.0",
        lastUpdated: "Today",
      },
    },
    emergencyContact: {
      type: Object,
      default: {
        name: "",
        relation: "",
        phone: "",
      },
    },
    walletBalance: { type: Number, default: 0 },
    medicalDocs: {
      type: [Object],
      default: [],
    },
    preferredLanguage: { type: String, default: "en" },
  },
  { timestamps: true }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;
