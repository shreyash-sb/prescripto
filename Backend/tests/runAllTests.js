import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../config/mongodb.js";
import { runAuthTests } from "./auth.test.js";
import { runDoctorTests } from "./doctor.test.js";
import { runAppointmentTests } from "./appointment.test.js";
import { runClinicalAndPrivacyTests } from "./clinicalAndPrivacy.test.js";
import { runAIAssistantTests } from "./aiAssistant.test.js";

const runMasterTestSuite = async () => {
  console.log("\n==================================================================");
  console.log("🏥 PRESCRIPTO AUTOMATED SYSTEM-WIDE QUALITY & INTEGRATION TEST SUITE");
  console.log("==================================================================\n");

  const startTime = Date.now();

  try {
    console.log("🔌 Connecting to Database...");
    await connectDB();
    console.log("✓ Database connected successfully.\n");
  } catch (dbErr) {
    console.error("✗ Failed to connect to database:", dbErr.message);
    process.exit(1);
  }

  const suites = [
    runAuthTests,
    runDoctorTests,
    runAppointmentTests,
    runClinicalAndPrivacyTests,
    runAIAssistantTests,
  ];

  let totalPassed = 0;
  let totalFailed = 0;
  const suiteReports = [];

  for (const suiteFn of suites) {
    try {
      console.log(`\n▶ Running Suite...`);
      const report = await suiteFn();
      suiteReports.push(report);
      totalPassed += report.passed;
      totalFailed += report.failed;
    } catch (suiteErr) {
      console.error(`✗ Suite execution error:`, suiteErr);
      totalFailed++;
    }
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  const totalTests = totalPassed + totalFailed;

  console.log("\n==================================================================");
  console.log("📊 PRESCRIPTO FINAL TEST EXECUTION SUMMARY REPORT");
  console.log("==================================================================");

  suiteReports.forEach((s) => {
    const statusIcon = s.failed === 0 ? "🟢" : "🔴";
    console.log(`${statusIcon} ${s.name}: ${s.passed} Passed, ${s.failed} Failed`);
  });

  console.log("------------------------------------------------------------------");
  console.log(`Total Test Cases Executed: ${totalTests}`);
  console.log(`Total Passed:             🟢 ${totalPassed}`);
  console.log(`Total Failed:             ${totalFailed === 0 ? "🟢 0" : `🔴 ${totalFailed}`}`);
  console.log(`Execution Time:           ⏱️ ${durationSec}s`);
  console.log("==================================================================");

  try {
    await mongoose.connection.close();
  } catch (closeErr) {
    // Ignore close error
  }

  if (totalFailed === 0) {
    console.log("🎉 ALL POSITIVE, NEGATIVE & EDGE TEST CASES PASSED WITH 0 ERRORS!\n");
    process.exit(0);
  } else {
    console.error(`⚠️ ${totalFailed} TEST(S) FAILED. PLEASE REVIEW LOGS ABOVE.\n`);
    process.exit(1);
  }
};

runMasterTestSuite();
