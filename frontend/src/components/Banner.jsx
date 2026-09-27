import { useContext } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Banner = () => {
  const navigate = useNavigate()
  const { t } = useContext(AppContext)

  return (
    <div className='flex bg-gradient-to-r from-primary to-indigo-600 rounded-3xl px-6 sm:px-10 lg:px-14 my-20 md:mx-10 shadow-xl overflow-hidden'>
      {/* Left Side */}
      <div className='flex-1 py-10 sm:py-12 md:py-16 lg:py-20 lg:pl-5'>
        <div className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight'>
          <p>{t('bookHealthcareAppt')}</p>
          <p className='mt-3 text-emerald-200'>{t('withTrustedDoctors')}</p>
        </div>
        <p className='text-white/90 text-base sm:text-lg mt-4 max-w-lg'>
          {t('joinThousands')}
        </p>
        <button
          onClick={() => {
            navigate('/login')
            scrollTo(0, 0)
          }}
          className='bg-white text-base font-bold text-primary px-10 py-4 rounded-full mt-7 hover:scale-105 transition-all shadow-lg active:scale-95'
        >
          {t('createFreeAccount')}
        </button>
      </div>
      {/* Right Side */}
      <div className='hidden md:block md:w-1/2 lg:w-[370px] relative'>
        <img
          className='w-full absolute bottom-0 right-0 max-w-md drop-shadow-xl'
          src={assets.appointment_img}
          alt='Medical Doctor'
        />
      </div>
    </div>
  )
}

export default Banner
