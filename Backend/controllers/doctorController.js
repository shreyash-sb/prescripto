import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import appointmentModel from "../models/appointmentModel.js";
import { createToken } from "../utils/token.js";
import { AppError } from "../middlewares/errorHandler.js";

const DEFAULT_DOCTOR_AVATAR =
  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop";

/**
 * Doctor Self-Registration
 * POST /api/doctor/register
 */
export const registerDoctor = async (req, res, next) => {
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
      image,
    } = req.body;

    if (!name || !email || !password || !speciality || !degree || fees === undefined) {
      return next(
        new AppError(
          "Please fill in all required fields (name, email, password, speciality, degree, fees)",
          400
        )
      );
    }

    if (!validator.isEmail(email)) {
      return next(new AppError("Please enter a valid email address", 400));
    }

    if (password.length < 8) {
      return next(new AppError("Password must be at least 8 characters long", 400));
    }

    const exists = await doctorModel.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return next(new AppError("A doctor account with this email already exists", 409));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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
      password: hashedPassword,
      image: image || DEFAULT_DOCTOR_AVATAR,
      speciality: speciality || "General physician",
      degree: degree || "MBBS, MD",
      experience: experience || "3 Years",
      about:
        about ||
        `Dr. ${name} is a dedicated ${speciality} committed to providing high quality patient care.`,
      fees: Number(fees) || 50,
      address: parsedAddress,
      available: true,
      date: Date.now(),
      slots_booked: {},
    };

    const newDoctor = new doctorModel(doctorData);
    const savedDoctor = await newDoctor.save();

    const token = createToken({ id: savedDoctor._id.toString(), role: "doctor" });
    return res.status(201).json({
      success: true,
      message: "Doctor account created successfully",
      token,
      name: savedDoctor.name,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Doctor Login
 * POST /api/doctor/login
 */
export const loginDoctor = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError("Please provide both email and password", 400));
    }

    const doctor = await doctorModel.findOne({ email: email.toLowerCase().trim() });
    if (!doctor) {
      return next(new AppError("Invalid email or password credentials", 401));
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return next(new AppError("Invalid email or password credentials", 401));
    }

    const token = createToken({ id: doctor._id.toString(), role: "doctor" });
    return res.status(200).json({
      success: true,
      token,
      name: doctor.name,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Public Doctor Directory List (Safe projection)
 * GET /api/doctor/list
 */
export const doctorList = async (req, res, next) => {
  try {
    const doctors = await doctorModel
      .find({})
      .select("-password -email")
      .sort({ rating: -1 });

    return res.status(200).json({
      success: true,
      doctors,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle Doctor Availability Status (used by Admin or Doctor)
 * POST /api/doctor/change-availability
 */
export const changeAvailability = async (req, res, next) => {
  try {
    // If admin calls it, docId comes from body; if doctor calls it, docId comes from req.doctor._id
    const docId = req.doctor ? req.doctor._id : req.body.docId;
    if (!docId) {
      return next(new AppError("Doctor ID is required", 400));
    }

    const docData = await doctorModel.findById(docId);
    if (!docData) {
      return next(new AppError("Doctor not found in directory", 404));
    }

    await doctorModel.findByIdAndUpdate(docId, {
      available: !docData.available,
    });

    return res.status(200).json({
      success: true,
      message: `Availability status updated to ${!docData.available ? "Available" : "Unavailable"}`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all appointments assigned to the authenticated doctor
 * GET /api/doctor/appointments
 */
export const appointmentsDoctor = async (req, res, next) => {
  try {
    const docId = req.doctor._id;
    const appointments = await appointmentModel.find({ docId }).sort({ date: -1 });

    return res.status(200).json({
      success: true,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark consultation completed and save clinical prescription & notes
 * POST /api/doctor/complete-appointment
 */
export const appointmentComplete = async (req, res, next) => {
  try {
    const docId = req.doctor._id;
    const { appointmentId, prescription, diagnosisNotes } = req.body;

    if (!appointmentId) {
      return next(new AppError("Appointment ID is required", 400));
    }

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return next(new AppError("Appointment not found", 404));
    }

    if (appointmentData.docId.toString() !== docId.toString()) {
      return next(new AppError("Unauthorized: You are not assigned to this appointment", 403));
    }

    if (appointmentData.cancelled) {
      return next(new AppError("Cannot complete a cancelled appointment", 400));
    }

    if (appointmentData.isCompleted) {
      return next(new AppError("Appointment is already marked as completed", 400));
    }

    const updatedAppointment = await appointmentModel.findByIdAndUpdate(
      appointmentId,
      {
        isCompleted: true,
        prescription:
          prescription || "Prescription: Rest well, take prescribed vitamins and stay hydrated.",
        diagnosisNotes: diagnosisNotes || "General clinical checkup completed successfully.",
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Consultation marked completed and E-Prescription issued successfully",
      appointment: updatedAppointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel an appointment from doctor panel and release slot
 * POST /api/doctor/cancel-appointment
 */
export const appointmentCancel = async (req, res, next) => {
  try {
    const docId = req.doctor._id;
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return next(new AppError("Appointment ID is required", 400));
    }

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return next(new AppError("Appointment not found", 404));
    }

    if (appointmentData.docId.toString() !== docId.toString()) {
      return next(new AppError("Unauthorized action", 403));
    }

    if (appointmentData.cancelled || appointmentData.isCompleted) {
      return next(new AppError("This appointment can no longer be cancelled", 400));
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

    // Release doctor slot
    await doctorModel.findByIdAndUpdate(docId, {
      $pull: {
        [`slots_booked.${appointmentData.slotDate}`]: appointmentData.slotTime,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled and time slot released",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Record / Collect Cash or Offline Payment for an Appointment
 * POST /api/doctor/collect-payment
 */
export const collectPayment = async (req, res, next) => {
  try {
    const docId = req.doctor._id;
    const { appointmentId, paymentMethod } = req.body;

    if (!appointmentId) {
      return next(new AppError("Appointment ID is required", 400));
    }

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return next(new AppError("Appointment not found", 404));
    }

    if (appointmentData.docId.toString() !== docId.toString()) {
      return next(new AppError("Unauthorized action: not assigned to this doctor", 403));
    }

    if (appointmentData.cancelled) {
      return next(new AppError("Cannot record payment for a cancelled appointment", 400));
    }

    if (appointmentData.payment) {
      return next(new AppError("This consultation appointment is already marked as paid", 400));
    }

    const txnId =
      "CLINIC_CASH_" + Date.now() + "_" + Math.floor(1000 + Math.random() * 9000);

    const updatedAppointment = await appointmentModel.findByIdAndUpdate(
      appointmentId,
      {
        payment: true,
        paymentMethod: paymentMethod || "Cash Collected (Clinic)",
        paymentId: txnId,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Consultation payment collected and recorded successfully",
      paymentId: txnId,
      appointment: updatedAppointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get dashboard analytics for authenticated doctor
 * GET /api/doctor/dashboard
 */
export const doctorDashboard = async (req, res, next) => {
  try {
    const docId = req.doctor._id;
    const appointments = await appointmentModel.find({ docId }).sort({ date: -1 });

    let earnings = 0;
    const patientSet = new Set();

    appointments.forEach((item) => {
      if ((item.isCompleted || item.payment) && !item.cancelled) {
        earnings += item.amount;
      }
      if (!item.cancelled && item.userId) {
        patientSet.add(item.userId.toString());
      }
    });

    const dashData = {
      earnings,
      appointments: appointments.filter((item) => !item.cancelled).length,
      patients: patientSet.size,
      latestAppointments: appointments.slice(0, 5),
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
 * Get authenticated doctor profile details
 * GET /api/doctor/profile
 */
export const doctorProfile = async (req, res, next) => {
  try {
    const docId = req.doctor._id;
    const profileData = await doctorModel.findById(docId).select("-password");

    if (!profileData) {
      return next(new AppError("Doctor profile not found", 404));
    }

    return res.status(200).json({
      success: true,
      profileData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update authenticated doctor profile
 * POST /api/doctor/update-profile
 */
export const updateDoctorProfile = async (req, res, next) => {
  try {
    const docId = req.doctor._id;
    const { fees, address, available, about, shifts, slotDuration, vacationDates } = req.body;

    if (fees !== undefined && (!Number.isFinite(Number(fees)) || Number(fees) < 0)) {
      return next(new AppError("Please provide a valid consultation fee", 400));
    }

    const updateFields = {};
    if (fees !== undefined) updateFields.fees = Number(fees);
    if (address !== undefined) updateFields.address = address;
    if (available !== undefined) updateFields.available = Boolean(available);
    if (about !== undefined) updateFields.about = about.trim();
    if (shifts !== undefined) updateFields.shifts = shifts;
    if (slotDuration !== undefined) updateFields.slotDuration = Number(slotDuration) || 30;
    if (vacationDates !== undefined) updateFields.vacationDates = Array.isArray(vacationDates) ? vacationDates : [];

    const updatedProfile = await doctorModel
      .findByIdAndUpdate(docId, updateFields, { new: true })
      .select("-password");

    return res.status(200).json({
      success: true,
      message: "Doctor profile and practice schedule updated successfully",
      profileData: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  registerDoctor,
  loginDoctor,
  doctorList,
  changeAvailability,
  appointmentsDoctor,
  appointmentComplete,
  appointmentCancel,
  collectPayment,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
};
