import { useState, useContext } from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'
import SymptomTriageModal from '../components/SymptomTriageModal'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const [openFaq, setOpenFaq] = useState(null)
  const [showTriage, setShowTriage] = useState(false)
  const { t } = useContext(AppContext)
  const navigate = useNavigate()

  const faqs = [
    {
      q: 'How do I filter doctors based on live clinic crowd?',
      a: 'In the All Doctors tab, use the Crowd Level filter (Low Crowd, Moderate, Busy) or sort by Lowest Wait Time to book doctors with fast-track queues.',
    },
    {
      q: 'How does the automated 100% refund policy work?',
      a: 'If you or the attending doctor cancels a paid consultation, our Automated Refund Engine immediately issues a 100% full refund to your healthcare wallet and logs the audit reference.',
    },
    {
      q: 'How do I convert my doctor prescription into a medicine schedule?',
      a: 'Go to My Appointments and click "Sync Rx to Routine", or navigate to Medicine Schedule and click "AI Prescription Photo Parser". It automatically detects medicine names, times (Morning/Night), and sets daily reminders.',
    },
    {
      q: 'Can I see who has accessed my medical records and when?',
      a: 'Yes! Prescripto includes a dedicated Privacy Access Audit Log. You can view timestamped trails of every doctor or administrator who opened your profile, vitals, or medical history.',
    },
    {
      q: 'What languages are supported?',
      a: 'Prescripto offers full multi-lingual support across English, Hindi (हिंदी), and Marathi (मराठी). You can change language instantly in the top navbar.',
    },
  ]

  const testimonials = [
    {
      name: 'Sarah Jenkins',
      role: 'Verified Patient',
      rating: 5,
      comment:
        'The live queue tracker and crowd filter saved me hours! I chose a doctor with Low Crowd and got attended in under 10 minutes.',
    },
    {
      name: 'Amit Deshmukh',
      role: 'Cardiology Patient (Pune)',
      rating: 5,
      comment:
        'मराठी भाषेतील इंटरफेस अतिशय सोपा आहे. प्रिस्क्रिप्शन थेट दैनंदिन औषध वेळापत्रकात सिंक झाले, अलार्म पण वाजतो!',
    },
    {
      name: 'Elena Rostova',
      role: 'Dermatology Patient',
      rating: 5,
      comment:
        'When I had to cancel my slot, the 100% refund was credited immediately into my healthcare wallet. True transparency and peace of mind.',
    },
  ]

  return (
    <div className='space-y-12 py-2'>
      <Header onOpenTriage={() => setShowTriage(true)} />

      {/* Feature Showcase Grid (Crowd Filter, Rx Sync, Safety Shield, Privacy Trail) */}
      <section className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 my-8'>
        {/* Card 1 */}
        <div
          onClick={() => navigate('/doctors')}
          className='p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-200/80 hover:shadow-lg transition-all cursor-pointer group'
        >
          <div className='w-12 h-12 rounded-2xl bg-emerald-500 text-white text-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform'>
            👥
          </div>
          <h3 className='text-lg font-black text-gray-900 mt-4'>Live Crowd Filter</h3>
          <p className='text-xs text-gray-600 mt-1 leading-relaxed'>
            Filter clinics by live crowd (Low / Moderate / Busy) and avoid long OPD waiting times.
          </p>
          <span className='inline-block text-xs font-bold text-emerald-700 mt-3 group-hover:underline'>
            Find Fast-Track Doctors →
          </span>
        </div>

        {/* Card 2 */}
        <div
          onClick={() => navigate('/medicine-schedule')}
          className='p-6 rounded-3xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200/80 hover:shadow-lg transition-all cursor-pointer group'
        >
          <div className='w-12 h-12 rounded-2xl bg-primary text-white text-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform'>
            💊
          </div>
          <h3 className='text-lg font-black text-gray-900 mt-4'>Rx → Medicine Schedule</h3>
          <p className='text-xs text-gray-600 mt-1 leading-relaxed'>
            1-click convert prescriptions into timed daily dose reminders with audio alerts.
          </p>
          <span className='inline-block text-xs font-bold text-primary mt-3 group-hover:underline'>
            Manage Schedule →
          </span>
        </div>

        {/* Card 3 */}
        <div
          onClick={() => navigate('/my-profile')}
          className='p-6 rounded-3xl bg-gradient-to-br from-red-500/10 to-rose-500/10 border border-red-200/80 hover:shadow-lg transition-all cursor-pointer group'
        >
          <div className='w-12 h-12 rounded-2xl bg-red-500 text-white text-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform'>
            🛡️
          </div>
          <h3 className='text-lg font-black text-gray-900 mt-4'>Allergy Safety Shield</h3>
          <p className='text-xs text-gray-600 mt-1 leading-relaxed'>
            Pre-consultation drug sensitivity warnings flag allergies to doctors before prescribing.
          </p>
          <span className='inline-block text-xs font-bold text-red-600 mt-3 group-hover:underline'>
            Configure Shield →
          </span>
        </div>

        {/* Card 4 */}
        <div
          onClick={() => navigate('/audit-logs')}
          className='p-6 rounded-3xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-200/80 hover:shadow-lg transition-all cursor-pointer group'
        >
          <div className='w-12 h-12 rounded-2xl bg-purple-600 text-white text-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform'>
            🔒
          </div>
          <h3 className='text-lg font-black text-gray-900 mt-4'>Privacy Access Log</h3>
          <p className='text-xs text-gray-600 mt-1 leading-relaxed'>
            Complete transparency. Know exactly which doctor or staff accessed your records and when.
          </p>
          <span className='inline-block text-xs font-bold text-purple-700 mt-3 group-hover:underline'>
            Inspect Audit Trail →
          </span>
        </div>
      </section>

      <SpecialityMenu />
      <TopDoctors />

      {/* 100% Refund & Patient Rights Banner */}
      <section className='bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden'>
        <div className='max-w-xl'>
          <span className='px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold uppercase tracking-wider'>
            Automated Protection
          </span>
          <h2 className='text-2xl sm:text-3xl font-black mt-3'>
            100% Instant Refund Guarantee on Cancellation
          </h2>
          <p className='text-emerald-100 text-sm sm:text-base mt-2 leading-relaxed'>
            Plans change. If you or the attending doctor cancels an appointment, your entire consultation fee is
            refunded instantly with zero deductions.
          </p>
        </div>
        <div className='shrink-0 flex items-center gap-3'>
          <button
            onClick={() => navigate('/my-appointments')}
            className='px-8 py-4 bg-white text-emerald-800 hover:bg-emerald-50 rounded-full font-extrabold text-base shadow-lg transition-all hover:scale-105'
          >
            Track My Appointments
          </button>
        </div>
      </section>

      {/* Verified Patient Reviews / Testimonials */}
      <section className='my-16'>
        <div className='text-center max-w-xl mx-auto mb-10'>
          <h2 className='text-3xl sm:text-4xl font-bold text-gray-900'>What Patients Say</h2>
          <p className='text-base sm:text-lg text-gray-500 mt-2'>
            Over 15,000+ consultations delivered with clinical safety and transparent care
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className='bg-white p-7 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between'
            >
              <div>
                <div className='flex items-center gap-1.5 text-amber-400 text-base mb-3'>
                  {'★'.repeat(item.rating)}
                </div>
                <p className='text-gray-700 text-base italic leading-relaxed'>&ldquo;{item.comment}&rdquo;</p>
              </div>
              <div className='mt-6 pt-4 border-t border-gray-100 flex items-center justify-between'>
                <div>
                  <p className='font-bold text-gray-900 text-base'>{item.name}</p>
                  <p className='text-xs text-primary font-semibold'>{item.role}</p>
                </div>
                <span className='text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-200'>
                  ✓ Verified
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) */}
      <section className='my-16 bg-gray-50/80 p-8 sm:p-14 rounded-3xl border border-gray-200/80'>
        <div className='text-center max-w-xl mx-auto mb-10'>
          <h2 className='text-3xl sm:text-4xl font-bold text-gray-900'>Frequently Asked Questions</h2>
          <p className='text-base sm:text-lg text-gray-500 mt-2'>
            Everything you need to know about clinic crowd tracking, refunds, and medicines
          </p>
        </div>

        <div className='max-w-3xl mx-auto space-y-4'>
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx
            return (
              <div
                key={idx}
                className='bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all shadow-sm'
              >
                <button
                  type='button'
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className='w-full text-left px-7 py-5 flex items-center justify-between gap-4 font-bold text-base sm:text-lg text-gray-800 hover:text-primary transition-colors'
                >
                  <span>{faq.q}</span>
                  <span className={`text-2xl font-bold transition-transform ${isOpen ? 'rotate-45 text-primary' : 'text-gray-400'}`}>
                    +
                  </span>
                </button>
                {isOpen && (
                  <div className='px-7 pb-5 text-base text-gray-600 leading-relaxed border-t border-gray-100 pt-4 animate-fade-in'>
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <Banner />

      {/* Symptom Triage Modal */}
      {showTriage && <SymptomTriageModal onClose={() => setShowTriage(false)} />}
    </div>
  )
}

export default Home
