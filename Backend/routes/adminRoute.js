import express from "express";
import {
  registerAdmin,
  addDoctor,
  deleteDoctor,
  loginAdmin,
  allDoctors,
  appointmentsAdmin,
  appointmentCancel,
  collectPaymentAdmin,
  adminDashboard,
} from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";
import { authAdmin } from "../middlewares/auth.js";
import { changeAvailability } from "../controllers/doctorController.js";

const adminRouter = express.Router();

// Admin Authentication
adminRouter.post("/register", registerAdmin);
adminRouter.post("/login", loginAdmin);

// Admin Management
adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);
adminRouter.post("/delete-doctor", authAdmin, deleteDoctor);
adminRouter.post("/remove-doctor", authAdmin, deleteDoctor);
adminRouter.get("/all-doctors", authAdmin, allDoctors);
adminRouter.post("/change-availability", authAdmin, changeAvailability);
adminRouter.get("/appointments", authAdmin, appointmentsAdmin);
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel);
adminRouter.post("/collect-payment", authAdmin, collectPaymentAdmin);
adminRouter.get("/dashboard", authAdmin, adminDashboard);

export default adminRouter;