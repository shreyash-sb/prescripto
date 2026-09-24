import { useState } from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'

const Home = () => {
  const [openFaq, setOpenFaq] = useState(null)

  const faqs = [
    {
      q: 'How do I book an appointment with a doctor?',
      a: 'Select your preferred doctor from our directory, pick an available date and 30-minute time slot, and click Confirm Booking. You can track all your bookings in the My Appointments tab.',
    },
    {
      q: 'Can I get a digital prescription after consultation?',
      a: 'Yes! Once your doctor completes the consultation, they provide digital diagnosis notes and Rx prescription medication details which you can view, save, and print anytime.',
    },
    {
      q: 'What payment methods are supported?',
      a: 'We support instant simulated Card checkout, UPI QR payment simulator, and Cash payment directly on clinic arrival.',
    },
    {
      q: 'How can doctors and administrators manage appointments?',
      a: 'Healthcare specialists and hospital administrators have dedicated login portals with live consultation queues, earnings metrics, e-prescription generation tools, and staff directory management.',
    },
  ]

  const testimonials = [
    {
      name: 'Sarah Jenkins',
      role: 'Verified Patient',
      rating: 5,
      comment:
        'Booking Dr. Richard James was seamless. Got instant confirmation and downloaded my prescription right after the consultation!',
    },
    {
      name: 'David Miller',
      role: 'Cardiology Patient',
      rating: 5,
      comment:
        'The 7-day slot availability feature saved me hours of clinic waiting. Outstanding platform design and ease of use.',
    },
    {
      name: 'Elena Rostova',
      role: 'Dermatology Patient',
      rating: 5,
      comment:
        'Cleanest healthcare app I have ever used. Love the instant UPI simulator and tax invoice generation!',
    },
  ]

  return (
    <div className='space-y-12 py-2'>
      <Header />
      <SpecialityMenu />
      <TopDoctors />

      {/* Verified Patient Reviews / Testimonials */}
      <section className='my-16'>
        <div className='text-center max-w-xl mx-auto mb-10'>
          <h2 className='text-3xl sm:text-4xl font-bold text-gray-900'>What Patients Say</h2>
          <p className='text-base sm:text-lg text-gray-500 mt-2'>
            Over 15,000+ consultations delivered with top clinical excellence
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
            Everything you need to know about booking, prescriptions, and healthcare consultations
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
    </div>
  )
}

export default Home
