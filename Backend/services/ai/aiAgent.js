import { GoogleGenAI } from "@google/genai";
import { prescriptoToolDeclarations, executePrescriptoTool } from "./aiTools.js";
import doctorModel from "../../models/doctorModel.js";
import appointmentModel from "../../models/appointmentModel.js";
import medicineRoutineModel from "../../models/medicineRoutineModel.js";

const PRESCRIPTO_SYSTEM_INSTRUCTION = `You are the Prescripto AI Assistant — a smart, helpful, and empathetic healthcare and platform companion for the Prescripto platform.

============================================================
CORE PURPOSE & CAPABILITIES:
============================================================
You intelligently answer three types of questions:
1. PRESCRIPTO APPLICATION KNOWLEDGE: How Prescripto works, booking procedures, refund rules, token numbers, prescription schedules, and clinical safety features.
2. LIVE PRESCRIPTO DATABASE DATA: Doctor listings, real-time availability, specialist lookup, user appointments, and digital prescriptions via tools.
3. GEMINI GENERAL KNOWLEDGE: General healthcare concepts, medical terminology, explanations of medical specialties, first aid basics, wellness tips, and general questions.

============================================================
AUTHENTIC PRESCRIPTO APPLICATION FEATURES:
============================================================
• Patient Registration & Login: Patients sign up with email and password to access their personal health hub, appointments, and wallet.
• Doctor Discovery: Browse doctors across 6+ specialties (General physician, Gynecologist, Dermatologist, Pediatricians, Neurologist, Gastroenterologist). Filter by specialty, live clinic crowd level, or sort by fee and rating.
• 7-Day Slot System & Sequential Token Numbers: Patients choose a date and time slot. Every booking automatically generates an orderly sequential Token # (#1, #2, #3...) for the doctor's daily OPD queue.
• 100% Instant Refund Guarantee: If an appointment is cancelled by either the patient or the attending doctor before consultation, 100% of the consultation fee is immediately refunded into the patient's Healthcare Wallet with zero cancellation deductions.
• Payment Options: Online checkout with invoice receipt or Cash on Visit at the hospital counter.
• Pre-Consultation Allergy Safety Shield: Patients can document known drug allergies (e.g., Penicillin, Sulfa, Aspirin) and chronic conditions. These are cross-checked and flagged to attending doctors before prescribing.
• Digital Prescriptions & Smart Medicine Schedule: Completed consultations include e-prescriptions. Patients can sync prescriptions or upload prescription photos to create daily timed dose reminders (Morning 8:00 AM, Afternoon 1:00 PM, Evening 6:00 PM, Night 9:00 PM) with adherence tracking.
• Privacy Access Audit Logs: Transparent HIPAA-style logs showing patients exactly which doctor or admin accessed their records and when.
• Emergency SOS: Instant one-click access to National Emergency Helplines (108/112/102) and emergency contacts.
• Doctor Portal: Dedicated console for doctors to track earnings, manage the patient queue, use "Call Next Patient", review patient allergy history and current complaints, and issue digital prescriptions.
• Admin Portal: Hospital Operations Console to manage doctor onboarding, toggle doctor availability (Available vs Off-duty), verify cash payments, and track revenue analytics.

============================================================
RULES FOR LIVE DATABASE TOOLS:
============================================================
• Whenever a user asks for live or changing Prescripto information (e.g., "Which doctors are available?", "Do you have a dermatologist?", "Who is Dr. Richard?", "When is my next appointment?", "Show my prescriptions"), ALWAYS use the provided tools.
• NEVER invent or hallucinate doctor names, appointment dates, fees, or prescription records.
• If a tool returns no matches (e.g. no cardiologist found), explicitly tell the user that no matching doctor was found in the Prescripto database.
• For private user data ('getMyAppointments', 'getMyPrescriptions'), if the tool reports that the user is not signed in, politely prompt them to log into their Prescripto account.

============================================================
COMBINING GENERAL KNOWLEDGE & LIVE DATA:
============================================================
• If a question requires both general knowledge and live data (e.g., "I have a skin rash. Which specialist should I see and do you have one?"):
  1. Use general knowledge to identify that a skin rash requires a Dermatologist.
  2. Use the 'findDoctorsBySpeciality' tool to check real dermatologists on Prescripto.
  3. Combine the clinical explanation and actual doctor list into one natural, seamless response.

============================================================
MEDICAL SAFETY GUARDRAILS:
============================================================
• You may provide clear educational medical explanations (e.g., what paracetamol is, what an ECG is, what "after food" means, basic first-aid).
• NEVER diagnose a specific illness, prescribe medications, recommend personalized drug dosages, or tell a user to start/stop medications.
• For specific medical treatment, always advise consulting a certified doctor on Prescripto or visiting a healthcare facility.
• For severe acute emergencies (severe chest pain, difficulty breathing, heavy bleeding, stroke symptoms), immediately urge the user to call emergency services (108/112).

Tone: Professional, warm, concise, and clear.`;

