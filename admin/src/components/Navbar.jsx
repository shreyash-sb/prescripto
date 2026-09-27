import { useContext } from 'react'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import { useNavigate } from 'react-router-dom'
import { DoctorContext } from '../context/DoctorContext'

const Navbar = () => {
  const { aToken, setAToken } = useContext(AdminContext)
  const { dToken, setDToken } = useContext(DoctorContext)
  const navigate = useNavigate()

  const logOut = () => {
    navigate('/')
    if (aToken) {
      setAToken('')
      localStorage.removeItem('aToken')
    }
    if (dToken) {
      setDToken('')
      localStorage.removeItem('dToken')
    }
  }

  return (
    <header className='sticky top-0 z-30 flex justify-between items-center px-4 sm:px-8 py-3.5 border-b border-gray-200/80 bg-white shadow-xs backdrop-blur-md'>
      <div className='flex items-center gap-3'>
        <img
          src={assets.admin_logo}
          alt='Prescripto Logo'
          onClick={() => navigate(aToken ? '/admin-dashboard' : '/doctor-dashboard')}
          className='w-32 sm:w-36 cursor-pointer hover:opacity-90 transition-opacity'
        />
        <span className='border border-indigo-200 bg-indigo-50/80 text-primary px-2.5 py-0.5 rounded-full text-xs font-bold'>
          {aToken ? 'Admin Portal' : 'Doctor Portal'}
        </span>
      </div>

      <div className='flex items-center gap-3'>
        <button
          type='button'
          onClick={logOut}
          className='bg-primary hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold px-6 sm:px-8 py-2 rounded-full transition-all shadow-sm active:scale-95'
        >
          Logout
        </button>
      </div>
    </header>
  )
}

export default Navbar
