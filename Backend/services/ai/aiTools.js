import { Type } from "@google/genai";
import doctorModel from "../../models/doctorModel.js";
import appointmentModel from "../../models/appointmentModel.js";
import medicineRoutineModel from "../../models/medicineRoutineModel.js";

/**
 * Gemini Function Declarations for Prescripto Live Database Tools
 */
export const prescriptoToolDeclarations = [
  {
    name: "findDoctors",
    description:
      "Search verified doctors registered on Prescripto by doctor name, degree, specialty, or general keyword. Can filter by availability.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: "Search keyword such as doctor name, degree, qualification, or clinical specialty.",
        },
        availableOnly: {
          type: Type.BOOLEAN,
          description: "If true, only returns doctors currently on-duty and available for OPD appointments. Default is true.",
        },
      },
    },
  },
  {
    name: "findDoctorsBySpeciality",
    description:
      "Search doctors by clinical medical specialty (e.g., General physician, Gynecologist, Dermatologist, Pediatricians, Neurologist, Gastroenterologist, Cardiologist, etc.).",
    parameters: {
      type: Type.OBJECT,
      properties: {
        speciality: {
          type: Type.STRING,
          description: "The specific medical department or specialty name.",
        },
      },
      required: ["speciality"],
    },
  },
  {
    name: "getDoctorAvailability",
    description:
      "Inspect detailed profile, live OPD availability, consultation fee, room number, experience, and queue details for a specific doctor by name.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        doctorName: {
          type: Type.STRING,
          description: "The full or partial name of the doctor (e.g. 'Richard James', 'Chloe Evans').",
        },
      },
      required: ["doctorName"],
    },
  },
  {
    name: "getMyAppointments",
    description:
      "Retrieve the authenticated patient's scheduled appointments, sequential queue tokens, slot timings, payment status, completion status, and 100% refund records. Requires authenticated user session.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: "getMyPrescriptions",
    description:
      "Retrieve the authenticated patient's digital prescriptions, doctor diagnostic advice, and active daily medicine routines with scheduled time slots (Morning, Afternoon, Evening, Night). Requires authenticated user session.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: "getHospitalSpecialties",
    description: "Get the complete list of clinical specialties and medical wings currently offered on Prescripto.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
];

/**
 * Execute tool requests against real MongoDB database
 */
