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
} from "../controllers/userController.js";
import { authUser } from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";

const userRouter = express.Router();

// Patient Authentication
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

// Patient Profile
userRouter.get("/get-profile", authUser, getProfile);
userRouter.post("/update-profile", authUser, upload.single("image"), updateProfile);

// Appointment Management
userRouter.post("/book-appointment", authUser, bookAppointment);
userRouter.get("/list-appointments", authUser, listAppointments);
userRouter.post("/cancel-appointment", authUser, cancelAppointment);
userRouter.post("/pay-appointment", authUser, payAppointment);
userRouter.post("/rate-appointment", authUser, rateAppointment);

export default userRouter;
