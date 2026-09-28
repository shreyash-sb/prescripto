import { GoogleGenAI } from "@google/genai";
import { prescriptoToolDeclarations, executePrescriptoTool } from "./aiTools.js";
import doctorModel from "../../models/doctorModel.js";
import appointmentModel from "../../models/appointmentModel.js";
import medicineRoutineModel from "../../models/medicineRoutineModel.js";

const IMPROVEMENT_STAGE_MESSAGE = `⚠️ **Prescripto Assistant is currently in the improvement stage for general non-healthcare and off-topic questions.**

I am specifically trained and optimized to assist you with:
• **Platform & Booking:** How Prescripto works, booking appointments, queue tokens (#1, #2...), and our 100% instant refund guarantee
• **Doctor Discovery:** Verified specialists, real-time availability, consultation fees, and clinic details
• **Health & Symptoms:** Medical explanations, wellness tips, precautions, and symptom triage (positive & negative)
• **Medicines & Prescriptions:** Uses, dosages, meal timings (before/after food), side effects, and routine dose reminders

How can I assist you with your health, medicines, or Prescripto consultation today?`;

const PRESCRIPTO_SYSTEM_INSTRUCTION = `You are the Prescripto AI Assistant — a specialized, knowledgeable, and empathetic healthcare and platform guide for Prescripto.

============================================================
STRICT TOPIC SCOPE & DOMAIN BOUNDARY:
============================================================
You are exclusively designed to answer questions within these four core domains:
1. PRESCRIPTO PLATFORM & WORKING:
   • Booking procedures, 7-day slot availability, sequential queue tokens (#1, #2, #3...)
   • 100% Instant Refund Guarantee on cancellation (zero deductions, immediate wallet credit)
   • Payment methods (Cards, UPI dynamic QR, Cash on Visit at clinic)
   • Patient health profile, medical allergy safety shield, digital e-prescriptions, daily medicine routine timers, follow-up tracking, privacy access audit logs, emergency SOS
   • Doctor and Admin consoles & clinic workflows
2. DOCTORS & SPECIALISTS:
   • Finding verified doctors across departments (General Physician, Gynecologist, Dermatologist, Pediatrician, Neurologist, Gastroenterologist, Cardiologist, etc.)
   • Doctor qualifications, experience, ratings, consultation fees in Indian Rupees (₹), clinic address & OPD room numbers
   • Live queue crowd levels (Low, Moderate, Busy) and estimated wait times
3. HEALTH, SYMPTOMS & WELLNESS (Positive & Negative aspects):
   • Positive: Preventive health habits, wellness guidance, nutrition, sleep, hydration, exercise
   • Negative & Warning Signs: Fever, chills, body aches, persistent cough, cold, flu, chest pain/tightness (emergency triage), shortness of breath, sudden weakness, dizziness, high/low BP, diabetes management, skin rashes, digestive issues, allergies
   • Diagnostic tests explanations (e.g. MRI vs CT scan, X-Ray, ECG, blood tests)
   • First aid basics, self-care precautions, when to seek urgent doctor consultation vs emergency services (108/112)
4. MEDICINES & PRESCRIPTIONS (Positive & Negative aspects):
   • Common medications (Paracetamol, Amoxicillin, Ibuprofen, Metformin, Cetirizine, Antacids, Antibiotics, etc.)
   • Indications, dosage concepts, meal timing (before food / after food / empty stomach)
   • Positive health benefits of prescription adherence
   • Negative side effects, drug interactions, contraindications, allergy warnings (Penicillin, Sulfa, Aspirin)
   • What to do on missed doses and safety precautions

============================================================
STRICT RULE FOR OFF-TOPIC / UNRELATED / MISSING INFORMATION:
============================================================
• If the user's question is OUTSIDE healthcare, medicines, symptoms, medical tests, doctors, or Prescripto platform working (e.g. general programming/coding for video games, politics, movies, entertainment, sports trivia, stock trading, crypto, cooking recipes, personal chit-chat, or random topics), OR if the answer/information is not available or unknown:
• You MUST NOT invent, hallucinate, or give generic useless answers.
• Instead, politely and clearly inform the user that the chatbot is currently in the improvement stage for general off-topic queries:
${IMPROVEMENT_STAGE_MESSAGE}

============================================================
RULES FOR LIVE DATABASE TOOLS:
============================================================
• Whenever a user asks for live or changing Prescripto information (e.g., "Which doctors are available?", "Do you have a dermatologist?", "Who is Dr. Richard?", "When is my next appointment?", "Show my prescriptions"), ALWAYS use the provided tools.
• NEVER invent or hallucinate doctor names, appointment dates, fees, or prescription records.
• If a tool returns no matches (e.g. no cardiologist found), explicitly tell the user that no matching doctor was found in the Prescripto database.
• For private user data ('getMyAppointments', 'getMyPrescriptions'), if the tool reports that the user is not signed in, politely prompt them to log into their Prescripto account.

============================================================
MEDICAL SAFETY GUARDRAILS:
============================================================
• You may provide clear educational medical explanations (e.g., what paracetamol is, what an ECG is, what "after food" means, basic first-aid).
• NEVER diagnose a specific illness, prescribe medications, recommend personalized drug dosages, or tell a user to start/stop medications.
• For specific medical treatment, always advise consulting a certified doctor on Prescripto or visiting a healthcare facility.
• For severe acute emergencies (severe chest pain, difficulty breathing, heavy bleeding, stroke symptoms), immediately urge the user to call emergency services (108/112).

Tone: Professional, warm, concise, and clear.`;

