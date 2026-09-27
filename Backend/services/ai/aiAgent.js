import { GoogleGenAI } from "@google/genai";
import { prescriptoToolDeclarations, executePrescriptoTool } from "./aiTools.js";

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

/**
 * Process AI Chat Request using Gemini API with Function Calling
 *
 * @param {string} userMessage - User's input prompt
 * @param {Array} conversationHistory - Previous conversation turns [{ role, content }]
 * @param {string|null} userId - Authenticated user ID (if logged in)
 */
export const processAIChat = async (userMessage, conversationHistory = [], userId = null) => {
  if (!userMessage || typeof userMessage !== "string" || !userMessage.trim()) {
    return {
      success: false,
      response: "Please enter a message.",
    };
  }

  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!geminiApiKey || geminiApiKey === "your_gemini_api_key_here") {
    return {
      success: false,
      response: "AI Assistant is temporarily unavailable. Please configure the Gemini API key.",
      source: "unconfigured",
    };
  }

  // Build Gemini-compatible history
  const contents = [];

  // Add recent conversation history for multi-turn context
  if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
    const recentTurns = conversationHistory.slice(-6);
    for (const turn of recentTurns) {
      if (!turn.content || turn.content === userMessage) continue;
      const role = turn.role === "user" ? "user" : "model";
      contents.push({
        role,
        parts: [{ text: turn.content }],
      });
    }
  }

  // Append the latest user query
  contents.push({
    role: "user",
    parts: [{ text: userMessage.trim() }],
  });

  const supportedModels = [
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-flash-latest",
    "gemini-3.8-flash",
  ];

  const ai = new GoogleGenAI({ apiKey: geminiApiKey });

  for (const modelName of supportedModels) {
    try {
      const chatHistory = JSON.parse(JSON.stringify(contents));

      let currentResponse = await ai.models.generateContent({
        model: modelName,
        contents: chatHistory,
        config: {
          systemInstruction: PRESCRIPTO_SYSTEM_INSTRUCTION,
          tools: [{ functionDeclarations: prescriptoToolDeclarations }],
        },
      });

      // Tool Calling execution loop (up to 3 iterations)
      let iterations = 0;
      while (
        currentResponse.functionCalls &&
        currentResponse.functionCalls.length > 0 &&
        iterations < 3
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

        currentResponse = await ai.models.generateContent({
          model: modelName,
          contents: chatHistory,
          config: {
            systemInstruction: PRESCRIPTO_SYSTEM_INSTRUCTION,
            tools: [{ functionDeclarations: prescriptoToolDeclarations }],
          },
        });
      }

      // Extract text from the final response
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
      console.warn(`[Gemini Attempt Failed on ${modelName}]:`, err.message);
      // Try next model in the fallback chain
    }
  }

  // Graceful error response without exposing internal errors or stack traces
  return {
    success: false,
    response: "AI Assistant is temporarily unavailable. Please try again in a moment.",
    source: "service-error",
  };
};

export const processUserMessage = processAIChat;

export default {
  processAIChat,
  processUserMessage,
};
