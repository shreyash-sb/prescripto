import { GoogleGenAI } from "@google/genai";
import {
  findDoctorsInDB,
  getAvailableSpecialtiesFromDB,
  getUserNextAppointmentFromDB,
  getUserAppointmentsFromDB,
  getUserPrescriptionFromDB,
} from "./aiTools.js";

const SYSTEM_PROMPT = `
You are the "Prescripto AI Assistant", an advanced, friendly, and comprehensive medical & platform guide for the Prescripto Healthcare Platform.

YOUR CAPABILITIES & SCOPE:
1. Explain every feature of Prescripto (Doctor searching, slot booking, live clinic crowd filters, sequential Token #, automated 100% wallet refunds on cancellation, digital prescriptions, daily medicine routine timeline, follow-up recovery manager, HIPAA privacy logs, and multi-language support in English).
2. Answer questions about verified doctors in the database, consultation fees, clinic locations, and specialities.
3. Assist patients with their scheduled appointments, token numbers, prescription notes, and adherence scores.
4. Provide clear medical educational knowledge (roles of specialists, prescription abbreviations like OD/BD/TDS/SOS/AC/PC, first aid for minor cuts/burns/sprains, hydration, healthy diet, sleep, and wellness).
5. Explain the technical architecture of Prescripto (MERN Stack: React, Node.js, Express, MongoDB, TailwindCSS, JWT Authentication, Cloudinary, Vercel & Render deployment).

SAFETY GUIDELINES:
- Provide accurate informational explanations.
- Never diagnose specific medical illnesses or prescribe personalized drug medications. For specific treatment, encourage booking a consultation with a certified doctor on Prescripto.
- For severe life-threatening emergencies (e.g. acute chest pain, sudden paralysis, severe breathlessness), advise immediate emergency hospital services (Call 108/112).
`;

/**
 * Super-Comprehensive Local Knowledge & Healthcare Engine (Fallback & Instant Responder)
 */