const withTimeout = (promise, ms = 25000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`AI Request timed out after ${ms}ms`)), ms)
    ),
  ]);
};

/**
 * Checks if a query is within the healthcare, medicine, doctor, or Prescripto platform domain
 */
const isHealthcareOrPlatformQuery = (query) => {
  const q = query.toLowerCase().trim();
  if (!q) return false;

  const healthcareKeywords = [
    // Platform & Booking
    "prescripto", "book", "appointment", "slot", "token", "queue", "opd", "refund",
    "cancel", "cancellation", "wallet", "pay", "payment", "card", "upi", "cash",
    "fee", "cost", "receipt", "invoice", "schedule", "routine", "audit", "privacy",
    "sos", "emergency", "helpline", "108", "112", "login", "register", "account",
    "profile", "doctor", "doctors", "specialist", "physician", "clinic", "hospital",
    "admin", "portal", "console", "dr.", "dr ", "room", "wait", "crowd",

    // Specialties & Departments
    "dermatolog", "skin", "acne", "rash", "eczema", "hair", "psoriasis",
    "gynecolog", "women", "period", "menstrual", "pregnancy", "prenatal", "maternity", "cramp",
    "pediatric", "child", "baby", "infant", "toddler", "vaccine", "vaccination",
    "neurolog", "brain", "nerve", "headache", "migraine", "seizure", "stroke", "paralysis",
    "gastroenterolog", "stomach", "digestion", "liver", "acid", "acidity", "gerd", "reflux", "gut",
    "cardiolog", "heart", "chest", "bp", "blood pressure", "hypertension", "pulse",
    "orthopedic", "bone", "joint", "fracture", "arthritis", "sprain",
    "ent", "ear", "nose", "throat", "sinus", "tonsil",
    "psychiat", "mental", "stress", "anxiety", "depression", "sleep", "insomnia",

    // Symptoms & Health (Positive & Negative)
    "health", "healthy", "symptom", "illness", "disease", "fever", "temperature", "chill",
    "cold", "cough", "flu", "pain", "ache", "sore", "infection", "bleed", "bleeding",
    "dizzy", "dizziness", "nausea", "vomit", "vomiting", "diarrhea", "loose motion",
    "fatigue", "tired", "weakness", "shortness of breath", "breathless", "breathing",
    "asthma", "wheezing", "allergy", "allergic", "swelling", "swollen", "diabetic", "diabetes",
    "sugar", "glucose", "thyroid", "cholesterol", "diet", "nutrition", "water", "hydration",
    "exercise", "wellness", "fitness", "lifestyle", "prevention", "first aid", "bandage",
    "wound", "burn", "cut", "injury",

    // Medicines & Prescriptions (Positive & Negative)
    "medicine", "medicines", "medication", "drug", "drugs", "prescription", "rx", "pill",
    "tablet", "capsule", "syrup", "dose", "dosage", "paracetamol", "acetaminophen",
    "amoxicillin", "antibiotic", "antibiotics", "ibuprofen", "advil", "aspirin", "azithromycin",
    "metformin", "omeprazole", "pantoprazole", "antacid", "cetirizine", "antihistamine",
    "cough syrup", "vitamin", "multivitamin", "supplement", "after food", "before food",
    "empty stomach", "meal", "side effect", "side effects", "adverse", "contraindication",
    "interaction", "missed dose", "overdose", "penicillin", "sulfa", "safe", "safety",

    // Tests & Diagnostics
    "mri", "ct scan", "cat scan", "x-ray", "xray", "ultrasound", "sonography", "ecg",
    "ekg", "blood test", "urine test", "lab test", "biopsy", "scan", "diagnosis", "test"
  ];

  return healthcareKeywords.some((keyword) => q.includes(keyword));
};

