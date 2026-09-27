import { GoogleGenAI } from "@google/genai";
import {
  findDoctorsInDB,
  getAvailableSpecialtiesFromDB,
  getUserNextAppointmentFromDB,
  getUserAppointmentsFromDB,
  getUserPrescriptionFromDB,
} from "./aiTools.js";

const SYSTEM_PROMPT = `
You are the "Prescripto AI Assistant", an informational and friendly guide for the Prescripto Doctor Appointment and Healthcare platform.

YOUR RESPONSIBILITIES:
1. Explain how the Prescripto website works (booking appointments, choosing doctor slots, cancelling with 100% instant refund, paying online or at counter, managing daily medicine routines, follow-ups).
2. Answer questions about verified doctors, clinical specialties, consultation fees, and doctor availability using real data from Prescripto.
3. Assist logged-in patients with their upcoming appointments and prescriptions.
4. Explain general medical terminology and prescription basics (e.g. what is dosage, 'after food' vs 'before food', difference between tablet and capsule, role of different medical specialists).

CRITICAL MEDICAL SAFETY RULES (MANDATORY):
- You are an informational assistant, NOT a doctor or pharmacist.
- NEVER diagnose illnesses, medical conditions, or suggest a specific disease diagnosis based on symptoms.
- NEVER prescribe medicines, specific drugs, or recommend personalized dosage adjustments.
- If a user asks "What medicine should I take for [symptom/disease]?", DO NOT prescribe drugs. Explain that prescribing medications requires a professional clinical examination and advise booking a consultation with a relevant specialist on Prescripto.
- For emergency or critical symptoms, advise seeking immediate emergency medical care (Call 108 Ambulance).
- Keep answers concise, clear, and easy to understand.
`;

/**
 * Intelligent Local Knowledge & Context Engine (Fallback & Query Analyzer)
 */
