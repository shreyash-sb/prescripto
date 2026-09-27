import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const About = () => {
  const navigate = useNavigate()

  return (
    <div className='space-y-12 py-4'>
      {/* Page Title */}
      <div className='text-center pt-6'>
        <p className='text-xs sm:text-sm font-extrabold uppercase tracking-widest text-primary'>Empowering Modern Healthcare</p>
        <h1 className='text-2xl sm:text-3xl font-black text-gray-900 mt-1'>
          About <span className='text-primary'>Prescripto</span>
        </h1>
        <p className='text-xs sm:text-sm text-gray-500 max-w-xl mx-auto mt-1'>
          Bridging the gap between patients, verified medical specialists, and clinical operations with transparency and security.
        </p>
      </div>

      {/* Hero Section */}
      <div className='flex flex-col lg:flex-row gap-10 items-center bg-white p-6 sm:p-10 rounded-3xl border border-gray-200/80 shadow-sm'>
        <img className='w-full lg:max-w-[420px] rounded-2xl shadow-md object-cover' src={assets.about_image} alt="About Prescripto" />
        <div className='flex flex-col justify-center gap-4 lg:w-3/5 text-sm sm:text-base text-gray-700 leading-relaxed'>
          <h2 className='text-xl sm:text-2xl font-black text-gray-900'>
            Your Trusted Healthcare & Smart Prescription Partner
          </h2>
          <p>
            Welcome to <strong className='text-gray-900 font-bold'>Prescripto</strong>, an integrated clinical ecosystem designed to modernize patient care. We simplify finding certified medical specialists, reserving verified OPD appointment slots, tracking medical histories, and receiving structured digital e-prescriptions.
          </p>
          <p>
            Built on a resilient high-security infrastructure, Prescripto ensures maximum privacy, fast appointment scheduling, and automated patient protections including instant cancellation refunds and drug sensitivity cross-checks.
          </p>
          <div className='pt-2 border-t border-gray-100 flex flex-wrap gap-4 text-xs font-bold text-gray-800'>
            <span className='flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-full'>
              ✓ 100% Verified Specialists
            </span>
            <span className='flex items-center gap-1.5 bg-indigo-50 text-primary border border-indigo-200 px-3 py-1.5 rounded-full'>
              ✓ Instant Wallet Refunds
            </span>
            <span className='flex items-center gap-1.5 bg-purple-50 text-purple-800 border border-purple-200 px-3 py-1.5 rounded-full'>
              ✓ Transparent Access Logs
            </span>
          </div>
        </div>
      </div>

      {/* Mission & Core Principles */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 text-white p-8 rounded-3xl shadow-md'>
          <span className='text-2xl block mb-2'>🎯</span>
          <h3 className='text-lg font-black'>Our Mission</h3>
          <p className='text-xs sm:text-sm text-indigo-100 mt-2 leading-relaxed'>
            To democratize patient healthcare access through transparent scheduling, eliminating long clinic queues with orderly sequential tokens, and enabling patients to manage their prescriptions from anywhere.
          </p>
        </div>
        <div className='bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-8 rounded-3xl shadow-md'>
          <span className='text-2xl block mb-2'>🌟</span>
          <h3 className='text-lg font-black'>Our Vision</h3>
          <p className='text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed'>
            To establish a new global benchmark for smart patient safety — integrating real-time allergy shields, AI prescription digitization, and auditable data privacy into everyday clinical consultations.
          </p>
        </div>
      </div>

      {/* WHY CHOOSE US: 4 INNOVATIVE CORE PLATFORM FEATURES */}
      <div className='space-y-6'>
        <div className='text-center'>
          <p className='text-xs font-extrabold uppercase tracking-wider text-primary'>Platform Innovations</p>
          <h2 className='text-xl sm:text-2xl font-black text-gray-900 mt-0.5'>
            Why Patients & Doctors Choose <span className='text-primary'>Prescripto</span>
          </h2>
          <p className='text-xs sm:text-sm text-gray-500 max-w-lg mx-auto'>
            Engineered with intelligent features that protect patient health, streamline treatments, and ensure transparency.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          {/* Feature 1: Verified Specialists */}
          <div className='bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group'>
            <div>
              <div className='w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 text-2xl flex items-center justify-center border border-emerald-200 mb-4 group-hover:scale-110 transition-transform'>
                👨‍⚕️
              </div>
              <h3 className='text-lg font-black text-gray-900'>1. Verified Specialists Directory</h3>
              <p className='text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed'>
                Access certified medical practitioners across General Medicine, Gynecological Care, Dermatology, Pediatrics, Neurology, and Gastroenterology. Review doctor credentials, experience, consultation fees, and patient reviews with zero hidden charges.
              </p>
            </div>
            <div className='mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold'>
              <span className='text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full'>Certified Doctors</span>
              <button
                onClick={() => navigate('/doctors')}
                className='text-primary hover:underline flex items-center gap-1'
              >
                Browse Doctors →
              </button>
            </div>
          </div>

          {/* Feature 2: Rx → Smart Medicine Schedule */}
          <div className='bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group'>
            <div>
              <div className='w-12 h-12 rounded-2xl bg-indigo-500/10 text-primary text-2xl flex items-center justify-center border border-indigo-200 mb-4 group-hover:scale-110 transition-transform'>
                💊
              </div>
              <h3 className='text-lg font-black text-gray-900'>2. Smart Rx → Medicine Schedule & Alarms</h3>
              <p className='text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed'>
                Never miss a dose again. Prescriptions issued by doctors automatically convert into timed daily dosage schedules. Patients can also upload prescription photos for instant AI extraction, receive timely alarms (Morning, Afternoon, Night), and track adherence scores.
              </p>
            </div>
            <div className='mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold'>
              <span className='text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-full'>Daily Dose Alarms</span>
              <span className='text-gray-400'>Auto-synced from Rx</span>
            </div>
          </div>

          {/* Feature 3: Allergy Safety Shield */}
          <div className='bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group'>
            <div>
              <div className='w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 text-2xl flex items-center justify-center border border-rose-200 mb-4 group-hover:scale-110 transition-transform'>
                🛡️
              </div>
              <h3 className='text-lg font-black text-gray-900'>3. Pre-Consultation Allergy Safety Shield</h3>
              <p className='text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed'>
                Your safety is paramount. When booking an appointment, documented drug allergies and chronic medical conditions are securely attached to your case report. Attending doctors receive safety alerts before prescribing, preventing adverse drug reactions.
              </p>
            </div>
            <div className='mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold'>
              <span className='text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full'>Adverse Drug Protection</span>
              <span className='text-gray-400'>Clinical Safety First</span>
            </div>
          </div>

          {/* Feature 4: Privacy Access Audit Log */}
          <div className='bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group'>
            <div>
              <div className='w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-700 text-2xl flex items-center justify-center border border-purple-200 mb-4 group-hover:scale-110 transition-transform'>
                🔒
              </div>
              <h3 className='text-lg font-black text-gray-900'>4. Transparent Privacy & Access Audit Logs</h3>
              <p className='text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed'>
                Uncompromised medical data transparency. Patients retain full visibility into who accessed their records, what details were viewed, and the exact timestamp of each consultation review, ensuring healthcare compliance and complete peace of mind.
              </p>
            </div>
            <div className='mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold'>
              <span className='text-purple-800 bg-purple-50 px-2.5 py-1 rounded-full'>100% Auditable Trails</span>
              <span className='text-gray-400'>HIPAA / GDPR Aligned</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