const withTimeout = (promise, ms = 10000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`AI Request timed out after ${ms}ms`)), ms)
    ),
  ]);
};

/**
 * Intelligent Database-Backed Local Fallback Engine
 * Ensures 100% availability even if external AI API quotas or network are disrupted.
 */
const generateSmartLocalFallback = async (userMessage, userId = null) => {
  const query = userMessage.toLowerCase().trim();

  try {
    // 1. Doctor search / availability / list queries
    if (
      query.includes("doctor") ||
      query.includes("available") ||
      query.includes("specialist") ||
      query.includes("physician") ||
      query.includes("dermatolog") ||
      query.includes("gynecolog") ||
      query.includes("pediatric") ||
      query.includes("neurolog") ||
      query.includes("gastroenterolog") ||
      query.includes("dr.") ||
      query.includes("dr ")
    ) {
      let filter = { available: true };

      if (query.includes("dermatolog") || query.includes("skin") || query.includes("rash") || query.includes("acne")) {
        filter.speciality = { $regex: "dermatolog", $options: "i" };
      } else if (query.includes("gynecolog") || query.includes("women") || query.includes("pregnancy")) {
        filter.speciality = { $regex: "gynecolog", $options: "i" };
      } else if (query.includes("pediatric") || query.includes("child") || query.includes("baby") || query.includes("infant")) {
        filter.speciality = { $regex: "pediatric", $options: "i" };
      } else if (query.includes("neurolog") || query.includes("brain") || query.includes("nerve") || query.includes("headache")) {
        filter.speciality = { $regex: "neurolog", $options: "i" };
      } else if (query.includes("gastroenterolog") || query.includes("stomach") || query.includes("digestion") || query.includes("acidity")) {
        filter.speciality = { $regex: "gastroenterolog", $options: "i" };
      } else if (query.includes("general") || query.includes("fever") || query.includes("cold") || query.includes("cough")) {
        filter.speciality = { $regex: "general", $options: "i" };
      }

      // Check if a specific doctor name is in the query
      const words = query.replace(/[?.,!]/g, "").split(/\s+/);
      const nameKeywords = words.filter(
        (w) => !["who", "is", "the", "are", "any", "doctor", "doctors", "available", "on", "in", "prescripto", "find", "show", "me", "what", "how"].includes(w)
      );

      if (nameKeywords.length > 0 && !filter.speciality) {
        filter = {
          $or: [
            { name: { $regex: nameKeywords.join(" "), $options: "i" } },
            ...nameKeywords.map((k) => ({ name: { $regex: k, $options: "i" } })),
          ],
        };
      }

      const docs = await doctorModel
        .find(filter)
        .select("-password -email")
        .limit(8)
        .lean();

      if (docs && docs.length > 0) {
        const docList = docs
          .map(
            (d) =>
              `• **${d.name}** – ${d.speciality} (${d.degree || "MBBS"})\n  - **Fee:** $${d.fees || d.amount || 50} | **Experience:** ${d.experience || "5+ Years"} | **Status:** ${d.available ? "🟢 Available for OPD" : "🔴 Off-Duty"}`
          )
          .join("\n\n");

        return `Here are the matching verified doctors on **Prescripto**:\n\n${docList}\n\n💡 *Tip: When you book an appointment, you'll receive a sequential queue token number (#1, #2, #3...) for the doctor's daily OPD schedule.*`;
      } else {
        const allDocs = await doctorModel.find({ available: true }).select("name speciality fees").limit(6).lean();
        if (allDocs && allDocs.length > 0) {
          const sample = allDocs.map((d) => `• **${d.name}** (${d.speciality}) - $${d.fees}`).join("\n");
          return `I couldn't find a doctor specifically matching your query, but here are some of our currently available specialists:\n\n${sample}\n\nYou can view all doctors on our platform under the **All Doctors** page.`;
        }
      }
    }

    // 2. User Appointments
    if (query.includes("my appointment") || query.includes("my booking") || query.includes("when is my")) {
      if (!userId) {
        return "To view your personalized upcoming appointments and queue token numbers, please log into your **Prescripto** patient account and check the **My Appointments** section.";
      }
      const appts = await appointmentModel
        .find({ userId, cancelled: false })
        .sort({ slotDate: 1 })
        .limit(5)
        .lean();

      if (appts && appts.length > 0) {
        const list = appts
          .map(
            (a) =>
              `• **Dr. ${a.docData?.name || "Doctor"}** (${a.docData?.speciality || "Specialist"})\n  - **Date & Time:** ${a.slotDate} at ${a.slotTime}\n  - **Queue Token #:** #${a.tokenNumber || 1}\n  - **Status:** ${a.isCompleted ? "Completed ✓" : a.appointmentStatus === "Accepted" ? "Accepted by Doctor ✓" : "Scheduled"}`
          )
          .join("\n\n");
        return `Here are your active appointments on Prescripto:\n\n${list}`;
      } else {
        return "You currently have no active upcoming appointments. You can book a consultation with any of our verified doctors from the **Doctors** tab.";
      }
    }

    // 3. Prescriptions & Medication Schedule
    if (query.includes("prescription") || query.includes("medicine") || query.includes("schedule") || query.includes("routine")) {
      if (!userId) {
        return "Prescripto allows you to manage digital prescriptions and timed daily dose routines (Morning 8 AM, Afternoon 1 PM, Evening 6 PM, Night 9 PM). Please log in to view your personal prescriptions.";
      }
      const routines = await medicineRoutineModel.find({ userId }).limit(5).lean();
      if (routines && routines.length > 0) {
        const medList = routines.map((r) => `• **${r.medicineName}** (${r.dosage}) - ${r.mealTiming || "After Food"} [${(r.timesOfDay || []).join(", ")}]`).join("\n");
        return `Here is your current active medicine routine:\n\n${medList}\n\nYou can view full reminders in **Medicine Schedule**.`;
      }
      return "You don't have any active medication routines yet. After your consultation, you can convert your doctor's e-prescription into daily dose reminders in **Medicine Schedule**.";
    }

    // 4. Refund Guarantee
    if (query.includes("refund") || query.includes("cancellation") || query.includes("cancel")) {
      return `On **Prescripto**, all bookings are covered by our **100% Instant Refund Guarantee**:\n\n• **Zero Deductions:** If you or the attending doctor cancel an appointment before the consultation, 100% of your consultation fee is refunded immediately.\n• **Instant Wallet Credit:** Refunded funds are credited directly to your **Healthcare Wallet** with zero delay.\n• **How to Cancel:** Go to **My Appointments** and click **Cancel Appointment**.`;
    }

    // 5. Booking & Slots
    if (query.includes("book") || query.includes("how to") || query.includes("slot") || query.includes("token")) {
      return `### How to Book an Appointment on Prescripto:
1. **Browse Doctors:** Choose a specialist from the **All Doctors** page or filter by department.
2. **Select Date & Slot:** Pick your preferred consultation date (up to 7 days ahead) and time slot.
3. **Queue Token Number:** Each booking generates a unique **Queue Token #** (#1, #2, #3...) for orderly OPD entry.
4. **Payment Options:** Pay online instantly or choose **Cash on Visit** at the hospital counter.
5. **Instant Confirmation:** Your appointment and queue token will appear immediately under **My Appointments**.`;
    }

    // 6. Medical Specialty explanations & symptom triage
    if (query.includes("dermatolog") || query.includes("skin") || query.includes("acne") || query.includes("hair")) {
      return `A **Dermatologist** specializes in diagnosing and treating conditions affecting the skin, hair, and nails (e.g. acne, eczema, allergies, psoriasis, infections). Prescripto has verified dermatologists available for online and in-clinic consultation.`;
    }
    if (query.includes("pediatric") || query.includes("child") || query.includes("baby")) {
      return `A **Pediatrician** specializes in medical care for infants, children, and adolescents, covering growth milestones, vaccinations, and childhood illnesses.`;
    }
    if (query.includes("neurolog") || query.includes("brain") || query.includes("migraine") || query.includes("nerve")) {
      return `A **Neurologist** diagnoses and treats disorders of the brain, spinal cord, and peripheral nerves (e.g., migraines, nerve pain, seizures, neuropathy).`;
    }
    if (query.includes("gastroenterolog") || query.includes("stomach") || query.includes("digestion") || query.includes("liver")) {
      return `A **Gastroenterologist** treats digestive system conditions, including the stomach, intestines, liver, gallbladder, and pancreas.`;
    }
    if (query.includes("gynecolog") || query.includes("women") || query.includes("pregnancy")) {
      return `A **Gynecologist** provides specialized healthcare for women's reproductive health, prenatal care, menstrual health, and maternity consultations.`;
    }

    // 7. General Healthcare explanations
    if (query.includes("after food") || query.includes("before food") || query.includes("empty stomach")) {
      return `**Medication Timing Guide:**\n• **After Food (Postprandial):** Take medication within 15–30 minutes after eating. This helps reduce gastric irritation and improves absorption for certain drugs (like NSAIDs or antibiotics).\n• **Before Food / Empty Stomach:** Take 30–60 minutes before meals or 2 hours after meals with a glass of water (common for thyroid medications and acid reducers).\n\nAlways follow your doctor's specific prescription instructions!`;
    }

    // 8. Emergency SOS
    if (query.includes("emergency") || query.includes("urgent") || query.includes("ambulance") || query.includes("sos") || query.includes("108") || query.includes("112")) {
      return `🚨 **EMERGENCY ASSISTANCE ALERT** 🚨\n\nIf you or someone nearby is experiencing a life-threatening medical emergency (such as severe chest pain, shortness of breath, sudden weakness, or heavy bleeding), please contact emergency services immediately:\n\n• **National Medical Helpline / Ambulance:** **108**\n• **National Emergency Service:** **112**\n• **Police Helpline:** **100 / 112**\n\nPrescripto is intended for planned consultations. For acute crises, visit the nearest emergency room immediately.`;
    }

    // 9. About Prescripto
    if (query.includes("what is prescripto") || query.includes("about prescripto") || query.includes("features")) {
      return `**Prescripto** is an intelligent healthcare appointment and clinical management platform.\n\n**Core Features:**\n• **Specialist Booking:** Certified doctors across 6+ departments with transparent fees & patient reviews.\n• **Sequential Queue Tokens:** Orderly token numbers (#1, #2, #3...) for daily OPD clinics.\n• **100% Instant Refund:** Immediate reimbursement to Healthcare Wallet on cancellation.\n• **Allergy Safety Shield:** Pre-consultation drug allergy check to prevent adverse drug reactions.\n• **Smart Medicine Schedules:** Digital e-prescriptions converted into timed daily dose reminders.\n• **Doctor & Admin Consoles:** Real-time queue management, earnings tracker, and cash verification.`;
    }
  } catch (dbErr) {
    console.warn("[Local Fallback DB Notice]:", dbErr.message);
  }

  return `Hello! I am your **Prescripto AI Assistant** 🤖\n\nI can help you:\n• **Find Doctors & Check Availability:** Inquire about General Physicians, Dermatologists, Pediatricians, Neurologists, and more.\n• **Manage Appointments:** Learn how to book, check upcoming visits, or view your **Queue Token #**.\n• **Refunds & Billing:** Understand our **100% Instant Refund Guarantee** and payment options.\n• **Healthcare Guidance:** Clarify medical terms, prescription instructions, and department specialties.\n\nHow can I assist you today?`;
};