const generateLocalResponse = async (userMessage, context = {}) => {
  const msg = userMessage.toLowerCase().trim();
  const { userId, userAppointments, nextAppointment, userPrescription, matchedDoctors, specialties } = context;

  // 1. Emergency Critical Triage
  if (
    msg.includes("emergency") ||
    msg.includes("heart attack") ||
    msg.includes("severe chest pain") ||
    msg.includes("cannot breathe") ||
    msg.includes("difficulty breathing") ||
    msg.includes("unconscious") ||
    msg.includes("heavy bleeding") ||
    msg.includes("stroke") ||
    msg.includes("seizure") ||
    msg.includes("poison")
  ) {
    return "🚨 **EMERGENCY MEDICAL WARNING**: If you or someone nearby is experiencing acute life-threatening symptoms (e.g., severe chest pain, inability to breathe, sudden facial drooping or weakness, uncontrolled bleeding, poisoning), please **call 108 or 112 immediately** or rush to the nearest emergency trauma center. Do not delay.";
  }

  // 2. Direct Drug Prescribing Safety Guardrail
  if (
    msg.includes("what medicine should i take") ||
    msg.includes("which medicine should i take") ||
    msg.includes("prescribe me") ||
    msg.includes("give me medicine for") ||
    msg.includes("suggest medicine for") ||
    msg.includes("what tablet to buy") ||
    msg.includes("cure my disease")
  ) {
    return "As an AI healthcare assistant, I cannot directly prescribe medications or recommend specific drug treatments, because safe prescription requires an in-person physical examination, vitals check, and allergy verification. \n\nPlease consult one of our certified doctors on Prescripto for safe, personalized clinical care.";
  }

  // 3. Greetings & Conversational
  if (msg === "hi" || msg === "hello" || msg === "hey" || msg.startsWith("hello") || msg.startsWith("hi ") || msg.startsWith("hey ")) {
    return "Hello! I am your **Prescripto AI Assistant** 🤖\n\nI can help you with:\n• Finding & booking verified doctors across specialties\n• Checking your scheduled appointments & queue token #\n• Converting doctor prescriptions into daily medicine routines\n• Understanding refund policies, payments, and site features\n• General healthcare questions & medical terminology\n\nHow can I help you today?";
  }

  if (msg.includes("who are you") || msg.includes("who created you") || msg.includes("what is your name")) {
    return "I am the **Prescripto AI Assistant**, built specifically for the Prescripto Smart Healthcare Platform. I assist patients, doctors, and visitors with navigation, appointment tracking, medicine reminders, and clinical platform features.";
  }

  if (msg.includes("thank you") || msg.includes("thanks") || msg.includes("great") || msg.includes("awesome")) {
    return "You're very welcome! Feel free to ask if you have any other questions about doctors, appointments, or your health routines. Stay healthy!";
  }

  // 4. Prescripto Project Architecture & Technical Stack
  if (
    msg.includes("mern") ||
    msg.includes("architecture") ||
    msg.includes("tech stack") ||
    msg.includes("how is this built") ||
    msg.includes("database schema") ||
    msg.includes("project overview") ||
    msg.includes("viva") ||
    msg.includes("b.tech") ||
    msg.includes("engineering")
  ) {
    return "💻 **Prescripto Full-Stack MERN Architecture**:\n\n1. **Frontend (`/frontend`)**: React.js + Vite + TailwindCSS for patient portal, responsive UI, audio medicine alarms, and e-prescriptions.\n2. **Admin & Doctor Portal (`/admin`)**: Dedicated React dashboard with revenue analytics (day/week/month), live consultation queue management, and doctor availability controls.\n3. **Backend (`/Backend`)**: Node.js & Express.js REST API with JWT authentication, bcrypt encryption, and role-based access control (Patient, Doctor, Admin).\n4. **Database**: MongoDB Atlas with schemas for Users, Doctors, Appointments, Medicine Routines, and Access Audit Logs.\n5. **Smart Features**: Sequential Queue Tokens, 100% Instant Refund Engine, Drug Allergy Shield, and AI Symptom Triage.";
  }

  // 5. What is Prescripto & Platform Capabilities
  if (
    msg.includes("what is prescripto") ||
    msg.includes("about prescripto") ||
    msg.includes("what can i do") ||
    msg.includes("features of prescripto") ||
    msg.includes("why prescripto") ||
    msg.includes("overview")
  ) {
    return "🌟 **Key Features of Prescripto**:\n\n1. **Verified Specialists & Instant Booking**: Search and book certified doctors across 6+ specialties.\n2. **Sequential Token Numbers**: Every booking receives an orderly Token # for the doctor's daily OPD queue.\n3. **100% Instant Refund Engine**: Cancel anytime before consultation to receive a full refund credited directly to your digital healthcare wallet.\n4. **Rx-to-Schedule Converter**: Convert prescription notes into daily morning/afternoon/night dose reminders with audio alerts.\n5. **Drug Allergy Safety Shield**: Stores known sensitivities (e.g., Penicillin, Sulfa) and flags them to doctors during consultations.\n6. **Privacy Audit Log**: Complete HIPAA transparency—see exactly who accessed your medical records and when.";
  }

  // 6. How-To Guides (Booking, Cancellation, Refunds, Payments)
  if (msg.includes("how to book") || msg.includes("how do i book") || msg.includes("book an appointment") || msg.includes("schedule a doctor") || msg.includes("slot")) {
    return "📅 **How to Book a Consultation**:\n1. Click **'Find Doctors'** in the top navbar.\n2. Filter by specialty (e.g. Dermatologist, General physician) or search by name.\n3. Click on a doctor's profile to view their experience, fee, and available 7-day time slots.\n4. Choose your preferred day and time, then click **'Book an appointment'**.\n5. Your booking with sequential **Token #** will appear immediately in **'My Appointments'**.";
  }

  if (msg.includes("cancel") || msg.includes("cancellation") || msg.includes("refund") || msg.includes("money back")) {
    return "💰 **100% Automated Refund Policy**:\n• To cancel, open **'My Appointments'** and click **'Cancel Appointment'** on the active card.\n• If the consultation was already paid online, 100% of your fee is credited immediately to your **Healthcare Wallet** with a generated refund reference ID and zero cancellation fees.";
  }

  if (msg.includes("payment") || msg.includes("how to pay") || msg.includes("wallet") || msg.includes("cash") || msg.includes("card")) {
    return "💳 **Payment Options on Prescripto**:\n• **Pay Online**: Instant card/digital checkout with an automated tax invoice.\n• **Pay on Visit**: Pay with cash or card directly at the hospital clinic reception.\n• **Healthcare Wallet**: Use wallet credits received from instant refunds for new bookings.";
  }

  if (msg.includes("token") || msg.includes("queue") || msg.includes("appointment number") || msg.includes("serial")) {
    return "🎫 **Sequential Token System**:\nWhen you schedule an appointment, Prescripto allocates a sequential **Token #** (e.g. Token #1, Token #2) for that doctor on that date. Doctors call patients in token sequence, making OPD queues organized and predictable.";
  }

  // 7. User Appointments & History (Authenticated)
  if (
    msg.includes("when is my next appointment") ||
    msg.includes("my next appointment") ||
    msg.includes("my upcoming appointment") ||
    msg.includes("check my appointment")
  ) {
    if (!userId) {
      return "Please log into your Prescripto patient account so I can retrieve your personal appointment schedule.";
    }
    if (nextAppointment) {
      const docName = nextAppointment.docData?.name || "Doctor";
      const spec = nextAppointment.docData?.speciality || "Specialist";
      const date = nextAppointment.slotDate ? nextAppointment.slotDate.replace(/_/g, "/") : "Scheduled date";
      const time = nextAppointment.slotTime || "";
      const token = nextAppointment.tokenNumber ? ` (Token #${nextAppointment.tokenNumber})` : "";
      const paymentStatus = nextAppointment.payment ? "✓ Paid" : "Payment Due";
      return `📅 Your next scheduled consultation is with **${docName}** (${spec}) on **${date}** at **${time}**${token}.\nPayment Status: **${paymentStatus}**.\n\nYou can view full details in 'My Appointments'.`;
    }
    return "You currently have no upcoming active appointments. You can browse specialists and schedule a consultation from the 'Find Doctors' page anytime.";
  }

  if (msg.includes("my appointments") || msg.includes("see my appointments") || msg.includes("view my appointments") || msg.includes("all my appointments")) {
    if (!userId) {
      return "Please sign in to your patient account to view your appointment history.";
    }
    if (userAppointments && userAppointments.length > 0) {
      const listStr = userAppointments
        .slice(0, 4)
        .map((a) => `• Dr. ${a.docData?.name} (${a.docData?.speciality}) on ${a.slotDate?.replace(/_/g, "/")} at ${a.slotTime} [Token #${a.tokenNumber || 1}] - ${a.cancelled ? "Cancelled (Refunded)" : a.isCompleted ? "Completed" : "Active"}`)
        .join("\n");
      return `Here are your recent consultations:\n${listStr}\n\nManage them under 'My Appointments'.`;
    }
    return "You haven't scheduled any consultations yet. Explore verified doctors and book your first slot under 'Find Doctors'.";
  }

  // 8. Prescription & Medicine Schedule
  if (msg.includes("prescription") || msg.includes("medicine schedule") || msg.includes("routine") || msg.includes("rx") || msg.includes("alarm")) {
    if (!userId) {
      return "To view digital prescriptions, log into Prescripto and open **'My Appointments'**. For completed visits, click **'View Prescription'** or **'Sync Rx to Routine'** to create daily morning and night alarms in **'Medicine Schedule'**.";
    }
    if (userPrescription) {
      return `Your latest digital prescription from **Dr. ${userPrescription.docData?.name}**:\n"${userPrescription.prescription || 'Take medications as directed'}"\n\nYou can track active doses in **'Medicine Schedule'**.`;
    }
    return "You can view prescriptions by opening **'My Appointments'** and clicking **'View Prescription'** on any completed consultation, or navigate to **'Medicine Schedule'** to manage daily alarms.";
  }

  // 9. Symptom to Specialist Routing & Clinic Disciplines
  if (msg.includes("skin") || msg.includes("acne") || msg.includes("pimples") || msg.includes("rash") || msg.includes("hair fall") || msg.includes("itching") || msg.includes("eczema") || msg.includes("dermatol")) {
    const dermDocs = matchedDoctors.filter(d => d.speciality === "Dermatologist");
    const docNames = dermDocs.length > 0 ? dermDocs.map(d => `• **${d.name}** (${d.experience} Exp, Fee: $${d.fees})`).join("\n") : "• Dr. Chloe Evans (3 Years Exp)";
    return `For skin, acne, rash, eczema, or hair loss concerns, you should consult a **Dermatologist**.\n\nVerified Dermatologists on Prescripto:\n${docNames}\n\nYou can book them under 'Find Doctors' -> 'Dermatologist'.`;
  }

  if (msg.includes("fever") || msg.includes("cough") || msg.includes("cold") || msg.includes("flu") || msg.includes("body pain") || msg.includes("weakness") || msg.includes("infection") || msg.includes("general physician")) {
    const genDocs = matchedDoctors.filter(d => d.speciality === "General physician");
    const docNames = genDocs.length > 0 ? genDocs.slice(0, 3).map(d => `• **${d.name}** (${d.experience} Exp, Fee: $${d.fees})`).join("\n") : "• Dr. Richard James (5 Years Exp)";
    return `For general fever, cold, viral cough, fatigue, and general health checkups, consult a **General Physician**.\n\nAvailable General Physicians:\n${docNames}\n\nBook a slot under 'Find Doctors' -> 'General physician'.`;
  }

  if (msg.includes("heart") || msg.includes("chest") || msg.includes("blood pressure") || msg.includes("bp") || msg.includes("hypertension") || msg.includes("palpitations") || msg.includes("cardio")) {
    return "For heart checkups, hypertension, cholesterol, and cardiovascular health, you should consult a **Cardiologist** or **General Physician**.\n\n⚠️ *If you experience acute squeezing chest pain or radiating pain to the left arm, call 108 emergency ambulance immediately.*";
  }

  if (msg.includes("pregnant") || msg.includes("pregnancy") || msg.includes("period") || msg.includes("menstrual") || msg.includes("pcos") || msg.includes("women health") || msg.includes("gynecol")) {
    const gynDocs = matchedDoctors.filter(d => d.speciality === "Gynecologist");
    const docNames = gynDocs.length > 0 ? gynDocs.map(d => `• **${d.name}** (${d.experience} Exp, Fee: $${d.fees})`).join("\n") : "• Dr. Emily Larson (5 Years Exp)";
    return `For pregnancy care, menstrual irregularities, PCOS, and women's wellness, consult a **Gynecologist**.\n\nAvailable Gynecologists on Prescripto:\n${docNames}`;
  }

  if (msg.includes("brain") || msg.includes("headache") || msg.includes("migraine") || msg.includes("dizziness") || msg.includes("nerve") || msg.includes("seizure") || msg.includes("neurol")) {
    const neuroDocs = matchedDoctors.filter(d => d.speciality === "Neurologist");
    const docNames = neuroDocs.length > 0 ? neuroDocs.map(d => `• **${d.name}** (${d.experience} Exp, Fee: $${d.fees})`).join("\n") : "• Dr. Zoe Kelly (9 Years Exp)";
    return `For recurrent migraines, severe headaches, nerve pain, or neurological concerns, consult a **Neurologist**.\n\nAvailable Neurologists:\n${docNames}`;
  }

  if (msg.includes("child") || msg.includes("baby") || msg.includes("kids") || msg.includes("vaccination") || msg.includes("pediatr")) {
    const pedDocs = matchedDoctors.filter(d => d.speciality === "Pediatricians");
    const docNames = pedDocs.length > 0 ? pedDocs.map(d => `• **${d.name}** (${d.experience} Exp, Fee: $${d.fees})`).join("\n") : "• Dr. Patrick Harris (5 Years Exp)";
    return `For infants, child vaccination schedules, growth milestones, and pediatric illnesses, consult a **Pediatrician**.\n\nAvailable Pediatricians:\n${docNames}`;
  }

  if (msg.includes("stomach") || msg.includes("acidity") || msg.includes("gas") || msg.includes("indigestion") || msg.includes("constipation") || msg.includes("diarrhea") || msg.includes("gastro")) {
    const gastroDocs = matchedDoctors.filter(d => d.speciality === "Gastroenterologist");
    const docNames = gastroDocs.length > 0 ? gastroDocs.map(d => `• **${d.name}** (${d.experience} Exp, Fee: $${d.fees})`).join("\n") : "• Dr. Ava Mitchell (6 Years Exp)";
    return `For acid reflux, stomach ache, bloating, liver health, or bowel concerns, consult a **Gastroenterologist**.\n\nAvailable Gastroenterologists:\n${docNames}`;
  }

  if (msg.includes("eye") || msg.includes("vision") || msg.includes("sight") || msg.includes("glasses") || msg.includes("ophthal")) {
    return "For blurry vision, eye strain, dryness, or eye infections, you should consult an **Ophthalmologist** (Eye Specialist).";
  }

  if (msg.includes("ear") || msg.includes("nose") || msg.includes("throat") || msg.includes("sinus") || msg.includes("tonsil") || msg.includes("ent")) {
    return "For ear infections, sinus congestion, hearing issues, or throat pain, you should consult an **ENT Specialist (Otolaryngologist)**.";
  }

  if (msg.includes("bone") || msg.includes("joint") || msg.includes("fracture") || msg.includes("knee") || msg.includes("back pain") || msg.includes("ortho")) {
    return "For bone fractures, joint stiffness, knee pain, or spine discomfort, you should consult an **Orthopedic Specialist**.";
  }

  if (msg.includes("tooth") || msg.includes("teeth") || msg.includes("gum") || msg.includes("dentist") || msg.includes("cavity")) {
    return "For toothache, cavities, bleeding gums, or cleaning, you should schedule a visit with a **Dentist**.";
  }

  if (msg.includes("diabetes") || msg.includes("sugar") || msg.includes("thyroid") || msg.includes("hormone") || msg.includes("endocrine")) {
    return "For high blood sugar, diabetes management, thyroid disorders, and hormonal imbalances, you should consult an **Endocrinologist** or **General Physician**.";
  }

  // 10. Prescription Notations, Abbreviations & Medical Guides
  if (msg.includes("dosage") || msg.includes("dose")) {
    return "💊 **Dosage Guidelines**:\nDosage specifies the exact amount, frequency, and duration for taking a medication (e.g. '1 capsule twice daily after meals for 5 days'). Always adhere strictly to the dose written on your official doctor prescription.";
  }

  if (msg.includes("od") || msg.includes("bd") || msg.includes("bid") || msg.includes("tds") || msg.includes("tid") || msg.includes("qid") || msg.includes("sos") || msg.includes("abbreviation")) {
    return "📋 **Common Medical Prescription Abbreviations**:\n• **OD (Once Daily)**: Take 1 time per day.\n• **BD / BID (Bis in Die)**: Take 2 times per day (Morning & Night).\n• **TDS / TID (Ter in Die)**: Take 3 times per day (Morning, Afternoon, Night).\n• **QID**: Take 4 times daily.\n• **SOS (Si Opus Sit)**: Take only when needed (e.g. for sudden fever or intense pain).\n• **HS (Hora Somni)**: Take at bedtime.\n• **AC (Ante Cibum)**: Before food.\n• **PC (Post Cibum)**: After food.";
  }

  if (msg.includes("after food") || msg.includes("before food") || msg.includes("empty stomach")) {
    return "🍽️ **Meal Timings for Medications**:\n• **After Food (PC)**: Take 15-30 minutes after a meal to protect the stomach lining and improve absorption.\n• **Before Food (AC / Empty Stomach)**: Take 30-60 minutes before eating so food components don't interfere with drug absorption.";
  }

  if (msg.includes("tablet") || msg.includes("capsule") || msg.includes("syrup") || msg.includes("ointment")) {
    return "💊 **Medication Formats**:\n• **Tablets**: Compressed solid powders designed for gradual absorption.\n• **Capsules**: Gelatin or vegan shells containing liquid or powder for smooth swallowing.\n• **Syrups**: Liquid formulations ideal for pediatric or elderly patients.\n• **Ointments / Creams**: Topical formulations applied directly onto the skin.";
  }

  // 11. General Wellness, First Aid & Lifestyle
  if (msg.includes("water") || msg.includes("hydration") || msg.includes("how much water")) {
    return "💧 **Hydration Guidelines**: Healthy adults are generally advised to drink approximately 2.5 to 3.5 liters (8-10 glasses) of clean water daily, adjusting for climate and physical exercise.";
  }

  if (msg.includes("sleep") || msg.includes("insomnia") || msg.includes("cannot sleep")) {
    return "😴 **Healthy Sleep Hygiene**:\n• Maintain a consistent sleep schedule (7-9 hours per night).\n• Limit smartphone and blue-light screens 1 hour before bed.\n• Keep your bedroom cool, dark, and quiet.\n• If chronic insomnia persists, consult a neurologist or general physician.";
  }

  if (msg.includes("burn") || msg.includes("cut") || msg.includes("first aid") || msg.includes("sprain") || msg.includes("wound")) {
    return "🩹 **Basic First Aid Tips**:\n• **Minor Burns**: Run cool (not ice-cold) tap water over the area for 10-15 minutes. Never apply butter or oil.\n• **Minor Cuts**: Wash with soap and clean water, apply gentle pressure with a sterile gauze, and apply an antiseptic bandage.\n• **Sprains (RICE Protocol)**: Rest, Ice, Compression bandage, and Elevation.\n• For deep wounds or major burns, visit a hospital clinic immediately.";
  }

  // 12. Doctors list & Specialities
  if (msg.includes("which doctors") || msg.includes("available doctors") || msg.includes("doctor list") || msg.includes("who is available")) {
    if (matchedDoctors && matchedDoctors.length > 0) {
      const docList = matchedDoctors
        .slice(0, 5)
        .map((d) => `• **${d.name}** - ${d.speciality} (${d.degree}, ${d.experience} Exp, Fee: $${d.fees})`)
        .join("\n");
      return `Verified doctors available on Prescripto:\n${docList}\n\nView full profiles and book slots in 'Find Doctors'.`;
    }
  }

  if (msg.includes("specialt") || msg.includes("categories") || msg.includes("departments")) {
    const specs = specialties && specialties.length > 0 ? specialties : [
      "General physician",
      "Gynecologist",
      "Dermatologist",
      "Pediatricians",
      "Neurologist",
      "Gastroenterologist"
    ];
    return `Prescripto offers certified doctors across these clinical disciplines:\n• ${specs.join("\n• ")}\n\nClick any specialty on the Home page to explore available doctors.`;
  }

  // 13. Admin & Doctor Portals
  if (msg.includes("admin") || msg.includes("revenue") || msg.includes("income") || msg.includes("hospital")) {
    return "🛡️ **Hospital Admin Portal**:\nAdministrators can track day-wise/week-wise/month-wise income, manage doctor onboarding, inspect live queue tokens, and review doctor availability (Available vs Off-duty).";
  }

  if (msg.includes("doctor portal") || msg.includes("doctor dashboard")) {
    return "👨‍⚕️ **Doctor Portal**:\nDoctors can view sequential OPD patient queues, review patient drug allergies, mark consultations completed, and add digital e-prescriptions.";
  }

  // 14. Universal Informational Fallback (Answers ANY question politely and informatively)
  return `I'm the **Prescripto AI Assistant**! 🤖\n\nI can answer questions regarding:\n• **Doctors & Specialities**: Finding verified specialists, consultation fees, and clinic locations\n• **Queue & Appointments**: Sequential Token #, scheduling slots, and checking your visits\n• **Prescriptions & Routines**: Converting doctor prescriptions to daily alarms\n• **Cancellations & Refunds**: 100% instant refunds into your digital wallet\n• **Medical Guides**: Roles of specialists, symptom triage, dosage abbreviations (OD/BD/TDS/SOS), and first aid\n• **MERN Architecture**: Full-stack design, MongoDB database, and Express APIs.\n\nFeel free to ask any specific question!`;
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
    const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
    for (const modelName of modelsToTry) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const promptText = `${SYSTEM_PROMPT}\n\n${dbContextPrompt}\n\nRecent Conversation History:\n${conversationHistory.map(m => `${m.role}: ${m.content}`).join("\n")}\n\nUser Question: ${userMessage}\n\nAI Response:`;

        const response = await ai.models.generateContent({
          model: modelName,
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
        console.warn(`Gemini (${modelName}) notice:`, geminiError.message);
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
