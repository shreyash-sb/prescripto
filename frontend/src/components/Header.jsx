import { useContext } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Header = () => {
  const navigate = useNavigate()
  const { t } = useContext(AppContext)

  return (
    <div className='flex flex-col gap-6'>
      {/* Main Hero Card */}
      <div className='flex flex-col md:flex-row flex-wrap bg-gradient-to-br from-[#5F6FFF] via-[#4f5ee8] to-[#3a49d6] rounded-3xl px-6 md:px-10 lg:px-16 shadow-xl relative overflow-hidden'>
        {/* Decorative background glow circle */}
        <div className='absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none' />
        <div className='absolute -left-20 -bottom-20 w-80 h-80 bg-black/10 rounded-full blur-3xl pointer-events-none' />

        {/* Left Side: Content */}
        <div className='md:w-1/2 flex flex-col items-start justify-center gap-5 py-10 md:py-[6vw] z-10'>
          {/* Trust Badge */}
          <div className='inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-full shadow-sm'>
            <span className='w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping' />
            <span>● 24/7 Smart Queue • Instant Slot Booking</span>
          </div>

          <h1 className='text-3xl sm:text-5xl lg:text-6xl text-white font-extrabold leading-tight tracking-tight'>
            Book Appointments <br />
            <span className='text-emerald-300'>With Trusted Doctors</span>
          </h1>

          <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3 text-white/95 text-sm sm:text-base font-normal'>
            <img className='w-28 sm:w-32 drop-shadow-sm' src={assets.group_profiles} alt='Patient Avatars' />
            <p className='leading-relaxed'>
              Schedule verified doctor consultations, receive automated allergy safety cross-checks, and auto-sync prescriptions to daily medicine alarms.
            </p>
          </div>

          <div className='pt-2'>
            <a
              href='#speciality'
              className='inline-flex items-center gap-2.5 bg-white text-primary px-8 sm:px-10 py-4 rounded-full font-extrabold text-sm sm:text-base shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300'
            >
              <span>{t('bookDoctor')}</span>
              <img src={assets.arrow_icon} className='w-3.5' alt='' />
            </a>
          </div>
        </div>

        {/* Right Side: Hero Image */}
        <div className='md:w-1/2 relative flex items-end justify-center min-h-[260px] md:min-h-0'>
          <img
            src={assets.header_img}
            className='w-full max-w-md md:absolute md:bottom-0 md:right-0 h-auto drop-shadow-2xl'
            alt='Doctor Illustration'
          />
        </div>
      </div>

      {/* Metrics & Statistics Strip */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm'>
        <div className='text-center p-3 border-r last:border-r-0 border-gray-100'>
          <p className='text-2xl sm:text-3xl font-extrabold text-primary'>⚡ &lt; 15 min</p>
          <p className='text-xs sm:text-sm text-gray-600 font-semibold mt-1'>{t('avgWaitTime')}</p>
        </div>
        <div className='text-center p-3 sm:border-r border-gray-100'>
          <p className='text-2xl sm:text-3xl font-extrabold text-emerald-600'>100%</p>
          <p className='text-xs sm:text-sm text-gray-600 font-semibold mt-1'>{t('refundGuarantee')}</p>
        </div>
        <div className='text-center p-3 border-r last:border-r-0 border-gray-100'>
          <p className='text-2xl sm:text-3xl font-extrabold text-indigo-600'>100+</p>
          <p className='text-xs sm:text-sm text-gray-600 font-semibold mt-1'>Verified Specialists</p>
        </div>
        <div className='text-center p-3'>
          <p className='text-2xl sm:text-3xl font-extrabold text-amber-500'>⭐ 4.9 / 5</p>
          <p className='text-xs sm:text-sm text-gray-600 font-semibold mt-1'>{t('patientSatisfaction')}</p>
        </div>
      </div>
    </div>
  )
}

export default Header