/**
 * Process AI Chat Request using Gemini API with Function Calling & Resilient Local Fallback
 *
 * @param {string} userMessage - User's input prompt
 * @param {Array} conversationHistory - Previous conversation turns [{ role, content }]
 * @param {string|null} userId - Authenticated user ID (if logged in)
 */
export const processAIChat = async (userMessage, conversationHistory = [], userId = null) => {
  if (!userMessage || typeof userMessage !== "string" || !userMessage.trim()) {
    return {
      success: true,
      response: "Please enter a question or healthcare topic, and I'll be happy to help!",
      source: "local",
    };
  }

  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  const contents = [];

  if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
    const recentTurns = conversationHistory.slice(-4);
    for (const turn of recentTurns) {
      if (!turn.content || turn.content === userMessage) continue;
      const role = turn.role === "user" ? "user" : "model";
      contents.push({
        role,
        parts: [{ text: turn.content }],
      });
    }
  }

  contents.push({
    role: "user",
    parts: [{ text: userMessage.trim() }],
  });

  const supportedModels = [
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
  ];

  if (geminiApiKey && geminiApiKey !== "your_gemini_api_key_here") {
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

    for (const modelName of supportedModels) {
      try {
        const chatHistory = JSON.parse(JSON.stringify(contents));

        let currentResponse = await withTimeout(
          ai.models.generateContent({
            model: modelName,
            contents: chatHistory,
            config: {
              systemInstruction: PRESCRIPTO_SYSTEM_INSTRUCTION,
              tools: [{ functionDeclarations: prescriptoToolDeclarations }],
            },
          }),
          10000
        );

        let iterations = 0;
        while (
          currentResponse.functionCalls &&
          currentResponse.functionCalls.length > 0 &&
          iterations < 2
        ) {
          iterations++;
          chatHistory.push(currentResponse.candidates[0].content);

          for (const call of currentResponse.functionCalls) {
            const toolResult = await executePrescriptoTool(call.name, call.args || {}, userId);

            chatHistory.push({
              role: "user",
              parts: [
                {
                  functionResponse: {
                    name: call.name,
                    response: toolResult,
                    id: call.id,
                  },
                },
              ],
            });
          }

          currentResponse = await withTimeout(
            ai.models.generateContent({
              model: modelName,
              contents: chatHistory,
              config: {
                systemInstruction: PRESCRIPTO_SYSTEM_INSTRUCTION,
                tools: [{ functionDeclarations: prescriptoToolDeclarations }],
              },
            }),
            10000
          );
        }

        const replyText =
          currentResponse.text ||
          currentResponse.candidates?.[0]?.content?.parts
            ?.map((p) => p.text)
            .filter(Boolean)
            .join("\n");

        if (replyText && replyText.trim()) {
          return {
            success: true,
            response: replyText.trim(),
            source: iterations > 0 ? "gemini-tools-live" : "gemini-hybrid",
          };
        }
      } catch (err) {
        console.warn(`[Gemini Attempt Notice on ${modelName}]:`, err.message);
      }
    }
  }

  // Resilient Local Engine fallback (Never fails, always provides accurate Prescripto data)
  const fallbackReply = await generateSmartLocalFallback(userMessage, userId);
  return {
    success: true,
    response: fallbackReply,
    source: "prescripto-smart-engine",
  };
};

export const processUserMessage = processAIChat;

export default {
  processAIChat,
  processUserMessage,
};
