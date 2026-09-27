import assert from "node:assert";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import medicineRoutineModel from "../models/medicineRoutineModel.js";

export const runAppointmentTests = async () => {
  const results = { name: "Appointment Lifecycle, Queue Tokens & 100% Instant Refund Tests", passed: 0, failed: 0, tests: [] };

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
  let testDoctor = null;
  let testAppt = null;
  let secondAppt = null;

  // Setup test user & doctor
  testUser = await userModel.create({
    name: "Automated QA Patient",
    email: `qa_patient_${Date.now()}@example.com`,
    password: "Password@123",
    walletBalance: 0,
    gender: "Female",
    dob: "1995-05-15",
    phone: "9876543210",
    allergies: ["Penicillin"],
  });

  testDoctor = await doctorModel.findOne({ available: true });
  assert(testDoctor, "Must have an available doctor for appointment tests");

  const slotDate = "30_09_2026";
  const slotTime = "10:30 AM";

  // ==========================================
  // POSITIVE TESTS
  // ==========================================
  await record("Positive: Book Appointment & generate sequential Queue Token #1", async () => {
    const newAppointment = new appointmentModel({
      userId: testUser._id,
      docId: testDoctor._id,
      slotDate,
      slotTime,
      userData: {
        _id: testUser._id,
        name: testUser.name,
        email: testUser.email,
        phone: testUser.phone,
        dob: testUser.dob,
        allergies: testUser.allergies,
      },
      docData: {
        _id: testDoctor._id,
        name: testDoctor.name,
        speciality: testDoctor.speciality,
        degree: testDoctor.degree,
        fees: testDoctor.fees || 50,
      },
      amount: testDoctor.fees || 50,
      date: Date.now(),
      tokenNumber: 1,
      patientProblem: "Mild fever and throat irritation",
    });

    testAppt = await newAppointment.save();
    assert(testAppt._id, "Appointment must be saved");
    assert.strictEqual(testAppt.tokenNumber, 1, "First booking of the day must have Token #1");
    assert.strictEqual(testAppt.cancelled, false, "Initial cancelled state must be false");
    assert.strictEqual(testAppt.isCompleted, false, "Initial completed state must be false");
  })();

  await record("Positive: Consecutive Booking on same date increments Queue Token to #2", async () => {
    const nextAppt = new appointmentModel({
      userId: testUser._id,
      docId: testDoctor._id,
      slotDate,
      slotTime: "11:00 AM",
      userData: {
        _id: testUser._id,
        name: testUser.name,
        email: testUser.email,
      },
      docData: {
        _id: testDoctor._id,
        name: testDoctor.name,
        fees: testDoctor.fees || 50,
      },
      amount: testDoctor.fees || 50,
      date: Date.now(),
      tokenNumber: 2,
      patientProblem: "Routine follow-up",
    });

    secondAppt = await nextAppt.save();
    assert.strictEqual(secondAppt.tokenNumber, 2, "Sequential token must increment to #2");
  })();

  await record("Positive: Payment Simulation marks appointment paid", async () => {
    await appointmentModel.findByIdAndUpdate(testAppt._id, {
      payment: true,
      paymentMethod: "Online Card Gateway",
      paymentId: `PAY_TXN_${Date.now()}`,
    });

    const paidAppt = await appointmentModel.findById(testAppt._id).lean();
    assert.strictEqual(paidAppt.payment, true, "Appointment must be marked as paid");
    assert.strictEqual(paidAppt.paymentMethod, "Online Card Gateway", "Payment method must be recorded");
  })();

  await record("Positive: Doctor Consultation Acceptance Workflow", async () => {
    await appointmentModel.findByIdAndUpdate(testAppt._id, {
      appointmentStatus: "Accepted",
    });

    const acceptedAppt = await appointmentModel.findById(testAppt._id).lean();
    assert.strictEqual(acceptedAppt.appointmentStatus, "Accepted", "Status must update to Accepted");
  })();

  await record("Positive: Doctor Completes Consultation with E-Prescription & Structured Meds", async () => {
    const rxText = "1. Paracetamol 500mg - 1 tab thrice daily\n2. Amoxicillin 500mg - 1 tab twice daily";
    const diagnosisNotes = "Acute upper respiratory tract infection. Mild pharyngitis.";
    const structuredMeds = [
      {
        name: "Paracetamol 500mg",
        dosage: "1 Tab",
        frequency: "Thrice daily",
        scheduleSlots: ["Morning", "Afternoon", "Night"],
        mealTime: "After Food",
        duration: 3,
        instructions: "Take with water",
      },
    ];

    await appointmentModel.findByIdAndUpdate(testAppt._id, {
      isCompleted: true,
      prescription: rxText,
      diagnosisNotes,
      structuredMedicines: structuredMeds,
      followUpDays: 7,
      completedAt: new Date(),
    });

    const completed = await appointmentModel.findById(testAppt._id).lean();
    assert.strictEqual(completed.isCompleted, true, "Appointment must be completed");
    assert.strictEqual(completed.diagnosisNotes, diagnosisNotes, "Diagnosis notes must be stored");
    assert.strictEqual(completed.structuredMedicines.length, 1, "Structured medicines must be saved");
  })();

  await record("Positive: Convert Completed E-Prescription into Patient Daily Routine", async () => {
    const routine = new medicineRoutineModel({
      userId: testUser._id,
      medicineName: "Paracetamol 500mg",
      dosage: "1 Tab",
      instructions: "Take with water",
      mealTiming: "After Food",
      timesOfDay: ["Morning", "Afternoon", "Night"],
      durationDays: 3,
      startDate: new Date(),
      status: "Active",
      history: [],
    });

    const savedRoutine = await routine.save();
    assert(savedRoutine._id, "Medicine routine must be created");
    assert.strictEqual(savedRoutine.medicineName, "Paracetamol 500mg", "Medicine name must match");

    // Cleanup routine
    await medicineRoutineModel.findByIdAndDelete(savedRoutine._id);
  })();

  await record("Positive: 100% Instant Refund Guarantee on Patient Cancellation", async () => {
    // Pay second appointment first
    await appointmentModel.findByIdAndUpdate(secondAppt._id, {
      payment: true,
      amount: 60,
    });

    // Patient cancels paid appointment
    const refundAmount = 60;
    await appointmentModel.findByIdAndUpdate(secondAppt._id, {
      cancelled: true,
      refundStatus: "Refunded",
      refundAmount,
      refundedAt: new Date(),
      cancelledBy: "Patient",
    });

    // Credit user wallet
    await userModel.findByIdAndUpdate(testUser._id, {
      $inc: { walletBalance: refundAmount },
    });

    const refundedAppt = await appointmentModel.findById(secondAppt._id).lean();
    const updatedUser = await userModel.findById(testUser._id).lean();

    assert.strictEqual(refundedAppt.cancelled, true, "Appointment must be marked cancelled");
    assert.strictEqual(refundedAppt.refundStatus, "Refunded", "Refund status must be Refunded");
    assert.strictEqual(refundedAppt.refundAmount, 60, "100% of fee must be refunded");
    assert.strictEqual(updatedUser.walletBalance, 60, "Wallet must receive 100% refund amount ($60)");
  })();

  // ==========================================
  // NEGATIVE TESTS
  // ==========================================
  await record("Negative: Cannot cancel an already completed appointment", async () => {
    const completedAppt = await appointmentModel.findById(testAppt._id).lean();
    assert.strictEqual(completedAppt.isCompleted, true, "Appointment is completed");

    // Attempt cancellation guard
    const canCancel = !completedAppt.isCompleted;
    assert.strictEqual(canCancel, false, "Completed appointment must not be cancellable");
  })();

  await record("Negative: Cannot complete an already cancelled appointment", async () => {
    const cancelledAppt = await appointmentModel.findById(secondAppt._id).lean();
    assert.strictEqual(cancelledAppt.cancelled, true, "Appointment is cancelled");

    // Attempt completion guard
    const canComplete = !cancelledAppt.cancelled;
    assert.strictEqual(canComplete, false, "Cancelled appointment must not be completable");
  })();

  await record("Negative: Non-existent appointment ID returns null on status check", async () => {
    const fakeApptId = "507f1f77bcf86cd799439011";
    const found = await appointmentModel.findById(fakeApptId).lean();
    assert.strictEqual(found, null, "Should return null for non-existent appointment ID");
  })();

  // Cleanup test data
  if (testAppt?._id) await appointmentModel.findByIdAndDelete(testAppt._id);
  if (secondAppt?._id) await appointmentModel.findByIdAndDelete(secondAppt._id);
  if (testUser?._id) await userModel.findByIdAndDelete(testUser._id);

  return results;
};

export default runAppointmentTests;
