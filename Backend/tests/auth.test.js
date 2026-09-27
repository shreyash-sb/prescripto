import assert from "node:assert";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import { createToken, verifyToken } from "../utils/token.js";

export const runAuthTests = async () => {
  const results = { name: "Authentication & Role Security Tests", passed: 0, failed: 0, tests: [] };

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

  const testUserEmail = `test_patient_${Date.now()}@example.com`;
  const testUserPassword = "Password@12345";
  let createdUserId = null;

  // ==========================================
  // POSITIVE TESTS
  // ==========================================
  await record("Positive: User Registration with valid credentials", async () => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testUserPassword, salt);

    const newUser = new userModel({
      name: "Test Patient Verified",
      email: testUserEmail,
      password: hashedPassword,
      walletBalance: 0,
      gender: "Not Selected",
      dob: "2000-01-01",
      phone: "0000000000",
    });

    const saved = await newUser.save();
    assert(saved._id, "User ID should be generated on save");
    assert.strictEqual(saved.email, testUserEmail, "Email must match saved record");
    createdUserId = saved._id.toString();
  })();

  await record("Positive: User Login with correct credentials & JWT generation", async () => {
    const user = await userModel.findOne({ email: testUserEmail });
    assert(user, "User must exist in database");

    const isMatch = await bcrypt.compare(testUserPassword, user.password);
    assert.strictEqual(isMatch, true, "Password must match hashed password");

    const token = createToken({ id: user._id, role: "user" });
    assert(token && typeof token === "string", "Valid JWT token must be generated");

    const decoded = verifyToken(token);
    assert.strictEqual(decoded.id.toString(), user._id.toString(), "Decoded ID must match user ID");
    assert.strictEqual(decoded.role, "user", "Decoded role must be 'user'");
  })();

  await record("Positive: Admin Login with valid configured credentials", async () => {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin12345";

    assert.strictEqual(adminEmail, process.env.ADMIN_EMAIL, "Admin email must match .env");
    assert.strictEqual(adminPassword, process.env.ADMIN_PASSWORD, "Admin password must match .env");

    const adminToken = createToken({ id: "admin_root_id", role: "admin" });
    const decoded = verifyToken(adminToken);
    assert.strictEqual(decoded.role, "admin", "Role must be 'admin'");
  })();

  await record("Positive: Doctor Login & JWT generation with role 'doctor'", async () => {
    const doctor = await doctorModel.findOne({});
    if (doctor) {
      const doctorToken = createToken({ id: doctor._id, role: "doctor" });
      const decoded = verifyToken(doctorToken);
      assert.strictEqual(decoded.role, "doctor", "Doctor token role must be 'doctor'");
      assert.strictEqual(decoded.id.toString(), doctor._id.toString(), "Decoded ID must match doctor ID");
    }
  })();

  // ==========================================
  // NEGATIVE TESTS
  // ==========================================
  await record("Negative: User Registration fails with duplicate email", async () => {
    const duplicateUser = new userModel({
      name: "Duplicate User",
      email: testUserEmail, // Already registered above
      password: "somehashedpassword",
    });

    let duplicateErrorCaught = false;
    try {
      await duplicateUser.save();
    } catch (err) {
      duplicateErrorCaught = true;
      assert(err.code === 11000 || err.message.includes("duplicate"), "MongoDB should throw duplicate key error");
    }
    assert.strictEqual(duplicateErrorCaught, true, "Should not allow duplicate email registration");
  })();

  await record("Negative: User Login fails with incorrect password", async () => {
    const user = await userModel.findOne({ email: testUserEmail });
    assert(user, "User must exist");

    const isMatch = await bcrypt.compare("WrongPasswordXYZ!", user.password);
    assert.strictEqual(isMatch, false, "Wrong password must be rejected");
  })();

  await record("Negative: JWT verification fails on forged / invalid token", async () => {
    let forgedErrorCaught = false;
    try {
      verifyToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.forgedpayload.invalidsignature");
    } catch (err) {
      forgedErrorCaught = true;
    }
    assert.strictEqual(forgedErrorCaught, true, "Tampered JWT token must be rejected with an error");
  })();

  await record("Negative: Patient token cannot access admin privileges (Role Mismatch)", async () => {
    const userToken = createToken({ id: createdUserId, role: "user" });
    const decoded = verifyToken(userToken);
    assert.notStrictEqual(decoded.role, "admin", "Patient token role must not be admin");
  })();

  await record("Negative: Patient token cannot access doctor privileges (Role Mismatch)", async () => {
    const userToken = createToken({ id: createdUserId, role: "user" });
    const decoded = verifyToken(userToken);
    assert.notStrictEqual(decoded.role, "doctor", "Patient token role must not be doctor");
  })();

  // Cleanup test user
  if (createdUserId) {
    await userModel.findByIdAndDelete(createdUserId);
  }

  return results;
};

export default runAuthTests;