const generateLocalResponse = async (userMessage, context = {}) => {
  const msg = userMessage.toLowerCase().trim();
  const { userId, userAppointments, nextAppointment, userPrescription, matchedDoctors, specialties } = context;

  // 1. Prescription / Diagnosis Safety Guardrail Trigger
  if (
    msg.includes("what medicine should i take") ||
    msg.includes("which medicine should i take") ||
    msg.includes("prescribe me") ||
    msg.includes("give me medicine") ||
    msg.includes("recommend medicine for") ||
    msg.includes("cure my")
  ) {
    return "I cannot prescribe medications or recommend specific drug treatments, as medication selection requires a professional clinical evaluation. For safe and personalized medical care, please book a consultation with one of our qualified doctors on Prescripto.";
  }

  // 2. What is Prescripto / Website questions
  if (msg.includes("what is prescripto") || msg.includes("about prescripto") || msg.includes("what can i do on this website")) {
    return "Prescripto is a complete doctor appointment and healthcare management platform. On Prescripto, you can:\n• Browse and book verified medical specialists\n• Select convenient appointment date and time slots\n• Receive sequence appointment numbers\n• Access digital prescriptions and track daily medicine routines\n• Submit 7-day post-consultation recovery check-ins\n• Enjoy 100% automated instant refunds if an appointment is cancelled.";
  }

  if (msg.includes("how to book") || msg.includes("how do i book") || msg.includes("book an appointment")) {
    return "To book an appointment on Prescripto:\n1. Go to 'Find Doctors' or select a specialty from the Home page.\n2. Click on the doctor you wish to consult.\n3. Choose your preferred booking date and available time slot.\n4. Click 'Book Appointment' to confirm. Your appointment number and confirmation will be available under 'My Appointments'.";
  }

  if (msg.includes("how to cancel") || msg.includes("cancel an appointment") || msg.includes("refund")) {
    return "To cancel an appointment:\n1. Open 'My Appointments' from your Health Hub side panel or navigation.\n2. Find the appointment and click 'Cancel Appointment'.\n3. If you already paid for the consultation, 100% of your fee is automatically refunded instantly to your healthcare wallet.";
  }

  if (msg.includes("how does payment work") || msg.includes("payment process") || msg.includes("pay")) {
    return "Prescripto supports flexible payment options:\n• Pay Online: Secure digital demo payment with instant receipt generation.\n• Pay on Visit: Cash or card settlement at the clinic counter.\n• If you cancel a paid consultation, 100% of your fee is credited immediately to your healthcare wallet.";
  }

  if (msg.includes("how do i create an account") || msg.includes("how to register") || msg.includes("sign up")) {
    return "To create an account, click the 'Sign In / Register' button at the top right of the page, select 'Create an account', enter your name, email, and a password (minimum 8 characters), and click 'Create Account'.";
  }

  if (msg.includes("update profile") || msg.includes("edit profile")) {
    return "To update your profile, click your account avatar to open the Patient Health Hub, select 'My Health Profile', and update your contact information, blood group, drug allergies, or emergency contact details.";
  }

  // 3. User Appointments Query
  if (
    msg.includes("when is my next appointment") ||
    msg.includes("my next appointment") ||
    msg.includes("my upcoming appointment") ||
    msg.includes("check my appointment")
  ) {
    if (!userId) {
      return "Please sign in to your Prescripto patient account so I can look up your personal appointment schedule.";
    }
    if (nextAppointment) {
      const docName = nextAppointment.docData?.name || "Doctor";
      const spec = nextAppointment.docData?.speciality || "Specialist";
      const date = nextAppointment.slotDate ? nextAppointment.slotDate.replace(/_/g, "/") : "Scheduled date";
      const time = nextAppointment.slotTime || "";
      const token = nextAppointment.tokenNumber ? ` (Appointment #${nextAppointment.tokenNumber})` : "";
      const paymentStatus = nextAppointment.payment ? "Paid" : "Payment Due";
      return `Your next scheduled appointment is with **${docName}** (${spec}) on **${date}** at **${time}**${token}. Status: ${paymentStatus}.`;
    }
    return "You currently have no upcoming active appointments. You can browse specialists and schedule a new consultation anytime from the 'Find Doctors' page.";
  }

  if (msg.includes("my appointments") || msg.includes("see my appointments") || msg.includes("view my appointments")) {
    if (!userId) {
      return "Please sign in to your patient account to view your booked appointments.";
    }
    if (userAppointments && userAppointments.length > 0) {
      const listStr = userAppointments
        .slice(0, 3)
        .map((a) => `• Dr. ${a.docData?.name} (${a.docData?.speciality}) on ${a.slotDate?.replace(/_/g, "/")} at ${a.slotTime} - ${a.cancelled ? "Cancelled" : a.isCompleted ? "Completed" : "Active"}`)
        .join("\n");
      return `Here are your recent appointments:\n${listStr}\n\nYou can view full details in 'My Appointments'.`;
    }
    return "You have not scheduled any consultations yet. You can find doctors and book a slot from the 'Find Doctors' page.";
  }

  // 4. Prescription Queries
  if (msg.includes("how can i view my prescription") || msg.includes("see my prescription") || msg.includes("view my prescription")) {
    if (!userId) {
      return "To view your digital prescriptions, log into your Prescripto account and go to 'My Appointments'. For completed consultations, click 'View Prescription'. You can also auto-sync it directly into your daily Medicine Schedule.";
    }
    if (userPrescription) {
      return `Your latest prescription from **Dr. ${userPrescription.docData?.name}** includes: "${userPrescription.prescription || 'Follow prescribed routine'}". You can view and manage this in 'My Appointments' or 'Medicine Schedule'.`;
    }
    return "You can view prescriptions by opening 'My Appointments' and selecting any completed consultation. If your doctor has entered your prescription, it will be displayed with an option to sync to your daily Medicine Schedule.";
  }

  // 5. Medical terminology & specialty definitions
  if (msg.includes("what does a dermatologist do") || msg.includes("what is a dermatologist")) {
    return "A Dermatologist is a medical specialist who diagnoses and treats conditions of the skin, hair, and nails (such as acne, rashes, eczema, psoriasis, and skin allergies).";
  }

  if (msg.includes("what does a cardiologist do") || msg.includes("what is a cardiologist")) {
    return "A Cardiologist is a physician specialized in heart health, cardiovascular systems, blood pressure, and disorders of the heart and blood vessels.";
  }

  if (msg.includes("what does a neurologist do") || msg.includes("what is a neurologist")) {
    return "A Neurologist is a doctor who specializes in disorders of the nervous system, brain, spinal cord, nerves, migraines, and seizure management.";
  }

  if (msg.includes("what does a pediatrician do") || msg.includes("what is a pediatrician")) {
    return "A Pediatrician is a doctor dedicated to the medical care, physical growth, and development of infants, children, and teenagers.";
  }

  if (msg.includes("what does a gastroenterologist do") || msg.includes("what is a gastroenterologist")) {
    return "A Gastroenterologist is a specialist focused on the digestive system, stomach, intestines, liver, acid reflux, and gastrointestinal health.";
  }

  if (msg.includes("what does a general physician do") || msg.includes("what is a general physician")) {
    return "A General Physician is a primary care doctor providing routine checkups, early diagnosis of common illnesses, fever/infection treatment, and overall health supervision.";
  }

  if (msg.includes("what is a prescription") || msg.includes("what is prescription")) {
    return "A prescription is a formal medical document issued by a licensed doctor authorizing a patient to receive specific medications with clear dosage, timing, and duration instructions.";
  }

  if (msg.includes("what does dosage mean") || msg.includes("dosage")) {
    return "Dosage refers to the specific amount and frequency of medicine prescribed (for example: '1 tablet twice daily for 5 days'). Always follow the exact dosage given by your doctor.";
  }

  if (msg.includes("after food") || msg.includes("before food")) {
    return "• 'After Food': Take the medication after a meal to aid absorption and avoid stomach upset.\n• 'Before Food' (Empty Stomach): Take the medicine 30-60 minutes before meals so food does not interfere with absorption.";
  }

  if (msg.includes("tablet and capsule") || msg.includes("difference between a tablet and a capsule")) {
    return "• Tablets: Solid compressed powder pills, often scored for dividing.\n• Capsules: Enclosed medicinal powder or liquid inside a soluble outer shell for smooth swallowing.";
  }

  // 6. Specialty list and Doctor Searches (Using real MongoDB database data)
  if (msg.includes("specialt") || msg.includes("specialties") || msg.includes("what specialties are available")) {
    const specs = specialties && specialties.length > 0 ? specialties : [
      "General physician",
      "Gynecologist",
      "Dermatologist",
      "Pediatricians",
      "Neurologist",
      "Gastroenterologist"
    ];
    return `Prescripto currently offers verified specialists across these medical specialties:\n• ${specs.join("\n• ")}`;
  }

  if (
    msg.includes("which doctors") ||
    msg.includes("available doctors") ||
    msg.includes("doctor is a") ||
    msg.includes("find doctor") ||
    msg.includes("cardiologist") ||
    msg.includes("dermatologist") ||
    msg.includes("gynecologist") ||
    msg.includes("neurologist") ||
    msg.includes("pediatrician") ||
    msg.includes("gastroenterologist") ||
    msg.includes("general physician") ||
    msg.includes("skin")
  ) {
    if (matchedDoctors && matchedDoctors.length > 0) {
      const docList = matchedDoctors
        .slice(0, 4)
        .map((d) => `• **${d.name}** - ${d.speciality} (${d.degree}, ${d.experience} Exp, Fee: $${d.fees})`)
        .join("\n");
      return `Here are matching verified doctors available in Prescripto:\n${docList}\n\nYou can view their profile and schedule an appointment from the 'Find Doctors' page.`;
    }
    return "No matching doctor was found in the database for your specific search query. Please check 'Find Doctors' to view our complete specialist directory.";
  }

  if (msg.includes("general physician")) {
    return "A General Physician is a primary care doctor who provides comprehensive medical examinations, diagnoses common illnesses, and manages routine health and preventive care.";
  }

  if (msg.includes("neurologist")) {
    return "A Neurologist is a physician specialized in the diagnosis and treatment of disorders of the nervous system, brain, spinal cord, nerves, and migraines.";
  }

  if (msg.includes("pediatrician")) {
    return "A Pediatrician is a doctor who specializes in the medical care, growth tracking, and health of infants, children, and adolescents.";
  }

  if (msg.includes("reminder") || msg.includes("reminders")) {
    return "Prescripto includes a built-in 'Medicine Routine & Schedule' feature where you can view daily morning, afternoon, and night dosage times and track your adherence. You can also view upcoming consultation dates in 'My Appointments'.";
  }

  // Generic helpful fallback
  return "I'm the Prescripto AI Assistant! I can help you find doctors, explain how to book or cancel appointments, check your scheduled visits, look up specialties, or clarify general healthcare and prescription terminology. How can I assist you today?";
};

