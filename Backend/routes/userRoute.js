import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointments,
  cancelAppointment,
  payAppointment,
  rateAppointment,
  getAccessLogs,
  getMedicineRoutines,
  createMedicineRoutine,
  toggleMedicineDose,
  deleteMedicineRoutine,
  convertPrescriptionToSchedule,
  submitFollowUpCheckin,
  getFollowUps,
  symptomTriage,
} from "../controllers/userController.js";
import { authUser } from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";

const userRouter = express.Router();

// Patient Authentication
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

// Patient Profile & Medical History
userRouter.get("/get-profile", authUser, getProfile);
userRouter.post("/update-profile", authUser, upload.single("image"), updateProfile);

// Appointment Management & Automated Refunds (Supporting canonical & alias paths)
userRouter.post("/book-appointment", authUser, bookAppointment);
userRouter.get("/list-appointments", authUser, listAppointments);
userRouter.get("/appointments", authUser, listAppointments);
userRouter.post("/cancel-appointment", authUser, cancelAppointment);
userRouter.post("/pay-appointment", authUser, payAppointment);
userRouter.post("/rate-appointment", authUser, rateAppointment);

// Patient Privacy Audit Log ("Who accessed what and when")
userRouter.get("/access-logs", authUser, getAccessLogs);

// Medicine Routine & Reminder Manager
userRouter.get("/medicine-routines", authUser, getMedicineRoutines);
userRouter.post("/medicine-routines", authUser, createMedicineRoutine);
userRouter.post("/create-medicine-routine", authUser, createMedicineRoutine);
userRouter.post("/toggle-dose", authUser, toggleMedicineDose);
userRouter.post("/delete-medicine-routine", authUser, deleteMedicineRoutine);
userRouter.post("/convert-prescription-to-schedule", authUser, convertPrescriptionToSchedule);

// Automatic Follow-Up Manager
userRouter.get("/follow-ups", authUser, getFollowUps);
userRouter.post("/follow-up-checkin", authUser, submitFollowUpCheckin);

// AI Symptom Triage & Specialist Recommender
userRouter.post("/symptom-triage", symptomTriage);

export default userRouter;
