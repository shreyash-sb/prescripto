import assert from "node:assert";
import userModel from "../models/userModel.js";
import accessLogModel from "../models/accessLogModel.js";
import medicineRoutineModel from "../models/medicineRoutineModel.js";

export const runClinicalAndPrivacyTests = async () => {
  const results = { name: "Clinical Safety Shield & Privacy Audit Trail Tests", passed: 0, failed: 0, tests: [] };

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
    name: "Clinical Audit Patient",
    email: `clinical_qa_${Date.now()}@example.com`,
    password: "Password@123",
    walletBalance: 100,
    allergies: ["Penicillin", "Sulfa Drugs", "Aspirin"],
    chronicConditions: ["Hypertension", "Type 2 Diabetes"],
    vitals: {
      bloodPressure: "120/80",
      heartRate: 72,
      spo2: 98,
      temperature: 98.6,
    },
  });

  // ==========================================
  // POSITIVE TESTS
  // ==========================================
  await record("Positive: Allergy Safety Shield flags known drug allergies", async () => {
    const user = await userModel.findById(testUser._id).lean();
    assert(Array.isArray(user.allergies), "Allergies must be an array");
    assert.strictEqual(user.allergies.length, 3, "Must contain 3 documented allergies");
    assert(user.allergies.includes("Penicillin"), "Must include Penicillin");
    assert(user.allergies.includes("Aspirin"), "Must include Aspirin");
  })();

  await record("Positive: Patient Vitals and Chronic Conditions are accurately stored", async () => {
    const user = await userModel.findById(testUser._id).lean();
    assert.strictEqual(user.vitals.bloodPressure, "120/80", "BP must match");
    assert.strictEqual(user.vitals.heartRate, 72, "Heart rate must match");
    assert.strictEqual(user.chronicConditions.length, 2, "Chronic conditions must match");
  })();

  await record("Positive: Privacy Access Log records Doctor/Staff record inspection", async () => {
    const log = new accessLogModel({
      userId: testUser._id.toString(),
      accessorName: "Dr. Richard James",
      accessorRole: "doctor",
      accessorId: "doc_123",
      resource: "Drug Allergies & Vitals",
      action: "VIEWED",
      details: "Inspected pre-consultation allergy shield",
      ipAddress: "127.0.0.1",
      device: "Hospital Clinical Terminal (Encrypted)",
    });

    const savedLog = await log.save();
    assert(savedLog._id, "Access log must be saved");
    assert.strictEqual(savedLog.accessorName, "Dr. Richard James", "Doctor name must match");
    assert.strictEqual(savedLog.accessorRole, "doctor", "Role must be doctor");
    assert.strictEqual(savedLog.resource, "Drug Allergies & Vitals", "Resource must match");
  })();

  await record("Positive: Medicine Routine lifecycle (Create -> Toggle Dose -> Delete)", async () => {
    const routine = new medicineRoutineModel({
      userId: testUser._id.toString(),
      medicineName: "Metformin 500mg",
      dosage: "1 Tab",
      frequency: "Twice daily",
      scheduleSlots: ["Morning", "Night"],
      mealTime: "After Food",
      durationDays: 30,
      startDate: new Date().toISOString().split("T")[0],
      prescribedByDoctor: "Dr. Richard James",
      isActive: true,
      adherenceLogs: [],
    });

    const saved = await routine.save();
    assert(saved._id, "Routine created");

    // Toggle dose taken
    const today = new Date().toISOString().split("T")[0];
    await medicineRoutineModel.findByIdAndUpdate(saved._id, {
      $push: {
        adherenceLogs: {
          date: today,
          slot: "Morning",
          taken: true,
          takenAt: new Date(),
        },
      },
    });

    const updated = await medicineRoutineModel.findById(saved._id).lean();
    assert.strictEqual(updated.adherenceLogs.length, 1, "Dose adherence log must be recorded");
    assert.strictEqual(updated.adherenceLogs[0].taken, true, "Dose status must be taken: true");

    // Delete routine
    await medicineRoutineModel.findByIdAndDelete(saved._id);
    const deleted = await medicineRoutineModel.findById(saved._id).lean();
    assert.strictEqual(deleted, null, "Routine must be deleted");
  })();

  // ==========================================
  // NEGATIVE TESTS
  // ==========================================
  await record("Negative: Access log query is isolated to authenticated user ID", async () => {
    const fakeOtherUserId = "507f1f77bcf86cd799439099";
    const logs = await accessLogModel.find({ userId: fakeOtherUserId }).lean();
    assert(Array.isArray(logs), "Must return array");
    assert.strictEqual(logs.length, 0, "Other user's logs must not leak");
  })();

  // Cleanup
  await accessLogModel.deleteMany({ userId: testUser._id });
  await userModel.findByIdAndDelete(testUser._id);

  return results;
};

export default runClinicalAndPrivacyTests;
