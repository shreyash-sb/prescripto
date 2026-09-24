import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import adminModel from "../models/adminModel.js";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";
import { createToken } from "../utils/token.js";
import { AppError } from "../middlewares/errorHandler.js";

const DEFAULT_DOCTOR_AVATAR =
  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop";

/**
 * Register a new Hospital Administrator
 * POST /api/admin/register
 */
export const registerAdmin = async (req, res, next) => {
  try {
    const { name, email, password, secretCode } = req.body;

    if (!name || !email || !password) {
      return next(new AppError("Please provide name, email, and password", 400));
    }

    if (!validator.isEmail(email)) {
      return next(new AppError("Please enter a valid email address", 400));
    }

    if (password.length < 8) {
      return next(new AppError("Password must be at least 8 characters long", 400));
    }

    // Passkey verification (from environment or default fallback)
    const validSecret = process.env.ADMIN_SECRET_KEY || "ADMIN123";
    const existingAdminsCount = await adminModel.countDocuments();
    if (existingAdminsCount > 0 && secretCode !== validSecret) {
      return next(new AppError("Invalid Admin Passkey. Hint: default is ADMIN123", 403));
    }

    const exists = await adminModel.findOne({ email: email.toLowerCase() });
    if (exists) {
      return next(new AppError("An administrator account with this email already exists", 409));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new adminModel({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "admin",
    });

    await newAdmin.save();

    const token = createToken({ id: newAdmin._id.toString(), role: "admin" });
    return res.status(201).json({
      success: true,
      message: "Admin account created successfully",
      token,
      name: newAdmin.name,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Hospital Administrator Login
 * POST /api/admin/login
 */
export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Please provide both email and password", 400));
    }

    // 1. Check database-stored admin
    const dbAdmin = await adminModel.findOne({ email: email.toLowerCase().trim() });
    if (dbAdmin) {
      const isMatch = await bcrypt.compare(password, dbAdmin.password);
      if (isMatch) {
        const token = createToken({ id: dbAdmin._id.toString(), role: "admin" });
        return res.status(200).json({
          success: true,
          token,
          name: dbAdmin.name,
        });
      }
    }

    // 2. Check environment variable fallback
    const envAdminEmail = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase().trim();
    const envAdminPassword = process.env.ADMIN_PASSWORD || "admin12345";

    if (email.toLowerCase().trim() === envAdminEmail && password === envAdminPassword) {
      const token = createToken({
        id: "super_admin_env",
        role: "admin",
      });
      return res.status(200).json({
        success: true,
        token,
        name: "Super Admin",
      });
    }

    return next(new AppError("Invalid email or password credentials", 401));
  } catch (error) {
    next(error);
  }
};

/**
 * Add a new Doctor (with image upload)
 * POST /api/admin/add-doctor
 */
export const addDoctor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;
    const imageFile = req.file;

    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      fees === undefined ||
      !address
    ) {
      return next(new AppError("Please fill in all required doctor profile fields", 400));
    }

    if (!validator.isEmail(email)) {
      return next(new AppError("Please enter a valid email address", 400));
    }

    if (password.length < 8) {
      return next(new AppError("Password must be at least 8 characters long", 400));
    }

    const exists = await doctorModel.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return next(new AppError("A doctor with this email is already registered", 409));
    }

    // Password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Upload image to Cloudinary or use fallback avatar
    let imageUrl = DEFAULT_DOCTOR_AVATAR;
    if (imageFile) {
      try {
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
          folder: "prescripto/doctors",
          resource_type: "image",
        });
        if (imageUpload && imageUpload.secure_url) {
          imageUrl = imageUpload.secure_url;
        }
      } catch (uploadError) {
        console.warn("Cloudinary upload failed, using fallback avatar:", uploadError.message);
      }
    }

    let parsedAddress = { line1: "Clinic Address", line2: "City, State" };
    if (typeof address === "string") {
      try {
        parsedAddress = JSON.parse(address);
      } catch (e) {
        parsedAddress = { line1: address, line2: "" };
      }
    } else if (address) {
      parsedAddress = address;
    }

    const doctorData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      image: imageUrl,
      password: hashedPassword,
      speciality: speciality.trim(),
      degree: degree.trim(),
      experience: experience.trim(),
      about: about.trim(),
      fees: Number(fees),
      address: parsedAddress,
      available: true,
      date: Date.now(),
      slots_booked: {},
    };

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    return res.status(201).json({
      success: true,
      message: "Doctor added to hospital directory successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all doctors for admin roster management
 * GET /api/admin/all-doctors
 */
export const allDoctors = async (req, res, next) => {
  try {
    const doctors = await doctorModel.find({}).select("-password").sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      doctors,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all hospital appointments
 * GET /api/admin/appointments
 */
export const appointmentsAdmin = async (req, res, next) => {
  try {
    const appointments = await appointmentModel.find({}).sort({ date: -1 });
    return res.status(200).json({
      success: true,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel an appointment from admin panel and release doctor slot
 * POST /api/admin/cancel-appointment
 */
export const appointmentCancel = async (req, res, next) => {
  try {
    const { appointmentId } = req.body;
    if (!appointmentId) {
      return next(new AppError("Appointment ID is required", 400));
    }

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return next(new AppError("Appointment not found", 404));
    }

    if (appointmentData.cancelled || appointmentData.isCompleted) {
      return next(new AppError("This appointment is already completed or cancelled", 400));
    }

    // Mark as cancelled
    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

    // Release doctor's booked time slot
    const { docId, slotDate, slotTime } = appointmentData;
    await doctorModel.findByIdAndUpdate(docId, {
      $pull: { [`slots_booked.${slotDate}`]: slotTime },
    });

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled and doctor slot released",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Record / Collect Payment by Hospital Administrator
 * POST /api/admin/collect-payment
 */
export const collectPaymentAdmin = async (req, res, next) => {
  try {
    const { appointmentId, paymentMethod } = req.body;
    if (!appointmentId) {
      return next(new AppError("Appointment ID is required", 400));
    }

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return next(new AppError("Appointment not found", 404));
    }

    if (appointmentData.cancelled) {
      return next(new AppError("Cannot record payment for a cancelled appointment", 400));
    }

    if (appointmentData.payment) {
      return next(new AppError("This consultation appointment is already marked as paid", 400));
    }

    const txnId =
      "ADMIN_REC_" + Date.now() + "_" + Math.floor(1000 + Math.random() * 9000);

    const updatedAppointment = await appointmentModel.findByIdAndUpdate(
      appointmentId,
      {
        payment: true,
        paymentMethod: paymentMethod || "Verified by Admin",
        paymentId: txnId,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Consultation payment verified and recorded successfully",
      paymentId: txnId,
      appointment: updatedAppointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get live hospital operations dashboard analytics
 * GET /api/admin/dashboard
 */
export const adminDashboard = async (req, res, next) => {
  try {
    const [doctorsCount, usersCount, appointments] = await Promise.all([
      doctorModel.countDocuments(),
      userModel.countDocuments(),
      appointmentModel.find({}).sort({ date: -1 }),
    ]);

    const activeAppointments = appointments.filter((item) => !item.cancelled);

    let totalRevenue = 0;
    let paidCount = 0;
    let pendingPaymentCount = 0;

    appointments.forEach((item) => {
      if (!item.cancelled) {
        if (item.payment || item.isCompleted) {
          totalRevenue += item.amount || 0;
        }
        if (item.payment) {
          paidCount += 1;
        } else {
          pendingPaymentCount += 1;
        }
      }
    });

    const dashData = {
      doctors: doctorsCount,
      appointments: activeAppointments.length,
      patients: usersCount,
      totalRevenue,
      paidCount,
      pendingPaymentCount,
      latest_appointments: appointments.slice(0, 5),
    };

    return res.status(200).json({
      success: true,
      dashData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove / Delete a Doctor from Hospital Staff Directory
 * POST /api/admin/delete-doctor
 */
export const deleteDoctor = async (req, res, next) => {
  try {
    const { docId } = req.body;
    if (!docId) {
      return next(new AppError("Doctor ID is required", 400));
    }

    const doctor = await doctorModel.findById(docId);
    if (!doctor) {
      return next(new AppError("Doctor not found in directory", 404));
    }

    await doctorModel.findByIdAndDelete(docId);

    // Cancel any active/pending appointments for this doctor to avoid stale booking conflicts
    await appointmentModel.updateMany(
      { docId: docId.toString(), isCompleted: false, cancelled: false },
      { $set: { cancelled: true } }
    );

    return res.status(200).json({
      success: true,
      message: `Dr. ${doctor.name} has been removed from the hospital staff directory`,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  registerAdmin,
  loginAdmin,
  addDoctor,
  deleteDoctor,
  allDoctors,
  appointmentsAdmin,
  appointmentCancel,
  collectPaymentAdmin,
  adminDashboard,
};

