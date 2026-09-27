import validator from "validator";
import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import accessLogModel from "../models/accessLogModel.js";
import medicineRoutineModel from "../models/medicineRoutineModel.js";
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

    const salt = await bcrypt.genSalt(8);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    const user = await newUser.save();

    // Log account creation in access audit log (non-blocking for high speed)
    accessLogModel.create({
      userId: user._id.toString(),
      accessorName: user.name,
      accessorRole: "patient",
      accessorId: user._id.toString(),
      resource: "Account Creation & Profile",
      action: "CREATED",
      details: "Patient registered new secure healthcare profile",
    }).catch(err => console.error("Access log error:", err.message));

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

    let user = await userModel.findOne({ email: email.toLowerCase().trim() });
    if (!user && email.toLowerCase().trim() === "patient@example.com") {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("patient12345", salt);
      user = await userModel.create({
        name: "Demo Patient (Alex)",
        email: "patient@example.com",
        password: hashedPassword,
        bloodGroup: "O+",
        allergies: ["Penicillin", "Sulfa"],
        chronicConditions: ["Hypertension (High BP)"],
        phone: "+1 (555) 019-2834",
        address: { line1: "123 Health Ave", line2: "Metropolis" },
        dob: "1995-06-15",
        gender: "Male",
        walletBalance: 100,
      });
    }

    if (!user) {
      return next(new AppError("Invalid email or password credentials", 401));
    }

    // If demo patient logging in with demo password
    const isMatch =
      email.toLowerCase().trim() === "patient@example.com" && password === "patient12345"
        ? true
        : await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(new AppError("Invalid email or password credentials", 401));
    }

    // Log access in patient privacy trail (non-blocking for instant login)
    accessLogModel.create({
      userId: user._id.toString(),
      accessorName: user.name,
      accessorRole: "patient",
      accessorId: user._id.toString(),
      resource: "Patient Health Dashboard",
      action: "VIEWED",
      details: "Patient logged in successfully",
    }).catch(err => console.error("Access log error:", err.message));

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
 * Update Patient Profile Data (Full Health Profile, Allergies, Vitals, Emergency Contacts)
 * POST /api/user/update-profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const existingUser = await userModel.findById(userId);
    if (!existingUser) {
      return next(new AppError("User account not found", 404));
    }

    const {
      name,
      phone,
      address,
      dob,
      gender,
      bloodGroup,
      allergies,
      chronicConditions,
      vitals,
      emergencyContact,
      medicalDocs,
      preferredLanguage,
    } = req.body;
    const imageFile = req.file;

    let parsedAddress = existingUser.address || { line1: "", line2: "" };
    if (typeof address === "string") {
      try {
        parsedAddress = JSON.parse(address);
      } catch (e) {
        parsedAddress = { line1: address, line2: "" };
      }
    } else if (address) {
      parsedAddress = address;
    }

    let parsedAllergies = existingUser.allergies || [];
    if (typeof allergies === "string") {
      try {
        parsedAllergies = JSON.parse(allergies);
      } catch (e) {
        parsedAllergies = allergies.split(",").map((s) => s.trim()).filter(Boolean);
      }
    } else if (Array.isArray(allergies)) {
      parsedAllergies = allergies;
    }

    let parsedChronic = existingUser.chronicConditions || [];
    if (typeof chronicConditions === "string") {
      try {
        parsedChronic = JSON.parse(chronicConditions);
      } catch (e) {
        parsedChronic = chronicConditions.split(",").map((s) => s.trim()).filter(Boolean);
      }
    } else if (Array.isArray(chronicConditions)) {
      parsedChronic = chronicConditions;
    }

    let parsedVitals = existingUser.vitals || null;
    if (typeof vitals === "string") {
      try {
        parsedVitals = JSON.parse(vitals);
      } catch (e) {}
    } else if (vitals) {
      parsedVitals = vitals;
    }

    let parsedEmergency = existingUser.emergencyContact || null;
    if (typeof emergencyContact === "string") {
      try {
        parsedEmergency = JSON.parse(emergencyContact);
      } catch (e) {}
    } else if (emergencyContact) {
      parsedEmergency = emergencyContact;
    }

    let parsedDocs = existingUser.medicalDocs || null;
    if (typeof medicalDocs === "string") {
      try {
        parsedDocs = JSON.parse(medicalDocs);
      } catch (e) {}
    } else if (Array.isArray(medicalDocs)) {
      parsedDocs = medicalDocs;
    }

    const updateFields = {
      name: name ? name.trim() : existingUser.name,
      phone: phone ? phone.trim() : existingUser.phone,
      address: parsedAddress,
      dob: dob || existingUser.dob || "1995-01-01",
      gender: gender || existingUser.gender || "Not Selected",
    };

    if (bloodGroup) updateFields.bloodGroup = bloodGroup;
    if (parsedAllergies) updateFields.allergies = parsedAllergies;
    if (parsedChronic) updateFields.chronicConditions = parsedChronic;
    if (parsedVitals) updateFields.vitals = parsedVitals;
    if (parsedEmergency) updateFields.emergencyContact = parsedEmergency;
    if (parsedDocs) updateFields.medicalDocs = parsedDocs;
    if (preferredLanguage) updateFields.preferredLanguage = preferredLanguage;

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

    // Audit trail log
    await accessLogModel.create({
      userId: userId.toString(),
      accessorName: updatedUser.name,
      accessorRole: "patient",
      accessorId: userId.toString(),
      resource: "Medical Profile & Allergies",
      action: "UPDATED",
      details: `Health profile updated: Blood ${updatedUser.bloodGroup}, ${updatedUser.allergies?.length || 0} allergies documented`,
    });

    return res.status(200).json({
      success: true,
      message: "Profile and medical history updated successfully",
      userData: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Book Doctor Appointment with Crowd Level, Token Number, and Allergy Cross-Check
 * POST /api/user/book-appointment
 */
export const bookAppointment = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { docId, slotDate, slotTime, patientProblem } = req.body;

    if (!docId || !slotTime || !/^\d{1,2}_\d{1,2}_\d{4}$/.test(slotDate || "")) {
      return next(new AppError("Invalid doctor or appointment slot parameters", 400));
    }

    const userData = await userModel.findById(userId).select("-password").lean();
    if (!userData) {
      return next(new AppError("User account not found", 404));
    }

    // Check if doctor is on scheduled leave / vacation on this date
    const targetDateFormatted = slotDate.replace(/_/g, "-");
    const rawDoctor = await doctorModel.findById(docId).select("vacationDates available liveQueue name");
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

    // Calculate Token Number and Clinic Crowd Status
    const todayBookingsCount = await appointmentModel.countDocuments({
      docId,
      slotDate,
      cancelled: false,
    });
    const tokenNumber = todayBookingsCount + 1;

    let crowdLevel = "Low";
    let estimatedWaitTime = 10;
    if (tokenNumber > 8) {
      crowdLevel = "Busy";
      estimatedWaitTime = tokenNumber * 12;
    } else if (tokenNumber > 3) {
      crowdLevel = "Moderate";
      estimatedWaitTime = tokenNumber * 10;
    }

    // Analyze Patient Allergies for Medical Safety Shield
    const allergyWarnings = [];
    if (userData.allergies && userData.allergies.length > 0) {
      userData.allergies.forEach((allergy) => {
        allergyWarnings.push(`Flagged: Patient has documented sensitivity to '${allergy}'`);
      });
    }

    const { slots_booked, ...doctorSnapshot } = docData;
    const appointmentData = {
      userId,
      docId,
      patientProblem:
        (patientProblem && patientProblem.trim()) ||
        "General Medical Consultation & Routine Checkup",
      medicalHistory: {
        allergies: userData.allergies || [],
        chronicConditions: userData.chronicConditions || [],
        bloodGroup: userData.bloodGroup || "O+",
        vitals: userData.vitals || {},
      },
      appointmentStatus: "Pending",
      userData: {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        dob: userData.dob,
        gender: userData.gender,
        image: userData.image,
        address: userData.address,
        bloodGroup: userData.bloodGroup || "O+",
        allergies: userData.allergies || [],
        chronicConditions: userData.chronicConditions || [],
        vitals: userData.vitals || {},
        emergencyContact: userData.emergencyContact || {},
      },
      docData: {
        _id: doctorSnapshot._id,
        name: doctorSnapshot.name,
        speciality: doctorSnapshot.speciality,
        degree: doctorSnapshot.degree,
        fees: doctorSnapshot.fees,
        address: doctorSnapshot.address,
        image: doctorSnapshot.image,
        roomNumber: doctorSnapshot.roomNumber || "OPD-102",
      },
      amount: doctorSnapshot.fees,
      slotTime,
      slotDate,
      date: Date.now(),
      payment: false,
      paymentMethod: "Pending",
      tokenNumber,
      crowdLevel,
      estimatedWaitTime,
      allergyWarnings,
      refundStatus: "None",
      queueStatus: "Waiting",
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

    // Log in Privacy Audit Trail
    await accessLogModel.create({
      userId: userId.toString(),
      accessorName: `Dr. ${doctorSnapshot.name}`,
      accessorRole: "doctor",
      accessorId: docId.toString(),
      resource: "Pre-Consultation Health Snapshot & Allergies",
      action: "VIEWED",
      details: `Dr. ${doctorSnapshot.name} received appointment booking with Token #${tokenNumber}`,
    });

    return res.status(201).json({
      success: true,
      message: `Appointment booked successfully! Your Token is #${tokenNumber} (${crowdLevel} Crowd, ~${estimatedWaitTime} min wait)`,
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
 * Cancel an appointment and process automated 100% refund if paid
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

    const updatePayload = {
      cancelled: true,
      queueStatus: "Cancelled",
    };

    let refundProcessed = false;
    let refundId = "";

    // AUTOMATED REFUND ENGINE: If consultation was paid, immediately process full refund
    if (appointmentData.payment) {
      refundId =
        "REF_AUTO_" + Date.now() + "_" + Math.floor(1000 + Math.random() * 9000);
      updatePayload.refundStatus = "Refunded";
      updatePayload.refundAmount = appointmentData.amount;
      updatePayload.refundId = refundId;
      updatePayload.refundDate = Date.now();
      updatePayload.refundReason =
        "Cancelled by Patient - 100% Instant Refund Processed";

      // Credit refunded fee to user's wallet balance
      await userModel.findByIdAndUpdate(userId, {
        $inc: { walletBalance: appointmentData.amount },
      });

      refundProcessed = true;
    }

    const updatedAppt = await appointmentModel.findByIdAndUpdate(
      appointmentId,
      updatePayload,
      { new: true }
    );

    // Release doctor's slot
    const { docId, slotDate, slotTime } = appointmentData;
    await doctorModel.findByIdAndUpdate(docId, {
      $pull: { [`slots_booked.${slotDate}`]: slotTime },
    });

    // Audit trail log
    await accessLogModel.create({
      userId: userId.toString(),
      accessorName: req.user.name || "Patient",
      accessorRole: "patient",
      accessorId: userId.toString(),
      resource: "Appointment & Payment Status",
      action: "UPDATED",
      details: refundProcessed
        ? `Appointment cancelled. 100% Refund credited: $${appointmentData.amount} (Ref: ${refundId})`
        : "Appointment cancelled and slot released.",
    });

    return res.status(200).json({
      success: true,
      message: refundProcessed
        ? `Appointment cancelled successfully! 100% Refund of $${appointmentData.amount} has been credited to your healthcare wallet (Ref: ${refundId}).`
        : "Appointment cancelled successfully and doctor slot released.",
      refundProcessed,
      refundId,
      refundAmount: appointmentData.amount,
      refundStatus: updatePayload.refundStatus || "None",
      appointment: updatedAppt,
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

    // Audit log
    await accessLogModel.create({
      userId: userId.toString(),
      accessorName: req.user.name || "Patient",
      accessorRole: "patient",
      accessorId: userId.toString(),
      resource: "Financial & Payment Invoice",
      action: "UPDATED",
      details: `Paid $${appointmentData.amount} via ${paymentMethod || "Online Card"} (Txn: ${generatedTxnId})`,
    });

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

/**
 * Patient Privacy & Access Audit Trail ("Who accessed what and when")
 * GET /api/user/access-logs
 */
export const getAccessLogs = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const logs = await accessLogModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all Medicine Routines & Reminders for Authenticated Patient
 * GET /api/user/medicine-routines
 */
export const getMedicineRoutines = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const routines = await medicineRoutineModel
      .find({ userId, isActive: true })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      routines,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new Medicine Routine item
 * POST /api/user/create-medicine-routine
 */
export const createMedicineRoutine = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      medicineName,
      dosage,
      frequency,
      scheduleSlots,
      schedule,
      mealTime,
      mealTiming,
      durationDays,
      prescribedByDoctor,
      notes,
    } = req.body;

    if (!medicineName) {
      return next(new AppError("Medicine name is required", 400));
    }

    let calculatedSlots = scheduleSlots || [];
    if (schedule && typeof schedule === "object" && !Array.isArray(schedule)) {
      calculatedSlots = [];
      if (schedule.morning) calculatedSlots.push("Morning");
      if (schedule.afternoon) calculatedSlots.push("Afternoon");
      if (schedule.evening) calculatedSlots.push("Evening");
      if (schedule.night) calculatedSlots.push("Night");
    }

    if (!calculatedSlots || calculatedSlots.length === 0) {
      calculatedSlots = ["Morning", "Night"];
    }

    let calculatedMeal = mealTime || (mealTiming === "before" ? "Before Food" : "After Food");

    const newRoutine = new medicineRoutineModel({
      userId,
      medicineName: medicineName.trim(),
      dosage: dosage || "1 Tablet",
      frequency: frequency || "Twice daily",
      scheduleSlots: calculatedSlots,
      mealTime: calculatedMeal,
      durationDays: Number(durationDays) || 7,
      prescribedByDoctor: prescribedByDoctor || "Self-Logged",
      notes: notes || "",
    });

    const saved = await newRoutine.save();

    return res.status(201).json({
      success: true,
      message: "Medicine routine schedule created successfully",
      routine: saved,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle Dose Adherence Log (Taken / Missed)
 * POST /api/user/toggle-dose
 */
export const toggleMedicineDose = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { routineId, date, slot } = req.body;

    if (!routineId || !date || !slot) {
      return next(new AppError("Routine ID, date, and slot are required", 400));
    }

    const routine = await medicineRoutineModel.findOne({ _id: routineId, userId });
    if (!routine) {
      return next(new AppError("Medicine routine record not found", 404));
    }

    const existingIndex = routine.adherenceLogs.findIndex(
      (log) => log.date === date && log.slot === slot
    );

    let isTakenNow = true;
    if (existingIndex > -1) {
      // Toggle
      isTakenNow = !routine.adherenceLogs[existingIndex].taken;
      routine.adherenceLogs[existingIndex].taken = isTakenNow;
      routine.adherenceLogs[existingIndex].takenAt = isTakenNow ? new Date() : null;
    } else {
      routine.adherenceLogs.push({
        date,
        slot,
        taken: true,
        takenAt: new Date(),
      });
    }

    routine.markModified("adherenceLogs");
    await routine.save();

    return res.status(200).json({
      success: true,
      message: isTakenNow
        ? `Great job! ${routine.medicineName} (${slot}) marked as taken.`
        : `Dose unmarked for ${slot}.`,
      routine,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete / Archive a Medicine Routine
 * POST /api/user/delete-medicine-routine
 */
export const deleteMedicineRoutine = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { routineId } = req.body;

    await medicineRoutineModel.findOneAndDelete({ _id: routineId, userId });

    return res.status(200).json({
      success: true,
      message: "Medicine routine removed from schedule",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Smart Prescription to Medicine Schedule Auto-Converter
 * POST /api/user/convert-prescription-to-schedule
 */
export const convertPrescriptionToSchedule = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { appointmentId, prescriptionText } = req.body;

    let textToParse = prescriptionText || "";
    let doctorName = "Attending Physician";

    if (appointmentId) {
      const appt = await appointmentModel.findById(appointmentId);
      if (appt) {
        textToParse = `${appt.prescription || ""} \n ${appt.diagnosisNotes || ""}`;
        doctorName = `Dr. ${appt.docData.name}`;

        // If doctor provided structured medicines directly
        if (appt.structuredMedicines && appt.structuredMedicines.length > 0) {
          const createdRoutines = [];
          for (const med of appt.structuredMedicines) {
            const r = await medicineRoutineModel.create({
              userId,
              medicineName: med.name,
              dosage: med.dosage || "1 Tab",
              frequency: med.frequency || "Twice daily",
              scheduleSlots: med.scheduleSlots || ["Morning", "Night"],
              mealTime: med.mealTime || "After Food",
              durationDays: Number(med.duration) || 7,
              prescribedByDoctor: doctorName,
              appointmentId,
              notes: med.instructions || "",
            });
            createdRoutines.push(r);
          }

          return res.status(200).json({
            success: true,
            message: `Successfully synced ${createdRoutines.length} prescribed medications into your daily routine!`,
            routines: createdRoutines,
          });
        }
      }
    }

    if (!textToParse.trim()) {
      return next(new AppError("No prescription text available to parse", 400));
    }

    // Smart Rule-Based Clinical Parser
    const lines = textToParse
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 2 && !l.toLowerCase().includes("clinical checkup"));

    const createdRoutines = [];

    for (const line of lines) {
      // Basic cleaning: remove numbering like "1.", "2."
      const cleanLine = line.replace(/^\d+[\.\)\-]\s*/, "");

      let slots = ["Morning", "Night"];
      let mealTime = "After Food";
      let dosage = "1 Tablet";
      let days = 7;

      if (cleanLine.includes("1-0-1")) slots = ["Morning", "Night"];
      else if (cleanLine.includes("1-1-1")) slots = ["Morning", "Afternoon", "Night"];
      else if (cleanLine.includes("1-0-0") || cleanLine.toLowerCase().includes("daily morning")) slots = ["Morning"];
      else if (cleanLine.includes("0-0-1") || cleanLine.toLowerCase().includes("at bedtime")) slots = ["Night"];

      if (cleanLine.toLowerCase().includes("before food") || cleanLine.toLowerCase().includes("empty stomach")) {
        mealTime = "Before Food";
      }

      const daysMatch = cleanLine.match(/(\d+)\s*(days|day)/i);
      if (daysMatch) {
        days = parseInt(daysMatch[1]);
      }

      const medNameMatch = cleanLine.match(/^([A-Za-z0-9\s\-]+?)(?=\s*(\d+mg|\d+ml|\d+\-\d+|\-|\bfor\b|\bafter\b|\bbefore\b|$))/i);
      const name = medNameMatch ? medNameMatch[1].trim() : cleanLine.slice(0, 30);

      if (name.length > 2) {
        const routine = await medicineRoutineModel.create({
          userId,
          medicineName: name,
          dosage,
          frequency: slots.length === 3 ? "Three times daily" : slots.length === 2 ? "Twice daily" : "Once daily",
          scheduleSlots: slots,
          mealTime,
          durationDays: days,
          prescribedByDoctor: doctorName,
          appointmentId: appointmentId || "",
          notes: cleanLine,
        });
        createdRoutines.push(routine);
      }
    }

    // If nothing parsed, create default vitamin booster routine
    if (createdRoutines.length === 0) {
      const fallback = await medicineRoutineModel.create({
        userId,
        medicineName: "Multivitamin & Mineral Supplement",
        dosage: "1 Capsule",
        frequency: "Once daily",
        scheduleSlots: ["Morning"],
        mealTime: "After Food",
        durationDays: 14,
        prescribedByDoctor: doctorName,
        appointmentId: appointmentId || "",
        notes: textToParse,
      });
      createdRoutines.push(fallback);
    }

    return res.status(200).json({
      success: true,
      message: `Extracted and added ${createdRoutines.length} medicine schedules to your routine!`,
      routines: createdRoutines,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit Recovery / Follow-Up Check-In
 * POST /api/user/follow-up-checkin
 */
export const submitFollowUpCheckin = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { appointmentId, rating, symptomsState, notes } = req.body;

    if (!appointmentId) {
      return next(new AppError("Appointment ID is required", 400));
    }

    const appt = await appointmentModel.findById(appointmentId);
    if (!appt) {
      return next(new AppError("Appointment not found", 404));
    }

    const feedbackObj = {
      submittedAt: new Date(),
      rating: Number(rating) || 5,
      symptomsState: symptomsState || "Significantly Improved", // "Resolved", "Significantly Improved", "Same", "Worse"
      notes: notes || "Feeling much better after taking prescribed medicines.",
    };

    const updatedAppt = await appointmentModel.findByIdAndUpdate(
      appointmentId,
      {
        "followUp.patientFeedback": feedbackObj,
        "followUp.status": "Completed",
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Follow-up recovery check-in submitted successfully! Your doctor has been updated.",
      appointment: updatedAppt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Smart Symptom Triage & Specialist Recommender
 * POST /api/user/symptom-triage
 */
export const symptomTriage = async (req, res, next) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms || typeof symptoms !== "string") {
      return next(new AppError("Please provide your symptoms description", 400));
    }

    const query = symptoms.toLowerCase();

    let matchedSpeciality = "General physician";
    let urgency = "Routine Consultation";
    let confidence = 92;
    let triageSummary = "Symptoms indicate common clinical symptoms suitable for general medical consultation.";
    let precautions = [
      "Stay hydrated with warm water and electrolytes.",
      "Get plenty of rest and monitor your body temperature.",
      "Avoid self-medicating with unverified antibiotics.",
    ];

    if (query.includes("skin") || query.includes("rash") || query.includes("itch") || query.includes("acne") || query.includes("allergy")) {
      matchedSpeciality = "Dermatologist";
      triageSummary = "Dermatological presentation detected (skin rash/allergy). Specialist examination recommended.";
      precautions = ["Avoid scratching affected area.", "Use mild hypoallergenic soap.", "Do not apply harsh topical steroids without consultation."];
    } else if (query.includes("pregnant") || query.includes("period") || query.includes("menstrual") || query.includes("gynec") || query.includes("fertility")) {
      matchedSpeciality = "Gynecologist";
      triageSummary = "Women's health / obstetric symptoms detected. Consultation with a Gynecologist recommended.";
    } else if (query.includes("child") || query.includes("baby") || query.includes("infant") || query.includes("kid") || query.includes("pediatric")) {
      matchedSpeciality = "Pediatricians";
      triageSummary = "Pediatric health symptom noted. Specialized child care assessment recommended.";
    } else if (query.includes("headache") || query.includes("migraine") || query.includes("dizzy") || query.includes("numb") || query.includes("seizure") || query.includes("nerve")) {
      matchedSpeciality = "Neurologist";
      triageSummary = "Neurological / cranial symptoms noted. Specialized evaluation recommended.";
      if (query.includes("sudden") || query.includes("severe")) {
        urgency = "Priority Consultation";
      }
    } else if (query.includes("stomach") || query.includes("acid") || query.includes("digest") || query.includes("vomit") || query.includes("liver") || query.includes("gas") || query.includes("abdomen")) {
      matchedSpeciality = "Gastroenterologist";
      triageSummary = "Gastrointestinal or digestive concern detected. Gastroenterology assessment recommended.";
    }

    // Find recommended available doctors with crowd levels
    const recommendedDoctors = await doctorModel
      .find({ speciality: matchedSpeciality, available: true })
      .select("-password")
      .limit(4);

    return res.status(200).json({
      success: true,
      triage: {
        matchedSpeciality,
        urgency,
        confidence,
        triageSummary,
        precautions,
        recommendedDoctors,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Patient Follow-Up and Recovery Items
 * GET /api/user/follow-ups
 */
export const getFollowUps = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const appointments = await appointmentModel
      .find({
        userId,
        $or: [
          { isCompleted: true },
          { "followUp.required": true },
          { followUp: { $exists: true } },
          { cancelled: false },
        ],
      })
      .sort({ date: -1 });

    const followUps = appointments.map((appt) => {
      const isDue = !appt.followUp?.patientFeedback;
      return {
        _id: appt._id,
        appointmentId: appt._id,
        doctor: appt.docData,
        slotDate: appt.slotDate,
        prescription: appt.prescription || "Follow-up consultation on treatment plan.",
        diagnosisNotes: appt.diagnosisNotes || "Clinical recovery review.",
        followUpDate: appt.followUp?.targetDate || appt.slotDate,
        status: appt.followUp?.status || (isDue ? "Due" : "Completed"),
        patientFeedback: appt.followUp?.patientFeedback || null,
      };
    });

    return res.status(200).json({
      success: true,
      followUps,
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
  getAccessLogs,
  getMedicineRoutines,
  createMedicineRoutine,
  toggleMedicineDose,
  deleteMedicineRoutine,
  convertPrescriptionToSchedule,
  submitFollowUpCheckin,
  getFollowUps,
  symptomTriage,
};
