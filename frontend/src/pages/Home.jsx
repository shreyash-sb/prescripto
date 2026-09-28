import { useState } from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const [openFaq, setOpenFaq] = useState(null)
  const navigate = useNavigate()

  const faqs = [
    {
      q: 'How do I search and book certified doctors?',
      a: 'Browse the All Doctors directory, filter by clinical department (General Physician, Dermatologist, Gynecologist, etc.), or search by specialist name. Select an available 30-minute slot from the 7-day calendar to book instantly.',
    },
    {
      q: 'How does the 100% instant refund guarantee work?',
      a: 'If you or the attending doctor cancels an appointment before consultation, our automated refund engine immediately credits 100% of your consultation fee back to your Healthcare Wallet with zero cancellation deductions.',
    },
    {
      q: 'What is the sequential token system?',
      a: 'Every consultation booking automatically generates an orderly sequential Token # (#1, #2, #3...) for the doctor’s daily OPD queue, ensuring fair and transparent entry without waiting in physical lines.',
    },
    {
      q: 'How do I convert a doctor prescription into a daily medicine schedule?',
      a: 'Open My Appointments and click "Sync Rx to Daily Routine", or navigate to Medicine Schedule and upload a photo of your prescription. It automatically organizes medicines into Morning, Afternoon, Evening, and Night dose timers.',
    },
    {
      q: 'How does the Pre-Consultation Allergy Shield protect me?',
      a: 'Documenting your drug allergies (such as Penicillin, Sulfa, or Aspirin) in your Profile automatically flags warning notices to attending doctors before they prescribe medications, preventing adverse drug reactions.',
    },
  ]

  const testimonials = [
    {
      name: 'Sarah Jenkins',
      role: 'Verified Patient',
      rating: 5,
      comment:
        'The sequential token system saved me hours! I walked into the clinic knowing my exact queue number and was attended right on schedule.',
    },
    {
      name: 'Amit Deshmukh',
      role: 'Patient (Pune)',
      rating: 5,
      comment:
        'The interface is simple, clean, and intuitive. My doctor’s prescription automatically synced to my daily medicine schedule with timely alarm reminders!',
    },
    {
      name: 'Elena Rostova',
      role: 'Dermatology Patient',
      rating: 5,
      comment:
        'When I had to cancel my appointment due to work, 100% of the consultation fee was credited immediately into my wallet without any deduction. Truly transparent care.',
    },
  ]

  return (
    <div className='space-y-10 py-2'>
      <Header />
      <SpecialityMenu />
      <TopDoctors />

      {/* 100% Instant Refund & Patient Protection Section */}
      <section className='bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 text-white rounded-3xl p-7 sm:p-10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden'>
        <div className='max-w-xl'>
          <span className='px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold uppercase tracking-wider'>
            Patient First Policy
          </span>
          <h2 className='text-2xl sm:text-3xl font-bold mt-2.5'>
            100% Instant Refund Guarantee on Cancellation
          </h2>
          <p className='text-teal-100 text-xs sm:text-sm mt-2 leading-relaxed'>
            We respect your time and schedule. If an appointment is cancelled by you or the attending doctor prior to consultation, 100% of your fee is reimbursed instantly to your Healthcare Wallet.
          </p>
        </div>
        <div className='shrink-0'>
          <button
            onClick={() => navigate('/my-appointments')}
            className='px-7 py-3.5 bg-white text-teal-800 hover:bg-teal-50 rounded-full font-bold text-sm shadow-md transition-all hover:scale-105 active:scale-95'
          >
            Track My Consultations
          </button>
        </div>
      </section>

      {/* Verified Patient Feedback */}
      <section className='my-8'>
        <div className='text-center max-w-lg mx-auto mb-6'>
          <h2 className='text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight'>What Patients Say</h2>
          <p className='text-xs sm:text-sm text-gray-500 mt-1'>
            Real experiences from patients consulting verified specialists
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5'>
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className='bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between'
            >
              <div>
                <div className='flex items-center gap-1 text-amber-400 text-sm mb-2'>
                  {'★'.repeat(item.rating)}
                </div>
                <p className='text-gray-700 text-xs sm:text-sm leading-relaxed'>&ldquo;{item.comment}&rdquo;</p>
              </div>
              <div className='mt-4 pt-3 border-t border-gray-100 flex items-center justify-between'>
                <div>
                  <p className='font-bold text-gray-900 text-xs sm:text-sm'>{item.name}</p>
                  <p className='text-[11px] text-primary font-semibold'>{item.role}</p>
                </div>
                <span className='text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200'>
                  ✓ Verified
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className='my-8 bg-gray-50/70 p-6 sm:p-9 rounded-3xl border border-gray-100'>
        <div className='text-center max-w-lg mx-auto mb-6'>
          <h2 className='text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight'>Frequently Asked Questions</h2>
          <p className='text-xs sm:text-sm text-gray-500 mt-1'>
            Quick answers about appointments, queue tokens, and medicine schedules
          </p>
        </div>

        <div className='max-w-2xl mx-auto space-y-3'>
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx
            return (
              <div
                key={idx}
                className='bg-white border border-gray-200/80 rounded-xl overflow-hidden transition-all shadow-2xs'
              >
                <button
                  type='button'
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className='w-full text-left px-5 py-3.5 flex items-center justify-between gap-3 font-semibold text-sm sm:text-base text-gray-800 hover:text-primary transition-colors'
                >
                  <span>{faq.q}</span>
                  <span className={`text-xl font-bold transition-transform ${isOpen ? 'rotate-45 text-primary' : 'text-gray-400'}`}>
                    +
                  </span>
                </button>
                {isOpen && (
                  <div className='px-5 pb-4 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3 animate-fade-in'>
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <Banner />
    </div>
  )
}

export default Home
