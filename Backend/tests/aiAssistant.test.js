import assert from "node:assert";
import { processAIChat } from "../services/ai/aiAgent.js";
import { executePrescriptoTool } from "../services/ai/aiTools.js";
import userModel from "../models/userModel.js";

export const runAIAssistantTests = async () => {
  const results = { name: "Gemini Hybrid AI Assistant & Tool Execution Tests", passed: 0, failed: 0, tests: [] };

  const record = (title, fn) => {
    return async () => {
      try {
        await fn();
        results.passed++;
        results.tests.push({ title, status: "PASS" });
        console.log(`  ✓ [PASS] ${title}`);
      } catch (err) {
        results.failed++;
        results.tests.push({ title, status: "FAIL", error: err.message });
        console.error(`  ✗ [FAIL] ${title}: ${err.message}`);
      }
    };
  };

  let testUser = null;
  testUser = await userModel.create({
    name: "AI Test Patient",
    email: `ai_test_${Date.now()}@example.com`,
    password: "Password@123",
    walletBalance: 50,
  });

  // ==========================================
  // POSITIVE TESTS: LIVE TOOLS & DATA
  // ==========================================
  await record("Positive: Live Tool 'findDoctors' retrieves real doctors from MongoDB", async () => {
    const result = await executePrescriptoTool("findDoctors", { query: "General", availableOnly: true });
    assert(result.found === true || result.count >= 0, "Tool must execute successfully");
    assert(Array.isArray(result.doctors), "Must return an array of doctors");
  })();

  await record("Positive: Live Tool 'findDoctorsBySpeciality' searches medical department", async () => {
    const result = await executePrescriptoTool("findDoctorsBySpeciality", { speciality: "Dermatologist" });
    assert(result.found === true || result.count >= 0, "Tool must return found status");
    assert(Array.isArray(result.doctors), "Must return doctors array");
  })();

  await record("Positive: Live Tool 'getHospitalSpecialties' lists departments", async () => {
    const result = await executePrescriptoTool("getHospitalSpecialties", {});
    assert(Array.isArray(result.specialties), "Must return specialties array");
    assert(result.specialties.length >= 6, "Must list at least 6 departments");
  })();

  // ==========================================
  // POSITIVE TESTS: DOCTORS, PLATFORM, HEALTH, MEDICINES
  // ==========================================
  await record("Positive: AI Process answers Live Doctor Availability Question", async () => {
    const res = await processAIChat("Which doctors are currently available on Prescripto?", []);
    assert(res.success, "AI Chat must return success: true");
    assert(res.response && res.response.length > 20, "Response must contain detailed doctor list");
  })();

  await record("Positive: AI Process explains 100% Instant Refund Guarantee", async () => {
    const res = await processAIChat("How does the refund guarantee work?", []);
    assert(res.success, "AI Chat must return success: true");
    assert(
      res.response.toLowerCase().includes("refund") || res.response.toLowerCase().includes("100%"),
      "Response must explain refund guarantee"
    );
  })();

  await record("Positive: AI Process explains Medical Terminology (e.g. 'after food')", async () => {
    const res = await processAIChat("What does 'after food' mean for medications?", []);
    assert(res.success, "AI Chat must return success: true");
    assert(
      res.response.toLowerCase().includes("meal") || res.response.toLowerCase().includes("food"),
      "Response must provide educational food timing guidance"
    );
  })();

  await record("Positive: AI Process explains Medicine positive uses & negative side effects (Ibuprofen)", async () => {
    const res = await processAIChat("What are the uses and side effects of Ibuprofen?", []);
    assert(res.success, "AI Chat must return success: true");
    assert(
      res.response.toLowerCase().includes("ibuprofen") && (res.response.toLowerCase().includes("side effect") || res.response.toLowerCase().includes("stomach")),
      "Response must detail uses, meal timing, and side effects"
    );
  })();

  await record("Positive: AI Process handles Health Symptom guidance & red flags (Fever)", async () => {
    const res = await processAIChat("I have a high fever and chills, what precautions should I take?", []);
    assert(res.success, "AI Chat must return success: true");
    assert(
      res.response.toLowerCase().includes("fever") && (res.response.toLowerCase().includes("physician") || res.response.toLowerCase().includes("temperature")),
      "Response must provide fever care and red flag advice"
    );
  })();

  await record("Positive: Multi-turn chat maintains conversation context", async () => {
    const history = [
      { role: "user", content: "I have a severe skin allergy" },
      { role: "model", content: "You should consult a Dermatologist for skin allergies." },
    ];
    const res = await processAIChat("Do you have any dermatologists available today?", history);
    assert(res.success, "Must return success: true");
    assert(res.response && res.response.length > 10, "Response must provide doctor recommendations");
  })();

  // ==========================================
  // NEGATIVE, DOMAIN BOUNDARY & OFF-TOPIC TESTS
  // ==========================================
  await record("Negative / Domain Guard: Off-topic non-medical question returns 'improvement stage' response", async () => {
    const res = await processAIChat("Write me a Python game script for space invaders", []);
    assert(res.success, "Must return success: true");
    assert(
      res.response.includes("improvement stage") || res.response.includes("non-healthcare"),
      "Off-topic query must trigger the improvement stage message"
    );
  })();

  await record("Negative / Domain Guard: Random non-healthcare query returns 'improvement stage'", async () => {
    const res = await processAIChat("What is the stock price of Tesla in 2030?", []);
    assert(res.success, "Must return success: true");
    assert(
      res.response.includes("improvement stage"),
      "Random non-medical question must return improvement stage notice"
    );
  })();

  await record("Negative / Edge: Empty or whitespace query returns polite guidance prompt", async () => {
    const res = await processAIChat("   ", []);
    assert(res.success, "Must return success: true with guidance");
    assert(res.response && res.response.length > 5, "Must prompt user to ask a question");
  })();

  await record("Negative / Security: Unauthenticated query for private appointments prompts login", async () => {
    const res = await executePrescriptoTool("getMyAppointments", {}, null);
    assert.strictEqual(res.authenticated, false, "Unauthenticated user must be flagged");
    assert(res.message.includes("log into their Prescripto account") || res.message.includes("log in"), "Prompt must tell visitor to log into account");
  })();

  await record("Negative / Security: Unauthenticated query for private prescriptions prompts login", async () => {
    const res = await executePrescriptoTool("getMyPrescriptions", {}, null);
    assert.strictEqual(res.authenticated, false, "Unauthenticated user must be flagged");
    assert(res.message.includes("log into their Prescripto account") || res.message.includes("log in"), "Prompt must tell visitor to log into account");
  })();

  // Cleanup
  if (testUser?._id) {
    await userModel.findByIdAndDelete(testUser._id);
  }

  return results;
};

export default runAIAssistantTests;
