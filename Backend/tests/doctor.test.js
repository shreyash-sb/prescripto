import assert from "node:assert";
import doctorModel from "../models/doctorModel.js";

export const runDoctorTests = async () => {
  const results = { name: "Doctor Directory & Roster Management Tests", passed: 0, failed: 0, tests: [] };

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

  let testDoc = null;

  // ==========================================
  // POSITIVE TESTS
  // ==========================================
  await record("Positive: Fetch Doctor Directory with sanitized fields", async () => {
    const doctors = await doctorModel.find({}).select("-password -email").lean();
    assert(Array.isArray(doctors), "Doctors must be an array");
    assert(doctors.length > 0, "Should have registered doctors in database");

    testDoc = doctors[0];
    assert(testDoc._id, "Doctor must have an ID");
    assert(testDoc.name, "Doctor must have a name");
    assert(testDoc.speciality, "Doctor must have a speciality");
    assert(typeof testDoc.available === "boolean", "Doctor availability must be boolean");
    assert.strictEqual(testDoc.password, undefined, "Password must never be exposed");
  })();

  await record("Positive: Filter Doctors by Medical Speciality", async () => {
    const dermatologists = await doctorModel
      .find({ speciality: { $regex: "dermatolog", $options: "i" } })
      .select("-password")
      .lean();

    assert(Array.isArray(dermatologists), "Result must be an array");
    if (dermatologists.length > 0) {
      assert(
        dermatologists.every((d) => /dermatolog/i.test(d.speciality)),
        "All returned doctors must belong to Dermatology"
      );
    }
  })();

  await record("Positive: Admin Toggles Doctor Availability (Available <-> Off-duty)", async () => {
    assert(testDoc, "Must have a test doctor");
    const originalStatus = testDoc.available;

    // Toggle availability
    await doctorModel.findByIdAndUpdate(testDoc._id, { available: !originalStatus });
    const updated = await doctorModel.findById(testDoc._id).lean();
    assert.strictEqual(updated.available, !originalStatus, "Availability must be inverted");

    // Restore original availability
    await doctorModel.findByIdAndUpdate(testDoc._id, { available: originalStatus });
    const restored = await doctorModel.findById(testDoc._id).lean();
    assert.strictEqual(restored.available, originalStatus, "Original availability must be restored");
  })();

  await record("Positive: Doctor updates Live Queue Status & OPD Room", async () => {
    assert(testDoc, "Must have a test doctor");

    await doctorModel.findByIdAndUpdate(testDoc._id, {
      liveQueue: {
        currentToken: 5,
        totalInQueue: 2,
        estimatedWaitMins: 15,
        lastUpdated: new Date(),
      },
      roomNumber: "OPD-302",
    });

    const doc = await doctorModel.findById(testDoc._id).lean();
    assert.strictEqual(doc.liveQueue.currentToken, 5, "Current token must be updated to 5");
    assert.strictEqual(doc.roomNumber, "OPD-302", "Room number must be updated to OPD-302");
  })();

  // ==========================================
  // NEGATIVE TESTS
  // ==========================================
  await record("Negative: Non-existent doctor ID returns null on update", async () => {
    const fakeId = "60c72b2f9b1d8b2bad000000";
    const result = await doctorModel.findByIdAndUpdate(fakeId, { available: true });
    assert.strictEqual(result, null, "Updating non-existent ID should return null");
  })();

  await record("Negative: Searching unrepresented department returns empty list gracefully", async () => {
    const docs = await doctorModel.find({ speciality: "NonExistentSpecialtyXYZ" }).lean();
    assert(Array.isArray(docs), "Must return array");
    assert.strictEqual(docs.length, 0, "Array must be empty for non-existent specialty");
  })();

  return results;
};

export default runDoctorTests;