export const executePrescriptoTool = async (toolName, toolArgs = {}, userId = null) => {
  try {
    switch (toolName) {
      case "findDoctors": {
        const query = (toolArgs.query || "").trim();
        const availableOnly = toolArgs.availableOnly !== false;
        const filter = {};
        if (availableOnly) filter.available = true;

        if (query) {
          filter.$or = [
            { name: { $regex: query, $options: "i" } },
            { speciality: { $regex: query, $options: "i" } },
            { degree: { $regex: query, $options: "i" } },
            { about: { $regex: query, $options: "i" } },
          ];
        }

        const doctors = await doctorModel
          .find(filter)
          .select("name speciality degree experience fees available address rating roomNumber department")
          .limit(8)
          .lean();

        if (doctors.length === 0) {
          return {
            found: false,
            count: 0,
            message: "No matching doctors found in the Prescripto database.",
          };
        }

        return {
          found: true,
          count: doctors.length,
          doctors: doctors.map((d) => ({
            name: d.name,
            speciality: d.speciality,
            degree: d.degree,
            experience: d.experience,
            fees: d.fees,
            available: d.available,
            rating: d.rating || 4.8,
            roomNumber: d.roomNumber || "OPD-102",
            clinicAddress: d.address ? `${d.address.line1 || ""}, ${d.address.line2 || ""}` : "Main Clinic Wing",
          })),
        };
      }

      case "findDoctorsBySpeciality": {
        const speciality = (toolArgs.speciality || "").trim();
        const doctors = await doctorModel
          .find({ speciality: { $regex: speciality, $options: "i" } })
          .select("name speciality degree experience fees available address rating roomNumber")
          .limit(8)
          .lean();

        if (doctors.length === 0) {
          return {
            found: false,
            count: 0,
            message: `No ${speciality} specialists are currently registered in the Prescripto database.`,
          };
        }

        return {
          found: true,
          count: doctors.length,
          specialityRequested: speciality,
          doctors: doctors.map((d) => ({
            name: d.name,
            speciality: d.speciality,
            degree: d.degree,
            experience: d.experience,
            fees: d.fees,
            available: d.available,
            rating: d.rating || 4.8,
            roomNumber: d.roomNumber || "OPD-102",
          })),
        };
      }

      case "getDoctorAvailability": {
        const doctorName = (toolArgs.doctorName || "").trim();
        const doc = await doctorModel
          .findOne({ name: { $regex: doctorName, $options: "i" } })
          .select("name speciality degree experience fees available address roomNumber liveQueue vacationDates")
          .lean();

        if (!doc) {
          return {
            found: false,
            message: `Doctor '${doctorName}' was not found in the Prescripto database.`,
          };
        }

        return {
          found: true,
          doctor: {
            name: doc.name,
            speciality: doc.speciality,
            degree: doc.degree,
            experience: doc.experience,
            fees: doc.fees,
            available: doc.available,
            status: doc.available ? "Available (Accepting OPD Appointments)" : "Off-duty / Currently Unavailable",
            roomNumber: doc.roomNumber || "OPD-102",
            clinicLocation: doc.address ? `${doc.address.line1 || ""}, ${doc.address.line2 || ""}` : "Hospital Clinic",
            crowdLevel: doc.liveQueue?.crowdStatus || "Low",
            currentTokenInQueue: doc.liveQueue?.currentToken || 1,
            totalInQueue: doc.liveQueue?.totalInQueue || 4,
          },
        };
      }

      case "getMyAppointments": {
        if (!userId) {
          return {
            authenticated: false,
            message:
              "The patient is not currently signed in. Tell the user to log into their Prescripto account to view their scheduled appointments.",
          };
        }

        const appts = await appointmentModel
          .find({ userId: userId.toString() })
          .sort({ date: -1 })
          .limit(6)
          .lean();

        if (appts.length === 0) {
          return {
            authenticated: true,
            count: 0,
            message: "You currently have no scheduled appointments on Prescripto.",
          };
        }

        return {
          authenticated: true,
          count: appts.length,
          appointments: appts.map((a) => ({
            doctorName: a.docData?.name || "Doctor",
            speciality: a.docData?.speciality || "Specialist",
            slotDate: a.slotDate ? a.slotDate.replace(/_/g, "/") : "Scheduled Date",
            slotTime: a.slotTime || "",
            tokenNumber: a.tokenNumber || 1,
            fee: a.amount,
            paymentStatus: a.payment ? `Paid (${a.paymentMethod || "Online"})` : "Pending",
            status: a.cancelled
              ? "Cancelled (100% Refunded to Wallet)"
              : a.isCompleted
              ? "Completed"
              : a.appointmentStatus || "Active",
            refundStatus: a.refundStatus || "None",
            patientComplaint: a.patientProblem || "General consultation",
          })),
        };
      }

      case "getMyPrescriptions": {
        if (!userId) {
          return {
            authenticated: false,
            message:
              "The patient is not currently signed in. Tell the user to log into their Prescripto account to view their prescriptions.",
          };
        }

        const [apptsWithRx, activeRoutines] = await Promise.all([
          appointmentModel
            .find({
              userId: userId.toString(),
              prescription: { $exists: true, $ne: "" },
            })
            .sort({ date: -1 })
            .limit(3)
            .lean(),
          medicineRoutineModel
            .find({
              userId: userId.toString(),
              isActive: true,
            })
            .limit(10)
            .lean(),
        ]);

        return {
          authenticated: true,
          prescriptionsCount: apptsWithRx.length,
          prescriptions: apptsWithRx.map((a) => ({
            doctorName: a.docData?.name || "Doctor",
            date: a.slotDate ? a.slotDate.replace(/_/g, "/") : "Recent",
            prescriptionText: a.prescription,
            diagnosisNotes: a.diagnosisNotes || "",
          })),
          activeMedicineRoutines: activeRoutines.map((r) => ({
            medicineName: r.medicineName,
            dosage: r.dosage,
            slots: r.scheduleSlots,
            mealTiming: r.mealTime,
            durationDays: r.durationDays,
          })),
        };
      }

      case "getHospitalSpecialties": {
        const specialties = await doctorModel.distinct("speciality");
        return {
          specialties:
            specialties && specialties.length > 0
              ? specialties
              : [
                  "General physician",
                  "Gynecologist",
                  "Dermatologist",
                  "Pediatricians",
                  "Neurologist",
                  "Gastroenterologist",
                ],
        };
      }

      default:
        return { error: `Tool ${toolName} is not supported.` };
    }
  } catch (error) {
    console.error(`AI Tool DB Error [${toolName}]:`, error);
    return { error: "Database query failed", message: error.message };
  }
};
