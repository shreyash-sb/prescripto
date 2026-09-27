import doctorModel from "../../models/doctorModel.js";
import appointmentModel from "../../models/appointmentModel.js";

/**
 * AI Tool Helper: Search existing doctors by specialty or keyword
 */
export const findDoctorsInDB = async (query = "") => {
  try {
    const cleanQuery = query.trim().toLowerCase();
    let filter = { available: true };

    if (cleanQuery && cleanQuery !== "all") {
      filter = {
        available: true,
        $or: [
          { speciality: { $regex: cleanQuery, $options: "i" } },
          { name: { $regex: cleanQuery, $options: "i" } },
          { about: { $regex: cleanQuery, $options: "i" } },
          { degree: { $regex: cleanQuery, $options: "i" } },
        ],
      };
    }

    const doctors = await doctorModel
      .find(filter)
      .select("name speciality degree experience fees available address rating")
      .limit(8)
      .lean();

    if (doctors.length === 0) {
      // Fallback: search without available=true to inform user if doctors exist but are currently unavailable
      const allMatches = await doctorModel
        .find({
          $or: [
            { speciality: { $regex: cleanQuery, $options: "i" } },
            { name: { $regex: cleanQuery, $options: "i" } },
          ],
        })
        .select("name speciality degree experience fees available")
        .limit(5)
        .lean();

      return allMatches;
    }

    return doctors;
  } catch (error) {
    console.error("AI Tool Error (findDoctorsInDB):", error);
    return [];
  }
};

/**
 * AI Tool Helper: List all available medical specialties
 */
export const getAvailableSpecialtiesFromDB = async () => {
  try {
    const specialties = await doctorModel.distinct("speciality");
    return specialties || [];
  } catch (error) {
    console.error("AI Tool Error (getAvailableSpecialtiesFromDB):", error);
    return [];
  }
};

/**
 * AI Tool Helper: Get authenticated user's next upcoming appointment
 */
export const getUserNextAppointmentFromDB = async (userId) => {
  if (!userId) return null;
  try {
    const appointment = await appointmentModel
      .findOne({
        userId: userId.toString(),
        cancelled: false,
        isCompleted: false,
      })
      .sort({ date: 1 })
      .lean();

    return appointment;
  } catch (error) {
    console.error("AI Tool Error (getUserNextAppointmentFromDB):", error);
    return null;
  }
};

/**
 * AI Tool Helper: Get all appointments for authenticated user
 */
export const getUserAppointmentsFromDB = async (userId) => {
  if (!userId) return [];
  try {
    const appointments = await appointmentModel
      .find({ userId: userId.toString() })
      .sort({ date: -1 })
      .limit(5)
      .lean();

    return appointments;
  } catch (error) {
    console.error("AI Tool Error (getUserAppointmentsFromDB):", error);
    return [];
  }
};

/**
 * AI Tool Helper: Get user's latest prescription
 */
export const getUserPrescriptionFromDB = async (userId) => {
  if (!userId) return null;
  try {
    const appt = await appointmentModel
      .findOne({
        userId: userId.toString(),
        isCompleted: true,
        prescription: { $exists: true, $ne: "" },
      })
      .sort({ date: -1 })
      .lean();

    return appt;
  } catch (error) {
    console.error("AI Tool Error (getUserPrescriptionFromDB):", error);
    return null;
  }
};
