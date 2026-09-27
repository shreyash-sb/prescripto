import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import doctorModel from "../models/doctorModel.js";
import adminModel from "../models/adminModel.js";
import userModel from "../models/userModel.js";
import appointmentModel from "../models/appointmentModel.js";

dotenv.config();

const MONGODB_URL =
  process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/prescripto";

const sampleDoctors = [
  {
    name: "Dr. Richard James",
    email: "richard@example.com",
    speciality: "General physician",
    degree: "MBBS, MD - Internal Medicine",
    experience: "4 Years",
    about:
      "Dr. Richard James has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective management strategies.",
    fees: 50,
    address: {
      line1: "17th Cross, Richmond Circle",
      line2: "Ring Road, Medical Hub",
    },
    image:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=500&auto=format&fit=crop",
    rating: 4.9,
    ratingsCount: 24,
  },
  {
    name: "Dr. Emily Larson",
    email: "emily@example.com",
    speciality: "Gynecologist",
    degree: "MBBS, MS - Obstetrics & Gynaecology",
    experience: "5 Years",
    about:
      "Dr. Emily Larson specializes in women's reproductive health, prenatal care, and modern gynecological therapies with compassionate, patient-centered guidance.",
    fees: 60,
    address: {
      line1: "27th Cross, Pall Mall Avenue",
      line2: "Green Park Health Center",
    },
    image:
      "https://images.unsplash.com/photo-1594824813580-482bc8527a29?q=80&w=500&auto=format&fit=crop",
    rating: 4.8,
    ratingsCount: 19,
  },
  {
    name: "Dr. Chloe Evans",
    email: "chloe@example.com",
    speciality: "Dermatologist",
    degree: "MBBS, MD - Dermatology & Venereology",
    experience: "3 Years",
    about:
      "Dr. Chloe Evans has extensive experience in clinical dermatology, cosmetic skincare, acne treatments, and hair wellness with state-of-the-art procedures.",
    fees: 40,
    address: {
      line1: "42nd Avenue, Central Square",
      line2: "Metro Skin & Hair Clinic",
    },
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=500&auto=format&fit=crop",
    rating: 4.7,
    ratingsCount: 31,
  },
  {
    name: "Dr. Patrick Harris",
    email: "patrick@example.com",
    speciality: "Pediatricians",
    degree: "MBBS, MD - Pediatrics",
    experience: "5 Years",
    about:
      "Dr. Patrick Harris is dedicated to child healthcare, developmental milestones tracking, childhood immunizations, and pediatric acute care.",
    fees: 45,
    address: {
      line1: "57th Street, Sunshine Plaza",
      line2: "Children First Wellness Wing",
    },
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=500&auto=format&fit=crop",
    rating: 4.9,
    ratingsCount: 28,
  },
  {
    name: "Dr. Zoe Kelly",
    email: "zoe@example.com",
    speciality: "Neurologist",
    degree: "MBBS, DM - Neurology",
    experience: "9 Years",
    about:
      "Dr. Zoe Kelly is a distinguished neurologist specialized in stroke rehabilitation, migraine disorders, neuro-muscular conditions, and seizure management.",
    fees: 90,
    address: {
      line1: "12th Boulevard, Cambridge Heights",
      line2: "NeuroCare Specialty Pavilion",
    },
    image:
      "https://images.unsplash.com/photo-1527613426441-4da17471b66d?q=80&w=500&auto=format&fit=crop",
    rating: 5.0,
    ratingsCount: 42,
  },
  {
    name: "Dr. Jennifer Garcia",
    email: "jennifer@example.com",
    speciality: "Gastroenterologist",
    degree: "MBBS, MD, DM - Gastroenterology",
    experience: "6 Years",
    about:
      "Dr. Jennifer Garcia focuses on digestive system disorders, endoscopy diagnostics, liver wellness, and personalized dietetic therapeutic plans.",
    fees: 70,
    address: {
      line1: "88th Ocean Drive, Suite 4",
      line2: "Digestive Health & GI Center",
    },
    image:
      "https://images.unsplash.com/photo-1594824813689-53e34fce4e0c?q=80&w=500&auto=format&fit=crop",
    rating: 4.8,
    ratingsCount: 15,
  },
  {
    name: "Dr. Christopher Lee",
    email: "christopher@example.com",
    speciality: "General physician",
    degree: "MBBS, MD - Family Medicine",
    experience: "7 Years",
    about:
      "Dr. Christopher Lee brings over seven years of patient-first family healthcare, chronic illness supervision, and lifestyle disease reversal coaching.",
    fees: 55,
    address: {
      line1: "101 Grand Central Road",
      line2: "Civic Health Tower",
    },
    image:
      "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=500&auto=format&fit=crop",
    rating: 4.9,
    ratingsCount: 35,
  },
  {
    name: "Dr. Sarah Patel",
    email: "sarah@example.com",
    speciality: "Gynecologist",
    degree: "MBBS, DGO, MS - OB-GYN",
    experience: "8 Years",
    about:
      "Dr. Sarah Patel is known for her gentle demeanor and high success rate in high-risk pregnancy management, hormonal balance, and fertility consultation.",
    fees: 75,
    address: {
      line1: "33 Pearl Street, Lotus Block",
      line2: "Bloom Mother & Child Hospital",
    },
    image:
      "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?q=80&w=500&auto=format&fit=crop",
    rating: 4.9,
    ratingsCount: 29,
  },
  {
    name: "Dr. Ryan Martinez",
    email: "ryan@example.com",
    speciality: "Dermatologist",
    degree: "MBBS, MD, DNB - Dermatology",
    experience: "7 Years",
    about:
      "Dr. Ryan Martinez has pioneered minimally-invasive aesthetic laser treatments, pigmentation correction, and modern eczema/psoriasis management.",
    fees: 65,
    address: {
      line1: "14 Westgate Square",
      line2: "Aura Laser & Derma Clinic",
    },
    image:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=500&auto=format&fit=crop",
    rating: 4.8,
    ratingsCount: 22,
  },
  {
    name: "Dr. Jessica Taylor",
    email: "jessica@example.com",
    speciality: "Pediatricians",
    degree: "MBBS, DCH, DNB - Pediatrics",
    experience: "4 Years",
    about:
      "Dr. Jessica Taylor has a friendly approach with infants and young children, making clinic visits fear-free while addressing pediatric nutritional and growth concerns.",
    fees: 50,
    address: {
      line1: "64 Maple Street, North End",
      line2: "Little Stars Clinic",
    },
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=500&auto=format&fit=crop",
    rating: 4.9,
    ratingsCount: 18,
  },
  {
    name: "Dr. Alexander Bennett",
    email: "alexander@example.com",
    speciality: "Neurologist",
    degree: "MBBS, MD, DM - Neurology",
    experience: "11 Years",
    about:
      "Dr. Alexander Bennett is an internationally trained neurologist specializing in neuro-critical care, memory disorders, and advanced neuropathic pain management.",
    fees: 110,
    address: {
      line1: "808 University Avenue",
      line2: "Apex Brain & Spine Institute",
    },
    image:
      "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?q=80&w=500&auto=format&fit=crop",
    rating: 5.0,
    ratingsCount: 50,
  },
  {
    name: "Dr. David Mitchell",
    email: "david@example.com",
    speciality: "Gastroenterologist",
    degree: "MBBS, MS, MCh - Surgical Gastroenterology",
    experience: "10 Years",
    about:
      "Dr. David Mitchell provides specialized surgical and diagnostic interventions for acid reflux, colon health, pancreatitis, and liver metabolic diseases.",
    fees: 85,
    address: {
      line1: "215 South Medical Boulevard",
      line2: "Heritage GI Diagnostics Center",
    },
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=500&auto=format&fit=crop",
    rating: 4.8,
    ratingsCount: 27,
  },
];