/**
 * Main AI Chat Processor
 * Uses Google Gemini API when available with real MongoDB context, or falls back to intelligent local engine
 */
export const processAIChat = async (userMessage, conversationHistory = [], userId = null) => {
  if (!userMessage || typeof userMessage !== "string") {
    return {
      success: false,
      response: "Please enter a valid message.",
    };
  }

  // 1. Gather real-time Prescripto application data
  let matchedDoctors = [];
  let specialties = [];
  let nextAppointment = null;
  let userAppointments = [];
  let userPrescription = null;

  try {
    const cleanMsg = userMessage.toLowerCase();
    specialties = await getAvailableSpecialtiesFromDB();

    // Check if user is asking about a specific specialty or doctors
    let querySpecialty = "";
    if (cleanMsg.includes("skin") || cleanMsg.includes("dermatol")) querySpecialty = "Dermatologist";
    else if (cleanMsg.includes("gynec") || cleanMsg.includes("women") || cleanMsg.includes("pregnan")) querySpecialty = "Gynecologist";
    else if (cleanMsg.includes("neuro") || cleanMsg.includes("brain") || cleanMsg.includes("headache")) querySpecialty = "Neurologist";
    else if (cleanMsg.includes("pediatr") || cleanMsg.includes("child") || cleanMsg.includes("baby")) querySpecialty = "Pediatricians";
    else if (cleanMsg.includes("gastro") || cleanMsg.includes("stomach") || cleanMsg.includes("digest")) querySpecialty = "Gastroenterologist";
    else if (cleanMsg.includes("general") || cleanMsg.includes("fever") || cleanMsg.includes("cough")) querySpecialty = "General physician";
    else if (cleanMsg.includes("cardio") || cleanMsg.includes("heart")) querySpecialty = "Cardiologist";

    matchedDoctors = await findDoctorsInDB(querySpecialty || "all");

    if (userId) {
      nextAppointment = await getUserNextAppointmentFromDB(userId);
      userAppointments = await getUserAppointmentsFromDB(userId);
      userPrescription = await getUserPrescriptionFromDB(userId);
    }
  } catch (err) {
    console.error("Error gathering Prescripto DB context for AI:", err);
  }

  const contextData = {
    userId,
    userAppointments,
    nextAppointment,
    userPrescription,
    matchedDoctors,
    specialties,
  };

  // 2. Build live data context string for Google Gemini
  let dbContextPrompt = `Current Prescripto Real Database Context:\n`;
  dbContextPrompt += `- Available Specialties: ${specialties.join(", ") || "General physician, Dermatologist, Gynecologist, Neurologist, Pediatricians, Gastroenterologist"}\n`;
  dbContextPrompt += `- Matching Verified Doctors in DB: ${JSON.stringify(matchedDoctors.map(d => ({ name: d.name, speciality: d.speciality, degree: d.degree, fees: d.fees, experience: d.experience })))}\n`;

  if (userId) {
    dbContextPrompt += `- Authenticated Patient User ID: ${userId}\n`;
    if (nextAppointment) {
      dbContextPrompt += `- User's Next Upcoming Appointment: Dr. ${nextAppointment.docData?.name} on ${nextAppointment.slotDate} at ${nextAppointment.slotTime} (Token #${nextAppointment.tokenNumber || 1}, Paid: ${nextAppointment.payment})\n`;
    } else {
      dbContextPrompt += `- User has no upcoming appointments scheduled.\n`;
    }
    if (userPrescription) {
      dbContextPrompt += `- User's Latest Prescription: Dr. ${userPrescription.docData?.name}: "${userPrescription.prescription}"\n`;
    }
  } else {
    dbContextPrompt += `- User is currently not signed in (Anonymous visitor).\n`;
  }

  // 3. Try Google Gemini API (Single Primary Cloud Provider)
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiApiKey && geminiApiKey !== "your_gemini_api_key_here") {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      const promptText = `${SYSTEM_PROMPT}\n\n${dbContextPrompt}\n\nRecent Conversation History:\n${conversationHistory.map(m => `${m.role}: ${m.content}`).join("\n")}\n\nUser Question: ${userMessage}\n\nAI Response:`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptText,
      });

      const reply = response?.text;
      if (reply) {
        return {
          success: true,
          response: reply,
          source: "gemini",
        };
      }
    } catch (geminiError) {
      console.warn("Gemini API call notice:", geminiError.message);
      // Try fallback model if 2.5 is not available
      try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: `${SYSTEM_PROMPT}\n\n${dbContextPrompt}\n\nUser Question: ${userMessage}`,
        });
        if (response?.text) {
          return {
            success: true,
            response: response.text,
            source: "gemini",
          };
        }
      } catch (fallbackError) {
        console.warn("Gemini 1.5 fallback notice:", fallbackError.message);
      }
    }
  }

  // 4. Robust fallback to local knowledge & DB engine (Guaranteed 100% reliable for offline B.Tech viva demonstration)
  const localReply = await generateLocalResponse(userMessage, contextData);
  return {
    success: true,
    response: localReply,
    source: "local-engine",
  };
};

export const processUserMessage = processAIChat;


