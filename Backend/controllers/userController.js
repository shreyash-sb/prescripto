import validator from "validator";
import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { createToken } from "../utils/token.js";
import { AppError } from "../middlewares/errorHandler.js";

/**
 * Register a new Patient User
 * POST /api/user/register
 */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(new AppError("Please provide name, email, and password", 400));
    }

    if (!validator.isEmail(email)) {
      return next(new AppError("Please enter a valid email address", 400));
    }

    if (password.length < 8) {
      return next(new AppError("Password must be at least 8 characters long", 400));
    }

    const exists = await userModel.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return next(new AppError("A user account with this email already exists", 409));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    const user = await newUser.save();

    const token = createToken({ id: user._id.toString(), role: "user" });
    return res.status(201).json({
      success: true,
      message: "Patient account created successfully",
      token,
      name: user.name,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Patient User Login
 * POST /api/user/login
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Please provide both email and password", 400));
    }

    const user = await userModel.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return next(new AppError("Invalid email or password credentials", 401));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new AppError("Invalid email or password credentials", 401));
    }

    const token = createToken({ id: user._id.toString(), role: "user" });
    return res.status(200).json({
      success: true,
      token,
      name: user.name,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Authenticated Patient Profile Data
 * GET /api/user/get-profile
 */
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userData = await userModel.findById(userId).select("-password");

    if (!userData) {
      return next(new AppError("User profile not found", 404));
    }

    return res.status(200).json({
      success: true,
      userData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Patient Profile Data
 * POST /api/user/update-profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) {
      return next(new AppError("Please provide name, phone, dob, and gender", 400));
    }

    let parsedAddress = { line1: "", line2: "" };
    if (typeof address === "string") {
      try {
        parsedAddress = JSON.parse(address);
      } catch (e) {
        parsedAddress = { line1: address, line2: "" };
      }
    } else if (address) {
      parsedAddress = address;
    }

    const updateFields = {
      name: name.trim(),
      phone: phone.trim(),
      address: parsedAddress,
      dob,
      gender,
    };

    if (imageFile) {
      try {
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
          folder: "prescripto/patients",
          resource_type: "image",
        });
        if (imageUpload && imageUpload.secure_url) {
          updateFields.image = imageUpload.secure_url;
        }
      } catch (uploadError) {
        console.warn("Cloudinary patient image upload failed:", uploadError.message);
      }
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(userId, updateFields, { new: true })
      .select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      userData: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Book Doctor Appointment with Atomic Double-Booking Prevention
 * POST /api/user/book-appointment
 */
export const bookAppointment = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { docId, slotDate, slotTime } = req.body;

    if (!docId || !slotTime || !/^\d{1,2}_\d{1,2}_\d{4}$/.test(slotDate || "")) {
      return next(new AppError("Invalid doctor or appointment slot parameters", 400));
    }

    const userData = await userModel.findById(userId).select("-password").lean();
    if (!userData) {
      return next(new AppError("User account not found", 404));
    }

    // Check if doctor is on scheduled leave / vacation on this date
    const targetDateFormatted = slotDate.replace(/_/g, "-");
    const rawDoctor = await doctorModel.findById(docId).select("vacationDates available");
    if (
      rawDoctor?.vacationDates &&
      (rawDoctor.vacationDates.includes(slotDate) ||
        rawDoctor.vacationDates.includes(targetDateFormatted))
    ) {
      return next(
        new AppError(
          "The doctor is currently on scheduled leave/vacation on this selected date. Please choose another date.",
          400
        )
      );
    }

    // Atomic slot booking in MongoDB to prevent race conditions & double-booking
    const slotPath = `slots_booked.${slotDate}`;
    const docData = await doctorModel
      .findOneAndUpdate(
        {
          _id: docId,
          available: true,
          [slotPath]: { $ne: slotTime },
        },
        { $push: { [slotPath]: slotTime } },
        { new: true }
      )
      .select("-password")
      .lean();

    if (!docData) {
      return next(
        new AppError(
          "Doctor is currently unavailable or this time slot was just booked by another patient",
          409
        )
      );
    }

    const { slots_booked, ...doctorSnapshot } = docData;
    const appointmentData = {
      userId,
      docId,
      userData: {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        dob: userData.dob,
        gender: userData.gender,
        image: userData.image,
        address: userData.address,
      },
      docData: {
        _id: doctorSnapshot._id,
        name: doctorSnapshot.name,
        speciality: doctorSnapshot.speciality,
        degree: doctorSnapshot.degree,
        fees: doctorSnapshot.fees,
        address: doctorSnapshot.address,
        image: doctorSnapshot.image,
      },
      amount: doctorSnapshot.fees,
      slotTime,
      slotDate,
      date: Date.now(),
      payment: false,
      paymentMethod: "Pending",
    };

    let savedAppointment;
    try {
      const newAppointment = new appointmentModel(appointmentData);
      savedAppointment = await newAppointment.save();
    } catch (saveError) {
      // Roll back slot reservation if appointment document creation fails
      await doctorModel.findByIdAndUpdate(docId, { $pull: { [slotPath]: slotTime } });
      throw saveError;
    }

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment: savedAppointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all appointments for the authenticated patient
 * GET /api/user/list-appointments
 */
export const listAppointments = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const appointments = await appointmentModel.find({ userId }).sort({ date: -1 });

    return res.status(200).json({
      success: true,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel an appointment and release doctor slot
 * POST /api/user/cancel-appointment
 */
export const cancelAppointment = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return next(new AppError("Appointment ID is required", 400));
    }

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return next(new AppError("Appointment not found", 404));
    }

    if (appointmentData.userId.toString() !== userId.toString()) {
      return next(new AppError("Unauthorized action", 403));
    }

    if (appointmentData.cancelled || appointmentData.isCompleted) {
      return next(new AppError("This appointment can no longer be cancelled", 400));
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

    // Release doctor's slot
    const { docId, slotDate, slotTime } = appointmentData;
    await doctorModel.findByIdAndUpdate(docId, {
      $pull: { [`slots_booked.${slotDate}`]: slotTime },
    });

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully and slot released",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Simulate Payment for Consultation (Card, UPI QR, or Cash on Visit)
 * POST /api/user/pay-appointment
 */
export const payAppointment = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { appointmentId, paymentMethod } = req.body;

    if (!appointmentId) {
      return next(new AppError("Appointment ID is required", 400));
    }

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return next(new AppError("Appointment not found", 404));
    }

    if (appointmentData.userId.toString() !== userId.toString()) {
      return next(new AppError("Unauthorized action", 403));
    }

    if (appointmentData.cancelled) {
      return next(new AppError("Cannot pay for a cancelled appointment", 400));
    }

    if (appointmentData.payment) {
      return next(new AppError("This consultation appointment has already been paid", 400));
    }

    const generatedTxnId =
      "TXN_" + Date.now() + "_" + Math.floor(1000 + Math.random() * 9000);

    const updatedAppointment = await appointmentModel.findByIdAndUpdate(
      appointmentId,
      {
        payment: true,
        paymentMethod: paymentMethod || "Online Card",
        paymentId: generatedTxnId,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Payment processed and verified successfully",
      paymentId: generatedTxnId,
      appointment: updatedAppointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Rate and Review Completed Consultation
 * POST /api/user/rate-appointment
 */
export const rateAppointment = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { appointmentId, rating, review } = req.body;

    if (!appointmentId) {
      return next(new AppError("Appointment ID is required", 400));
    }

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return next(new AppError("Appointment not found", 404));
    }

    if (appointmentData.userId.toString() !== userId.toString()) {
      return next(new AppError("Unauthorized action", 403));
    }

    if (!appointmentData.isCompleted) {
      return next(new AppError("You can only rate completed consultations", 400));
    }

    const numericRating = Math.max(1, Math.min(5, Number(rating) || 5));

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      rating: numericRating,
      review: review ? review.trim() : "Great consultation!",
    });

    // Recompute doctor's aggregate average rating
    const docAppointments = await appointmentModel.find({
      docId: appointmentData.docId,
      rating: { $gt: 0 },
    });

    if (docAppointments.length > 0) {
      const avgRating =
        docAppointments.reduce((acc, curr) => acc + curr.rating, 0) /
        docAppointments.length;

      await doctorModel.findByIdAndUpdate(appointmentData.docId, {
        rating: Number(avgRating.toFixed(1)),
        ratingsCount: docAppointments.length,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Thank you! Doctor rating and feedback saved successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export default {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointments,
  cancelAppointment,
  payAppointment,
  rateAppointment,
};
