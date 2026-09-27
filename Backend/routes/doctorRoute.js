import express from "express";
import {
  registerDoctor,
  doctorList,
  loginDoctor,
  appointmentsDoctor,
  appointmentCancel,
  appointmentComplete,
  updateLiveQueue,
  collectPayment,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
  changeAvailability,
} from "../controllers/doctorController.js";
import { authDoctor } from "../middlewares/auth.js";

const doctorRouter = express.Router();

// Public Doctor Directory & Authentication
doctorRouter.get("/list", doctorList);
doctorRouter.post("/register", registerDoctor);
doctorRouter.post("/login", loginDoctor);

// Protected Doctor Portal Routes
doctorRouter.get("/appointments", authDoctor, appointmentsDoctor);
doctorRouter.post("/complete-appointment", authDoctor, appointmentComplete);
doctorRouter.post("/cancel-appointment", authDoctor, appointmentCancel);
doctorRouter.post("/update-live-queue", authDoctor, updateLiveQueue);
doctorRouter.post("/collect-payment", authDoctor, collectPayment);
doctorRouter.get("/dashboard", authDoctor, doctorDashboard);
doctorRouter.get("/profile", authDoctor, doctorProfile);
doctorRouter.post("/update-profile", authDoctor, updateDoctorProfile);
doctorRouter.post("/change-availability", authDoctor, changeAvailability);

export default doctorRouter;