export const seedDatabase = async (force = false) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URL);
      console.log("Connected to MongoDB for seeding...");
    }

    // Default password hash for sample accounts: "doctor12345", "admin12345", "patient12345"
    const salt = await bcrypt.genSalt(8);
    const doctorPasswordHash = await bcrypt.hash("doctor12345", salt);
    const adminPasswordHash = await bcrypt.hash("admin12345", salt);
    const patientPasswordHash = await bcrypt.hash("patient12345", salt);

    // 1. Always Ensure Admin Exists
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase().trim();
    let existingAdmin = await adminModel.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await adminModel.create({
        name: "Hospital Super Admin",
        email: adminEmail,
        password: adminPasswordHash,
        role: "admin",
      });
      console.log(`Admin account created: ${adminEmail} (password: admin12345)`);
    } else {
      await adminModel.updateOne({ _id: existingAdmin._id }, { password: adminPasswordHash });
    }

    // Also ensure admin@example.com exists
    if (adminEmail !== "admin@example.com") {
      let defaultAdmin = await adminModel.findOne({ email: "admin@example.com" });
      if (!defaultAdmin) {
        await adminModel.create({
          name: "Hospital Administrator",
          email: "admin@example.com",
          password: adminPasswordHash,
          role: "admin",
        });
      } else {
        await adminModel.updateOne({ _id: defaultAdmin._id }, { password: adminPasswordHash });
      }
    }

    // 2. Always Ensure Demo Patient Exists
    let demoPatient = await userModel.findOne({ email: "patient@example.com" });
    if (!demoPatient) {
      demoPatient = await userModel.create({
        name: "Alex Johnson (Verified)",
        email: "patient@example.com",
        password: patientPasswordHash,
        phone: "+1 555-0199",
        dob: "1995-06-15",
        gender: "Male",
        address: { line1: "42 Wallaby Way", line2: "Sydney Harbor, Suite 10" },
      });
      console.log("Demo patient created: patient@example.com (password: patient12345)");
    } else {
      await userModel.updateOne({ _id: demoPatient._id }, { password: patientPasswordHash });
    }

    // 3. Always Ensure Demo Doctor Exists: doctor@example.com
    const generalDoctorDoc = {
      name: "Dr. Richard James",
      email: "doctor@example.com",
      password: doctorPasswordHash,
      speciality: "General physician",
      degree: "MBBS, MD - General Medicine",
      experience: "5 Years",
      about: "Dr. Richard James is the primary demonstration physician with extensive experience across common health conditions and wellness counseling.",
      fees: 50,
      address: { line1: "123 Medical Center Way", line2: "Downtown Healthcare Block" },
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=500&auto=format&fit=crop",
      available: true,
      slots_booked: {},
      rating: 4.9,
      ratingsCount: 30,
      date: Date.now(),
    };

    const existingDemoDoctor = await doctorModel.findOne({ email: "doctor@example.com" });
    if (!existingDemoDoctor) {
      await doctorModel.create(generalDoctorDoc);
      console.log("Primary demo doctor created: doctor@example.com (password: doctor12345)");
    } else {
      await doctorModel.updateOne({ _id: existingDemoDoctor._id }, { password: doctorPasswordHash });
    }

    const doctorCount = await doctorModel.countDocuments();
    if (doctorCount > 3 && !force) {
      console.log(`Database already has ${doctorCount} doctors. Core demo accounts verified.`);
      return;
    }

    console.log("Seeding full set of sample doctors across all specialities...");

    // 3. Seed Doctors
    let createdDoctors = [];
    for (const doc of sampleDoctors) {
      const existing = await doctorModel.findOne({ email: doc.email });
      if (!existing) {
        const newDoc = await doctorModel.create({
          ...doc,
          password: doctorPasswordHash,
          available: true,
          slots_booked: {},
          date: Date.now(),
        });
        createdDoctors.push(newDoc);
      } else {
        createdDoctors.push(existing);
      }
    }
    console.log(`Seeded ${createdDoctors.length} sample doctors across all specialities.`);

    // 4. Seed Sample Appointments for Demo Patient
    const existingAppointments = await appointmentModel.find({ userId: demoPatient._id });
    if (existingAppointments.length === 0 && createdDoctors.length >= 2) {
      const doc1 = createdDoctors[0];
      const doc2 = createdDoctors[1];

      const today = new Date();
      const slotDateUpcoming = `${today.getDate() + 2}_${today.getMonth() + 1}_${today.getFullYear()}`;
      const slotDatePast = `${Math.max(1, today.getDate() - 3)}_${today.getMonth() + 1}_${today.getFullYear()}`;

      // Completed Appointment with Prescription & Diagnosis
      await appointmentModel.create({
        userId: demoPatient._id.toString(),
        docId: doc1._id.toString(),
        slotDate: slotDatePast,
        slotTime: "11:00 AM",
        userData: {
          name: demoPatient.name,
          email: demoPatient.email,
          phone: demoPatient.phone,
          dob: demoPatient.dob,
          gender: demoPatient.gender,
          image: demoPatient.image,
          address: demoPatient.address,
        },
        docData: {
          name: doc1.name,
          speciality: doc1.speciality,
          degree: doc1.degree,
          fees: doc1.fees,
          address: doc1.address,
          image: doc1.image,
        },
        amount: doc1.fees,
        date: Date.now() - 3 * 24 * 60 * 60 * 1000,
        cancelled: false,
        payment: true,
        paymentMethod: "Card (Demo)",
        paymentId: "TXN_PAID_SAMPLE_01",
        isCompleted: true,
        diagnosisNotes: "Patient presented with mild throat congestion and fatigue. Vitals normal.",
        prescription: "1. Tab Amoxicillin 500mg - 1 tablet twice daily after meals for 5 days\n2. Tab Paracetamol 650mg - as needed for fever/pain\n3. Vitamin C 500mg daily for 10 days\nAdvised plenty of warm fluids and steam inhalation.",
        rating: 5,
        review: "Excellent consultation. Dr. Richard was very thorough and the prescription helped immediately!",
      });

      // Upcoming Confirmed Appointment
      await appointmentModel.create({
        userId: demoPatient._id.toString(),
        docId: doc2._id.toString(),
        slotDate: slotDateUpcoming,
        slotTime: "02:30 PM",
        userData: {
          name: demoPatient.name,
          email: demoPatient.email,
          phone: demoPatient.phone,
          dob: demoPatient.dob,
          gender: demoPatient.gender,
          image: demoPatient.image,
          address: demoPatient.address,
        },
        docData: {
          name: doc2.name,
          speciality: doc2.speciality,
          degree: doc2.degree,
          fees: doc2.fees,
          address: doc2.address,
          image: doc2.image,
        },
        amount: doc2.fees,
        date: Date.now(),
        cancelled: false,
        payment: false,
        paymentMethod: "Pending",
        isCompleted: false,
      });

      // Update doctor slot booking
      await doctorModel.findByIdAndUpdate(doc2._id, {
        $push: { [`slots_booked.${slotDateUpcoming}`]: "02:30 PM" },
      });

      console.log("Sample appointments created with diagnosis & prescription records.");
    }

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

// If run directly from command line: `node Backend/utils/seedData.js`
if (process.argv[1]?.endsWith("seedData.js")) {
  seedDatabase(true).then(() => {
    console.log("Seeder finished. Exiting...");
    process.exit(0);
  });
}
