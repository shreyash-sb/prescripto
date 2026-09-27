import { useState, useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'
import DoctorIdentity from '../../components/DoctorIdentity'

const KNOWLEDGE_CATEGORIES = [
  { id: 'all', label: 'All Topics', icon: '🌐' },
  { id: 'availability', label: 'Doctor Availability & Queue', icon: '🩺' },
  { id: 'roles', label: 'Roles & Permissions', icon: '👥' },
  { id: 'screens', label: 'Screen-by-Screen Guide', icon: '🖥️' },
  { id: 'refunds', label: '100% Refunds & Payments', icon: '💰' },
  { id: 'clinical', label: 'Clinical Safety & Allergy Shield', icon: '🛡️' },
  { id: 'prescriptions', label: 'Rx Schedule & Alarms', icon: '💊' },
  { id: 'privacy', label: 'Privacy Audit Trail', icon: '🔒' },
]

const QA_DATABASE = [
  // Availability & Queue
  {
    category: 'availability',
    q: 'How does Doctor Availability toggling work and what is its live effect?',
    a: 'When an admin or doctor toggles a doctor’s availability to "Unavailable", that doctor is immediately marked as off-duty across the patient platform. Patients browsing doctors will see an "Unavailable" badge and cannot book new appointment slots. However, all previously booked appointments and existing tokens remain safely recorded in the doctor’s schedule.',
  },
  {
    category: 'availability',
    q: 'How does the sequential OPD Queue Token system work?',
    a: 'Every patient who books an appointment for a specific doctor on a chosen date is assigned a sequential Token Number (#1, #2, #3, etc.). In the Doctor Portal, the doctor sees the live token queue and uses the "Call Next Token" button to smoothly advance through consultations.',
  },
  {
    category: 'availability',
    q: 'How is the Clinic Crowd Level (Low / Moderate / Busy) calculated?',
    a: 'Crowd levels are computed automatically based on active token bookings for the doctor: 🟢 Low Crowd (< 3 patients, wait < 10 mins), 🟡 Moderate Crowd (3–6 patients, wait ~15–25 mins), and 🔴 Busy / High Demand (7+ patients, wait ~35+ mins). Patients can filter doctors by crowd level on the Find Doctors page.',
  },

  // Roles & Permissions
  {
    category: 'roles',
    q: 'What are the exact permissions and capabilities of the Hospital Admin role?',
    a: 'Hospital Admins have supreme operational authority: they can view total revenue, financial trends, all booked appointments, register new doctors with portraits and room numbers, remove doctors, toggle doctor availability, verify cash payments, and resolve patient booking disputes.',
  },
  {
    category: 'roles',
    q: 'What can a Doctor do in the Doctor Portal?',
    a: 'Doctors have a dedicated portal to manage their OPD clinic: they can view earnings, inspect their appointment queue (All, Remaining, Completed, Cancelled), review patient medical history and drug allergies before consulting, review current case complaints, mark appointments completed or cancelled, and update their profile details.',
  },
  {
    category: 'roles',
    q: 'What features and protections do Patients have?',
    a: 'Patients can search verified specialists by department and clinic crowd level, book sequential tokens, provide their medical history and current symptoms, receive a 100% instant refund if an appointment is cancelled, auto-sync prescriptions to daily medicine alarms (Morning, Afternoon, Night), log 7-day recovery follow-ups, and inspect HIPAA access logs.',
  },

  // Screen-by-Screen Guide
  {
    category: 'screens',
    q: 'What is the function of each Patient App screen?',
    a: `• Home (/): Clean landing hub with specialty discovery, verified top doctors, refund guarantee banner, patient testimonials, and FAQs.
• Find Doctors (/doctors): Search by doctor name or specialty, filter by live clinic crowd, sort by fees/ratings.
• Appointment Booking (/appointment/:docId): Select date and time slot, receive sequential token, enter current symptoms, review safety warnings.
• My Appointments (/my-appointments): Track live token status, view tax invoice receipts, access e-prescriptions, and cancel with 100% instant refund.
• Medicine Schedule (/medicine-schedule): AI prescription OCR photo parser, daily dosage slots with reminders, adherence scoring.
• My Profile (/profile): Document drug allergies, chronic conditions, vitals, and emergency SOS contact.
• Privacy Logs (/privacy-logs): Complete transparency log showing which doctor/staff accessed medical records and when.
• About Us (/about): Public innovation showcase detailing verified specialists, smart Rx schedules, allergy shields, and privacy logs.`,
  },
  {
    category: 'screens',
    q: 'What is the function of each Doctor Portal screen?',
    a: `• Doctor Dashboard (/doctor-dashboard): High-level earnings overview, active queue count, latest appointments feed, and 1-click "Call Next Patient" action.
• Doctor Appointments (/doctor-appointments): Filter queue by All, Remaining, Completed, or Cancelled. View patient allergy history and current case complaints modal. Mark consultation completed or cancelled.
• Doctor Profile (/doctor-profile): Manage consultation fees, clinic address, experience years, and toggle live OPD availability.`,
  },
  {
    category: 'screens',
    q: 'What is the function of each Admin Portal screen?',
    a: `• Operations Console (/admin-dashboard): Unified executive dashboard with revenue analytics, doctor roster, consultation queue, fast onboarding, and knowledge base.
• Consultations Registry (/all-appointments): Global registry of all patient appointments with cash payment verification and refund tracking.
• Staff Directory (/doctor-list): Directory of all hospital doctors with availability switches and staff removal tools.
• Onboard Doctor (/add-doctor): Registration form to add new medical specialists with photo upload, specialty selection, and room number.`,
  },

  // 100% Refunds & Payments
  {
    category: 'refunds',
    q: 'How does the 100% Automated Refund Engine work upon cancellation?',
    a: 'If a patient or doctor cancels a paid consultation, Prescripto’s Automated Refund Engine immediately marks the appointment as "100% Refunded" and credits the full consultation fee back to the patient’s healthcare wallet with zero cancellation deductions.',
  },
  {
    category: 'refunds',
    q: 'How does the Admin verify cash / counter payments?',
    a: 'For patients paying in cash at the hospital counter, the appointment shows "Pending (Cash)". Admins can click "Collect & Verify Payment" in the Appointments list or Dashboard. This immediately updates the payment status to "Paid (Cash)" and records the revenue.',
  },

  // Clinical Safety & Allergy Shield
  {
    category: 'clinical',
    q: 'How does the Pre-Consultation Allergy Safety Shield protect patients?',
    a: 'When patients document drug allergies (e.g., Penicillin, Sulfa, Aspirin) in their profile, these alerts are automatically attached to their booking. When the attending doctor opens the patient’s case in the Doctor Portal, prominent safety badges are displayed to prevent adverse drug prescriptions.',
  },
  {
    category: 'clinical',
    q: 'How does the Emergency SOS system work?',
    a: 'The Emergency SOS button in the top navigation bar opens instant one-click access to National Emergency Helplines (Ambulance 108/102, Police 100/112, Women Helpline 1091, Poison Control) and displays the patient’s nominated emergency contact for rapid response.',
  },

  // Rx Schedule & Alarms
  {
    category: 'prescriptions',
    q: 'How do prescriptions convert into daily dosage schedules and alarms?',
    a: 'Patients can either click "Sync Rx to Routine" from their appointment receipt or upload a prescription slip photo in the Medicine Schedule page. The system parses the medication names, course durations, and assigns them to Morning (8:00 AM), Afternoon (1:00 PM), Evening (6:00 PM), and Night (9:00 PM) dosage schedules with push alarms.',
  },

  // Privacy Audit Trail
  {
    category: 'privacy',
    q: 'What events are recorded in the Privacy Access Audit Logs?',
    a: 'Every time a doctor, nurse, or administrator views a patient’s profile, vitals, medical history, or appointment records, an immutable log entry is generated in MongoDB recording the accessor name, role, timestamp, action (VIEWED/UPDATED), and specific resource accessed.',
  },
]

const OperationsKnowledgeBase = () => {
  const { doctors, changeAvailability } = useContext(AdminContext)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedIndex, setExpandedIndex] = useState(0)

  // Live Doctor Inspector State
  const [selectedDocId, setSelectedDocId] = useState('')

  const activeDoc = doctors.find((d) => d._id === selectedDocId) || doctors[0]

  const filteredQAs = QA_DATABASE.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesSearch =
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className='w-full max-w-7xl space-y-6'>
      {/* Header Banner */}
      <div className='bg-gradient-to-r from-indigo-700 via-[#5F6FFF] to-indigo-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden'>
        <div className='relative z-10 max-w-2xl'>
          <span className='px-3 py-1 bg-white/20 text-white rounded-full text-xs font-black uppercase tracking-wider'>
            Operations & System Intelligence
          </span>
          <h1 className='text-2xl sm:text-3xl font-black mt-2'>Hospital Operational Knowledge Base & Q&A</h1>
          <p className='text-indigo-100 text-xs sm:text-sm mt-1.5 leading-relaxed'>
            Instant operational answers, live doctor status inspection, role permissions, screen guides, and workflow rules.
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. LIVE DOCTOR STATUS & AVAILABILITY INSPECTOR               */}
      {/* ============================================================ */}
      <div className='bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-xs'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100'>
          <div>
            <div className='flex items-center gap-2'>
              <span className='text-xl'>🩺</span>
              <h2 className='text-base sm:text-lg font-black text-gray-900'>Live Doctor Status & Availability Inspector</h2>
            </div>
            <p className='text-xs text-gray-500 mt-0.5'>
              Select any doctor to inspect real-time OPD status, fee structure, and switch availability instantly.
            </p>
          </div>

          {/* Doctor Selector Dropdown */}
          <div className='flex items-center gap-2'>
            <span className='text-xs font-bold text-gray-500'>Select Doctor:</span>
            <select
              value={selectedDocId || (activeDoc ? activeDoc._id : '')}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className='border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-900 bg-gray-50 outline-none focus:border-primary'
            >
              {doctors.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.available ? '🟢' : '🔴'} {doc.name} ({doc.speciality})
                </option>
              ))}
            </select>
          </div>
        </div>

        {activeDoc ? (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-5 mt-5'>
            {/* Doctor Identity & Photo */}
            <div className='flex items-center gap-4 bg-gray-50/80 p-4 rounded-2xl border border-gray-200/80'>
              <div className='w-16 h-16 rounded-2xl overflow-hidden border border-gray-200 flex-shrink-0 bg-white shadow-xs'>
                <DoctorIdentity
                  name={activeDoc.name}
                  speciality={activeDoc.speciality}
                  docId={activeDoc._id}
                  degree={activeDoc.degree}
                  className='w-full h-full'
                />
              </div>
              <div className='min-w-0'>
                <h3 className='font-black text-sm text-gray-900 truncate'>{activeDoc.name}</h3>
                <p className='text-xs text-primary font-bold truncate'>{activeDoc.speciality}</p>
                <p className='text-[11px] text-gray-400 truncate'>{activeDoc.degree}</p>
                <span className='inline-block text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md mt-1'>
                  Fee: ${activeDoc.fees}
                </span>
              </div>
            </div>

            {/* Live Status & Quick Toggle */}
            <div className='bg-gray-50/80 p-4 rounded-2xl border border-gray-200/80 flex flex-col justify-between'>
              <div>
                <p className='text-xs font-bold uppercase tracking-wider text-gray-500'>Current OPD Platform Status</p>
                <div className='flex items-center gap-2 mt-1.5'>
                  <span
                    className={`w-3 h-3 rounded-full ${
                      activeDoc.available ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                    }`}
                  />
                  <span
                    className={`text-sm font-black ${
                      activeDoc.available ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {activeDoc.available ? 'Available (Accepting OPD Appointments)' : 'Unavailable (Off-Duty)'}
                  </span>
                </div>
              </div>

              <div className='mt-3 pt-2 border-t border-gray-200/60 flex items-center justify-between'>
                <span className='text-xs font-medium text-gray-600'>Toggle Availability:</span>
                <button
                  type='button'
                  onClick={() => changeAvailability(activeDoc._id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                    activeDoc.available
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {activeDoc.available ? 'Mark as Unavailable 🔴' : 'Mark as Available 🟢'}
                </button>
              </div>
            </div>

            {/* Operational Impact Note */}
            <div className='bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 text-xs space-y-1.5 text-gray-700 flex flex-col justify-center'>
              <p className='font-bold text-indigo-950 flex items-center gap-1.5'>
                <span>ℹ️</span> Operational Guide for this Doctor:
              </p>
              <p className='text-[11px] leading-relaxed text-indigo-900'>
                {activeDoc.available
                  ? 'Patients can browse this doctor, see available time slots, and book sequential tokens.'
                  : 'Booking slots for this doctor are hidden from patients. Existing bookings remain intact.'}
              </p>
              <p className='text-[11px] text-gray-500'>
                Room: <span className='font-bold text-gray-800'>{activeDoc.roomNumber || 'Room 102, Wing A'}</span> •
                Exp: <span className='font-bold text-gray-800'>{activeDoc.experience || '1 Year'}</span>
              </p>
            </div>
          </div>
        ) : (
          <p className='text-xs text-gray-400 mt-4'>No doctors found in the database.</p>
        )}
      </div>

      {/* ============================================================ */}
      {/* 2. ROLES & PERMISSIONS MATRIX                                */}
      {/* ============================================================ */}
      <div className='bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-xs'>
        <div className='pb-4 border-b border-gray-100'>
          <h2 className='text-base sm:text-lg font-black text-gray-900 flex items-center gap-2'>
            <span>👥</span> Roles & Permissions Breakdown
          </h2>
          <p className='text-xs text-gray-500 mt-0.5'>
            Understanding what each role is permitted to view, update, and manage across the system.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-5'>
          {/* Admin Role */}
          <div className='p-5 rounded-2xl border border-indigo-200 bg-indigo-50/40 space-y-3'>
            <div className='flex items-center gap-2.5'>
              <span className='text-2xl'>🛡️</span>
              <div>
                <h3 className='font-black text-sm text-gray-900'>Hospital Admin</h3>
                <span className='text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full'>
                  Full Management Authority
                </span>
              </div>
            </div>
            <ul className='text-xs text-gray-700 space-y-1.5 list-disc list-inside leading-relaxed'>
              <li>Onboard new doctors with portraits and credentials</li>
              <li>Global availability switches & staff removal</li>
              <li>Inspect all patient bookings & cash verifications</li>
              <li>Revenue analytics & automated 100% refund tracking</li>
              <li>Access system operational knowledge base</li>
            </ul>
          </div>

          {/* Doctor Role */}
          <div className='p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-3'>
            <div className='flex items-center gap-2.5'>
              <span className='text-2xl'>👨‍⚕️</span>
              <div>
                <h3 className='font-black text-sm text-gray-900'>Attending Doctor</h3>
                <span className='text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full'>
                  Clinical OPD Console
                </span>
              </div>
            </div>
            <ul className='text-xs text-gray-700 space-y-1.5 list-disc list-inside leading-relaxed'>
              <li>Live queue token management &amp; &apos;Call Next Patient&apos;</li>
              <li>Review pre-consultation allergy shield &amp; case notes</li>
              <li>Access patient profile &amp; chronic conditions</li>
              <li>Mark consultation completed or cancelled</li>
              <li>Update doctor fee, profile, and OPD availability</li>
            </ul>
          </div>

          {/* Patient Role */}
          <div className='p-5 rounded-2xl border border-sky-200 bg-sky-50/40 space-y-3'>
            <div className='flex items-center gap-2.5'>
              <span className='text-2xl'>🧑‍🦱</span>
              <div>
                <h3 className='font-black text-sm text-gray-900'>Patient / User</h3>
                <span className='text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full'>
                  Health Hub & Consultations
                </span>
              </div>
            </div>
            <ul className='text-xs text-gray-700 space-y-1.5 list-disc list-inside leading-relaxed'>
              <li>Find doctors by specialty & live clinic crowd levels</li>
              <li>Sequential token generation upon appointment booking</li>
              <li>Document drug allergies & current symptoms</li>
              <li>100% Instant Refund to wallet on cancellation</li>
              <li>Sync prescriptions into daily dosage schedule alarms</li>
              <li>HIPAA privacy audit logs & Emergency SOS access</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. SEARCHABLE OPERATIONAL Q&A REPOSITORY                     */}
      {/* ============================================================ */}
      <div className='bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5'>
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100'>
          <div>
            <h2 className='text-base sm:text-lg font-black text-gray-900 flex items-center gap-2'>
              <span>📚</span> Operational Questions & Ready Answers Repository
            </h2>
            <p className='text-xs text-gray-500 mt-0.5'>
              Type any keyword or select a category to get ready-to-use answers for every operational workflow.
            </p>
          </div>

          {/* Search Input */}
          <div className='relative min-w-[260px]'>
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search Q&A (e.g. refund, token, allergy, availability)...'
              className='w-full border border-gray-300 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-primary pr-8'
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className='absolute right-2.5 top-2 text-xs text-gray-400 hover:text-gray-600 font-bold'
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className='flex items-center gap-2 overflow-x-auto pb-1 text-xs'>
          {KNOWLEDGE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Q&A Accordion List */}
        <div className='space-y-3 pt-2'>
          {filteredQAs.length === 0 ? (
            <div className='p-12 text-center text-gray-400'>
              <p className='text-3xl mb-2'>🔍</p>
              <p className='font-bold text-gray-700 text-sm'>No matching questions found</p>
              <p className='text-xs mt-1'>Try adjusting your search query or choosing another category.</p>
            </div>
          ) : (
            filteredQAs.map((item, idx) => {
              const isOpen = expandedIndex === idx
              return (
                <div
                  key={idx}
                  className='border border-gray-200 rounded-2xl overflow-hidden transition-all shadow-xs'
                >
                  <button
                    type='button'
                    onClick={() => setExpandedIndex(isOpen ? null : idx)}
                    className='w-full text-left p-4 sm:p-4.5 bg-gray-50/70 hover:bg-gray-50 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-gray-900 transition-colors'
                  >
                    <span className='flex items-center gap-2'>
                      <span className='text-primary'>Q{idx + 1}.</span>
                      <span>{item.q}</span>
                    </span>
                    <span
                      className={`text-lg font-black text-gray-400 transition-transform ${
                        isOpen ? 'rotate-45 text-primary' : ''
                      }`}
                    >
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <div className='p-4 sm:p-5 bg-white text-xs sm:text-sm text-gray-700 leading-relaxed border-t border-gray-100 whitespace-pre-line'>
                      {item.a}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default OperationsKnowledgeBase