/**
 * Intelligent Database-Backed Local Engine
 * Provides rich positive/negative health, medicine, doctor, and platform answers,
 * and strictly returns the "improvement stage" message for off-topic/unrelated queries.
 */
const generateSmartLocalFallback = async (userMessage, userId = null) => {
  const query = userMessage.toLowerCase().trim();

  // If the query is not related to healthcare or the platform, strictly return improvement stage
  if (!isHealthcareOrPlatformQuery(query)) {
    return IMPROVEMENT_STAGE_MESSAGE;
  }

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
      query.includes("cardiolog") ||
      query.includes("orthopedic") ||
      query.includes("dr.") ||
      query.includes("dr ")
    ) {
      let filter = { available: true };

      if (query.includes("dermatolog") || query.includes("skin") || query.includes("rash") || query.includes("acne")) {
        filter.speciality = { $regex: "dermatolog", $options: "i" };
      } else if (query.includes("gynecolog") || query.includes("women") || query.includes("pregnancy") || query.includes("period")) {
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
        (w) => !["who", "is", "the", "are", "any", "doctor", "doctors", "available", "on", "in", "prescripto", "find", "show", "me", "what", "how", "list", "which"].includes(w)
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
              `• **${d.name}** – ${d.speciality} (${d.degree || "MBBS"})\n  - **Fee:** ₹${d.fees || d.amount || 500} | **Experience:** ${d.experience || "5+ Years"} | **Status:** ${d.available ? "🟢 Available for OPD" : "🔴 Off-Duty"}\n  - **Clinic / Room:** ${d.address?.line1 || "Main Clinic"}, Room ${d.roomNumber || "OPD-101"}`
          )
          .join("\n\n");

        return `Here are the matching verified doctors on **Prescripto**:\n\n${docList}\n\n💡 *Tip: When you book an appointment, you will automatically receive a sequential queue token number (#1, #2, #3...) for the doctor's daily OPD schedule.*`;
      } else {
        const allDocs = await doctorModel.find({ available: true }).select("name speciality fees experience").limit(6).lean();
        if (allDocs && allDocs.length > 0) {
          const sample = allDocs.map((d) => `• **${d.name}** (${d.speciality}) - ₹${d.fees} [${d.experience} exp]`).join("\n");
          return `I couldn't find a doctor specifically matching that name or specialty in our database, but here are some of our currently available specialists:\n\n${sample}\n\nYou can view all verified doctors under the **All Doctors** tab.`;
        }
      }
    }

    // 2. User Appointments & Queue Tokens
    if (query.includes("my appointment") || query.includes("my booking") || query.includes("when is my") || (query.includes("token") && query.includes("my"))) {
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
              `• **Dr. ${a.docData?.name || "Doctor"}** (${a.docData?.speciality || "Specialist"})\n  - **Date & Time:** ${a.slotDate} at ${a.slotTime}\n  - **Queue Token #:** #${a.tokenNumber || 1}\n  - **Status:** ${a.isCompleted ? "Completed ✓" : a.appointmentStatus === "Accepted" ? "Accepted by Doctor ✓" : "Scheduled (Pending Review)"}\n  - **Payment:** ${a.payment ? `Paid (${a.paymentMethod || "Online"})` : "Payment Due"}`
          )
          .join("\n\n");
        return `Here are your active appointments on Prescripto:\n\n${list}`;
      } else {
        return "You currently have no active upcoming appointments. You can browse specialists and schedule a visit from the **All Doctors** page.";
      }
    }

    // 3. Prescriptions & Medication Schedule
    if (query.includes("my prescription") || query.includes("my medicine") || query.includes("my routine") || query.includes("my schedule")) {
      if (!userId) {
        return "Prescripto allows you to manage digital prescriptions and timed daily dose routines (Morning 8 AM, Afternoon 1 PM, Evening 6 PM, Night 9 PM). Please log in to view your personal prescriptions.";
      }
      const routines = await medicineRoutineModel.find({ userId }).limit(5).lean();
      if (routines && routines.length > 0) {
        const medList = routines.map((r) => `• **${r.medicineName}** (${r.dosage}) - ${r.mealTiming || "After Food"} [${(r.timesOfDay || []).join(", ")}]`).join("\n");
        return `Here is your current active medicine routine:\n\n${medList}\n\nYou can view full reminders and log your daily doses in **Medicine Schedule**.`;
      }
      return "You don't have any active medication routines yet. After your consultation, you can convert your doctor's e-prescription into daily dose reminders in **Medicine Schedule**.";
    }

    // 4. 100% Instant Refund Guarantee & Cancellation Rules (Positive & Negative)
    if (query.includes("refund") || query.includes("cancellation") || query.includes("cancel") || query.includes("money back")) {
      return `### 100% Instant Refund Guarantee on Prescripto:
• **Zero Cancellation Fees:** If you or the attending doctor cancel an appointment before the consultation, 100% of your consultation fee is refunded immediately.
• **Instant Healthcare Wallet Credit:** Refunded amounts are credited directly into your **Healthcare Wallet** instantly with zero waiting period.
• **Doctor Rejection Protection:** If a doctor is unable to accept your submitted consultation case, your booking is cancelled and 100% reimbursed automatically.
• **How to Cancel:** Go to **My Appointments**, locate the scheduled booking, and click **Cancel Appointment**.`;
    }

    // 5. Booking Process, Slots, Sequential Tokens, and Payments
    if (query.includes("book") || query.includes("how to") || query.includes("slot") || query.includes("token") || query.includes("payment") || query.includes("upi") || query.includes("cash")) {
      return `### How Appointment Booking & Tokens Work on Prescripto:
1. **Browse Doctors:** Select a specialist by department (General Physician, Dermatologist, Gynecologist, Neurologist, etc.) or search by doctor name.
2. **Select Date & Slot:** Pick your preferred consultation date (up to 7 days in advance) and a 30-minute time slot (Morning, Afternoon, or Evening).
3. **Sequential Queue Token #:** Every booking automatically generates an orderly sequential **Token #** (#1, #2, #3...) for the doctor's daily OPD queue.
4. **Submit Medical Case:** Briefly describe your symptoms so the doctor can review your case prior to entry.
5. **Flexible Payment Options:** Pay online via Card / UPI dynamic QR code, or select **Cash on Visit** at the clinic counter.
6. **Confirmation & Status:** Track your token and acceptance in real-time under **My Appointments**.`;
    }

    // 6. MEDICINES & DRUG GUIDELINES (Positive & Negative Questions)
    // Paracetamol / Acetaminophen
    if (query.includes("paracetamol") || query.includes("acetaminophen") || query.includes("tylenol") || query.includes("dolo") || query.includes("crocin")) {
      return `### 💊 Paracetamol (Acetaminophen) Medical Guide

**Positive Uses & Benefits:**
• Relieves mild-to-moderate pain (headaches, muscle aches, toothaches, backaches).
• Effectively lowers fever (antipyretic) in viral or bacterial infections.

**Negative Aspects, Side Effects & Cautions:**
• **Meal Timing:** Usually safe on an empty stomach or with a light snack, but taking with water after food helps prevent mild stomach discomfort.
• **Maximum Safe Limit:** Adults must **never exceed 4,000 mg (4 grams)** within 24 hours. Keep doses spaced at least 4 to 6 hours apart.
• **Liver Toxicity Warning:** Severe liver damage can occur with overdose or when combined with alcohol.
• **Allergy Caution:** If you experience skin rashes, swelling, or breathing difficulty, discontinue immediately and seek medical care.`;
    }

    // Ibuprofen / NSAIDs
    if (query.includes("ibuprofen") || query.includes("nsaid") || query.includes("advil") || query.includes("motrin") || query.includes("combiflam")) {
      return `### 💊 Ibuprofen (NSAID) Medical Guide

**Positive Uses & Benefits:**
• Non-Steroidal Anti-Inflammatory Drug (NSAID) that reduces swelling, inflammation, dental pain, arthritis, and body aches.

**Negative Aspects, Side Effects & Cautions:**
• **MUST Take After Food:** Always take Ibuprofen with food, milk, or a full meal. Taking on an empty stomach can cause gastric irritation, acidity, or stomach ulcers.
• **Side Effects:** May cause heartburn, stomach upset, nausea, dizziness, or fluid retention.
• **Contraindications:** Avoid if you have active stomach ulcers, severe kidney disease, or a known aspirin/NSAID allergy. Consult a doctor before combining with blood pressure medications.`;
    }

    // Amoxicillin / Antibiotics
    if (query.includes("amoxicillin") || query.includes("antibiotic") || query.includes("azithromycin") || query.includes("augmentin") || query.includes("penicillin")) {
      return `### 💊 Antibiotics (e.g. Amoxicillin, Azithromycin) Medical Guide

**Positive Uses & Benefits:**
• Prescribed exclusively to kill or inhibit the growth of **bacterial infections** (e.g. bacterial throat infections, ear infections, chest infections, skin infections).

**Negative Aspects, Side Effects & Cautions:**
• **Ineffective Against Viruses:** Antibiotics do **NOT** cure viral colds, flu, or viral coughs.
• **Complete Full Course:** Always finish the entire course prescribed by your doctor, even if symptoms improve early. Stopping early causes **antibiotic resistance**.
• **Common Side Effects:** Mild diarrhea, nausea, stomach cramping, or yeast infections. Take with meals and adequate water to reduce nausea.
• **Severe Allergy Warning:** If allergic to Penicillin, inform your doctor immediately so safe non-penicillin alternatives can be selected. Document this in your **Prescripto Allergy Shield**.`;
    }

    // Metformin / Diabetes
    if (query.includes("metformin") || query.includes("glycomet") || query.includes("diabetes medicine")) {
      return `### 💊 Metformin (Type-2 Diabetes) Guide

**Positive Uses & Benefits:**
• First-line medication to lower blood glucose levels and increase insulin sensitivity in Type-2 Diabetes.

**Negative Aspects, Side Effects & Cautions:**
• **Timing:** Always take with or immediately after meals to minimize stomach upset.
• **Common Side Effects:** Nausea, diarrhea, abdominal bloating, metallic taste. These typically subside after 1-2 weeks.
• **Caution:** Avoid heavy alcohol consumption while taking Metformin to prevent lactic acidosis.`;
    }

    // Omeprazole / Pantoprazole / Antacids / Acidity
    if (query.includes("omeprazole") || query.includes("pantoprazole") || query.includes("antacid") || query.includes("pan 40") || query.includes("pantocid") || query.includes("digene") || query.includes("gelusil")) {
      return `### 💊 Antacids & Proton Pump Inhibitors (PPIs) Guide

**Positive Uses & Benefits:**
• Reduces stomach acid production, treating acid reflux (GERD), heartburn, gastric ulcers, and indigestion.

**Negative Aspects, Meal Timing & Cautions:**
• **Meal Timing for PPIs (Omeprazole, Pantoprazole):** Take **30 to 60 minutes BEFORE breakfast on an empty stomach** with water for optimal acid suppression.
• **Liquid Antacids (Digene, Gelusil):** Take 1 hour after meals or at bedtime when heartburn occurs.
• **Side Effects:** Extended unmonitored use may affect calcium and Vitamin B12 absorption. Avoid self-medicating beyond 14 days without a physician consultation.`;
    }

    // Cetirizine / Antihistamines / Allergies
    if (query.includes("cetirizine") || query.includes("allegra") || query.includes("fexofenadine") || query.includes("antihistamine") || query.includes("zyrtec")) {
      return `### 💊 Cetirizine & Antihistamines Guide

**Positive Uses & Benefits:**
• Blocks histamine to relieve seasonal allergy symptoms, sneezing, runny nose, watery eyes, itching, and hives.

**Negative Aspects & Side Effects:**
• **Timing:** Best taken in the evening or night.
• **Drowsiness:** Can cause mild drowsiness, fatigue, or dry mouth. Avoid driving or operating heavy machinery if feeling sleepy.
• **Alcohol Caution:** Do not combine with alcohol or sedatives as it intensifies drowsiness.`;
    }

    // Meal Timing Concepts ("After Food", "Before Food", "Empty Stomach")
    if (query.includes("after food") || query.includes("before food") || query.includes("empty stomach") || query.includes("with food")) {
      return `### 🍽️ Medication Meal Timing Guide

• **After Food (Postprandial):** Take medication within 15–30 minutes after completing your meal. This coats the stomach lining, prevents gastric irritation/ulcers (critical for NSAIDs like Ibuprofen), and enhances absorption for fat-soluble drugs.
• **Before Food / Empty Stomach:** Take 30–60 minutes before eating, or 2 hours after a meal with a full glass of water. Common for thyroid hormone (Levothyroxine) and acid-reducing PPIs (Pantoprazole).
• **With Food:** Take in the middle of your meal to prevent gastrointestinal upset (common with Metformin and Iron supplements).
• **At Bedtime:** Take 15–30 minutes before sleep (common for cholesterol medications or sedating antihistamines).

Always follow the specific instructions on your Prescripto digital prescription!`;
    }

    // Missed Dose Guidance
    if (query.includes("missed dose") || query.includes("forgot to take") || query.includes("forgot medicine")) {
      return `### ⏰ What to Do If You Miss a Medication Dose:
• **Take It When Remembered:** If you remember within a few hours, take the missed dose immediately.
• **Skip If Next Dose is Soon:** If it is almost time for your next scheduled dose, skip the missed dose and resume your regular schedule.
• **NEVER Double Up:** Do not take two doses at once to make up for a missed dose, as this can cause accidental toxicity.
• **Use Prescripto Routine Timers:** Enable daily reminders in **Medicine Schedule** to avoid missed doses!`;
    }

    // 7. HEALTH & SYMPTOMS GUIDANCE (Positive & Negative Questions)
    // Fever / High Temperature / Chills
    if (query.includes("fever") || query.includes("high temperature") || query.includes("chills") || query.includes("shivering")) {
      return `### 🌡️ Fever & High Temperature Guidance

**Positive Care Steps:**
• Rest and stay hydrated with water, electrolytes, and warm broths.
• Use a light cotton blanket; do not over-bundle.
• Paracetamol (500mg/650mg for adults) can be used as directed to reduce discomfort.

**Negative Red Flags (Seek Doctor Immediately):**
• Temperature above **103°F (39.4°C)** or fever lasting more than 3 consecutive days.
• Stiff neck, severe headache, confusion, or sudden skin rash.
• Difficulty breathing or persistent vomiting.

💡 *Recommended Specialist on Prescripto:* Consult a **General Physician**.`;
    }

    // Cough, Cold & Sore Throat
    if (query.includes("cough") || query.includes("cold") || query.includes("sore throat") || query.includes("throat pain") || query.includes("runny nose")) {
      return `### 🤧 Cough, Cold & Sore Throat Guidance

**Self-Care Precautions:**
• Warm salt-water gargles 3-4 times daily for throat inflammation.
• Steam inhalation with plain water to clear nasal congestion.
• Stay hydrated with warm fluids (herbal teas, honey with warm water).

**When to See a Specialist:**
• Cough producing dark yellow/green phlegm or blood.
• Inability to swallow fluids or high fever lasting over 3 days.
• Shortness of breath or persistent chest tightness.

💡 *Recommended Specialist on Prescripto:* Consult a **General Physician** or **ENT Specialist**.`;
    }

    // Chest Pain / Emergency Triage (Negative / Red Flag)
    if (query.includes("chest pain") || query.includes("chest tightness") || query.includes("heart attack") || query.includes("stroke") || query.includes("shortness of breath") || query.includes("cannot breathe")) {
      return `🚨 **CRITICAL MEDICAL EMERGENCY ALERT** 🚨

If you or someone nearby is experiencing:
• Crushing or squeezing chest pain spreading to the jaw, neck, back, or left arm
• Sudden shortness of breath, cold sweats, or extreme dizziness
• Sudden facial drooping, arm weakness, or slurred speech (Stroke FAST signs)

**PLEASE CALL NATIONAL EMERGENCY SERVICES IMMEDIATELY:**
• **National Medical Helpline / Ambulance:** **108**
• **National Emergency Service:** **112**

*Prescripto is intended for elective, scheduled outpatient consultations. Please proceed to the nearest Emergency Room right away for acute crises.*`;
    }

    // Skin Rashes, Acne, Eczema
    if (query.includes("dermatolog") || query.includes("skin") || query.includes("rash") || query.includes("acne") || query.includes("eczema") || query.includes("itching") || query.includes("psoriasis")) {
      return `### 🧴 Skin & Dermatology Health Guidance

**Care Tips:**
• Keep the affected skin clean and gently moisturized with fragrance-free lotion.
• Avoid scratching to prevent secondary bacterial infection.
• Avoid hot water baths and harsh chemical soaps.

**Specialist Role:**
• A **Dermatologist** specializes in treating acne, eczema, psoriasis, fungal infections, allergic contact dermatitis, and hair loss.

💡 *Check our **All Doctors** page to consult a verified Dermatologist on Prescripto.*`;
    }

    // Stomach Pain, Acidity, Digestion, Diarrhea
    if (query.includes("gastroenterolog") || query.includes("stomach") || query.includes("acidity") || query.includes("digestion") || query.includes("diarrhea") || query.includes("vomiting") || query.includes("constipation")) {
      return `### 🫄 Digestive Health & Gastroenterology Guide

**Care Tips:**
• Eat small, frequent meals rather than large heavy dinners.
• Stay upright for at least 2 hours after eating to prevent acid reflux.
• For loose motions/diarrhea: Drink Oral Rehydration Salts (ORS), coconut water, and bland foods (bananas, rice, applesauce).

**When to Seek Medical Care:**
• Severe localized abdominal pain (especially lower right abdomen).
• Blood in stool or vomit.
• Inability to keep fluids down for more than 12 hours.

💡 *Recommended Specialist on Prescripto:* Consult a **Gastroenterologist**.`;
    }

    // Headaches & Migraines
    if (query.includes("neurolog") || query.includes("headache") || query.includes("migraine") || query.includes("nerve") || query.includes("dizziness")) {
      return `### 🧠 Headache & Neurology Health Guide

**Care Tips:**
• Rest in a quiet, dark room during migraine episodes.
• Apply a cold compress to your forehead or temples.
• Ensure adequate hydration and consistent sleep cycles.

**Red Flags:**
• Sudden "thunderclap" headache (most severe headache of your life).
• Headache accompanied by fever, stiff neck, confusion, numbness, or vision loss.

💡 *Recommended Specialist on Prescripto:* Consult a **Neurologist**.`;
    }

    // Children & Infant Care
    if (query.includes("pediatric") || query.includes("child") || query.includes("baby") || query.includes("infant") || query.includes("toddler") || query.includes("vaccination")) {
      return `### 👶 Pediatric Care & Child Health Guide

• **Pediatricians** specialize in developmental milestones, growth tracking, childhood immunizations, respiratory infections, and infant nutrition.
• **Infant Care Alert:** Any infant under 3 months with a rectal temperature of 100.4°F (38°C) or higher requires immediate medical evaluation by a pediatrician.

💡 *Check our **All Doctors** page to consult a certified Pediatrician on Prescripto.*`;
    }

    // Women's Health & Maternity
    if (query.includes("gynecolog") || query.includes("women") || query.includes("pregnancy") || query.includes("menstrual") || query.includes("period") || query.includes("cramps")) {
      return `### 🌸 Women's Health & Gynecology Guide

• **Gynecologists** provide specialized care for reproductive health, menstrual irregularities, PCOS/PCOD management, prenatal maternity care, and wellness screenings.
• Use warm compresses or approved pain relief for severe period cramps, and maintain routine annual checkups.

💡 *Check our **All Doctors** page to consult a certified Gynecologist on Prescripto.*`;
    }

    // Positive Lifestyle & Wellness Habits
    if (query.includes("wellness") || query.includes("lifestyle") || query.includes("diet") || query.includes("healthy") || query.includes("water") || query.includes("sleep") || query.includes("nutrition")) {
      return `### 🌿 Positive Health & Wellness Foundations

1. **Hydration:** Drink 2 to 3 liters of clean water daily for optimal organ function, skin elasticity, and digestion.
2. **Quality Sleep:** Maintain 7 to 8 hours of restorative sleep on a consistent bedtime schedule.
3. **Balanced Nutrition:** Incorporate fresh vegetables, whole grains, lean proteins, and fiber while minimizing refined sugars and trans fats.
4. **Daily Physical Activity:** Aim for at least 30 minutes of moderate activity (brisk walking, cycling, yoga) 5 days a week.
5. **Preventive Screenings:** Schedule regular health checkups with our verified **General Physicians** on Prescripto!`;
    }

    // Diagnostic Scans (MRI vs CT Scan)
    if (query.includes("mri") || query.includes("ct scan") || query.includes("x-ray") || query.includes("ecg") || query.includes("ultrasound")) {
      if ((query.includes("mri") && query.includes("ct")) || query.includes("mri vs ct") || query.includes("difference")) {
        return `### 🔬 Diagnostic Imaging Comparison: MRI vs. CT Scan

| Feature | CT Scan (Computed Tomography) | MRI (Magnetic Resonance Imaging) |
| :--- | :--- | :--- |
| **Technology** | Rotating X-rays (ionizing radiation) | Strong magnetic fields & radio waves |
| **Best For** | Bone fractures, acute trauma, chest/lungs, internal bleeding | Soft tissues, brain, spinal cord, ligaments, tendons, joints |
| **Scan Speed** | Very fast (under 5 minutes) | Slower (20 to 45 minutes) |
| **Radiation** | Contains low-dose radiation | **Zero radiation** |
| **Safety** | Compatible with most metal implants | **No magnetic metal or pacemakers allowed** |

💡 *Summary: Doctors typically order a **CT scan** for emergency trauma, fractures, or chest infections, and an **MRI** when high-detail views of soft tissue (brain, spinal cord, joints) are needed.*`;
      }
      if (query.includes("mri")) {
        return `**MRI (Magnetic Resonance Imaging):**\n• Uses powerful magnetic fields and radio waves (zero radiation) to create detailed 3D cross-sections of soft tissues, the brain, spine, and joints.\n• **Safety:** Patients with pacemakers or ferromagnetic metal implants cannot enter an MRI scanner.`;
      }
      if (query.includes("ct scan")) {
        return `**CT Scan (Computed Tomography):**\n• Combines multiple X-ray images to generate cross-sectional views of bones, organs, and blood vessels in under 5 minutes.\n• Ideal for acute emergencies, fractures, chest scans, and abdominal assessments.`;
      }
    }

    // About Prescripto Platform Features
    if (query.includes("what is prescripto") || query.includes("about prescripto") || query.includes("feature")) {
      return `### 🏥 About Prescripto Healthcare Platform

**Prescripto** is a full-featured clinical management and outpatient booking platform designed for seamless patient-doctor interactions:

• **Verified Specialists:** Certified doctors across 6+ clinical departments with transparent fees and genuine patient reviews.
• **Sequential Queue Tokens:** Automatic sequential Token # (#1, #2, #3...) for orderly, predictable daily OPD entry.
• **100% Instant Refund Guarantee:** Zero cancellation fee — immediate reimbursement to your Healthcare Wallet upon cancellation.
• **Allergy Safety Shield:** Document known drug allergies to alert doctors before any prescription is generated.
• **Smart Medicine Schedule:** Convert doctor e-prescriptions into timed daily reminders (Morning, Afternoon, Evening, Night) with adherence tracking.
• **Privacy Audit Logs:** Transparent HIPAA-style access logs showing exactly which doctor or admin accessed your records and when.
• **Emergency SOS:** Instant access to national helplines (108/112) for acute medical crises.`;
    }
  } catch (dbErr) {
    console.warn("[Local Engine Notice]:", dbErr.message);
  }

  // Final catch-all for any healthcare query that wasn't matched above
  return `Hello! I am your **Prescripto AI Assistant** 🤖\n\nI can help you:\n• **Find Verified Doctors & Check Live Availability**\n• **Understand Booking, Queue Tokens (#1, #2...), and 100% Instant Refunds**\n• **Explain Health Conditions, Symptoms & Precautions (Positive & Negative)**\n• **Medicine Guidelines, Dosages, Meal Timings & Side Effects**\n\nHow can I assist you with your healthcare today?`;
};

/**
 * Process AI Chat Request using Gemini API with Function Calling & Strict Domain Filtering
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

  const query = userMessage.trim();

  // Strict domain check: If query is clearly off-topic / unrelated, return improvement stage immediately
  if (!isHealthcareOrPlatformQuery(query)) {
    return {
      success: true,
      response: IMPROVEMENT_STAGE_MESSAGE,
      source: "prescripto-domain-guard",
    };
  }

  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  const contents = [];

  if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
    const recentTurns = conversationHistory.slice(-4);
    for (const turn of recentTurns) {
      if (!turn.content || turn.content === query) continue;
      const role = turn.role === "user" ? "user" : "model";
      contents.push({
        role,
        parts: [{ text: turn.content }],
      });
    }
  }

  contents.push({
    role: "user",
    parts: [{ text: query }],
  });

  const supportedModels = [
    "gemini-flash-lite-latest",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
    "gemini-3.8-flash",
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
          25000
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
            25000
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

  // Resilient Local Engine fallback (Always provides rich domain answers or improvement stage notice)
  const fallbackReply = await generateSmartLocalFallback(query, userId);
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
