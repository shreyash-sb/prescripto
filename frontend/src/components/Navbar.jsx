import { useContext, useState } from 'react'
import { assets } from '../assets/assets.js'
import { NavLink, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'
import UserIdentity from './UserIdentity.jsx'

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false)
  const { token, setToken, userData } = useContext(AppContext)
  const navigate = useNavigate()

  const logOut = () => {
    setToken(false)
    localStorage.removeItem('token')
    navigate('/')
  }

  return (
    <nav className='sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100/90 py-3.5 mb-6 transition-all'>
      <div className='flex items-center justify-between'>
        {/* Brand Logo */}
        <div className='flex items-center gap-6'>
          <img
            onClick={() => navigate('/')}
            className='w-36 sm:w-40 cursor-pointer hover:opacity-90 transition-opacity'
            src={assets.logo}
            alt='Prescripto Logo'
          />
        </div>

        {/* Desktop Navigation Links */}
        <ul className='hidden md:flex items-center gap-8 font-medium text-base text-gray-700'>
          <NavLink
            to='/'
            className={({ isActive }) =>
              `py-1 transition-colors hover:text-primary ${isActive ? 'text-primary font-semibold' : ''}`
            }
          >
            <li>Home</li>
            <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
          </NavLink>

          <NavLink
            to='/doctors'
            className={({ isActive }) =>
              `py-1 transition-colors hover:text-primary ${isActive ? 'text-primary font-semibold' : ''}`
            }
          >
            <li>Find Doctors</li>
            <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
          </NavLink>

          <NavLink
            to='/about'
            className={({ isActive }) =>
              `py-1 transition-colors hover:text-primary ${isActive ? 'text-primary font-semibold' : ''}`
            }
          >
            <li>About</li>
            <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
          </NavLink>

          <NavLink
            to='/contact'
            className={({ isActive }) =>
              `py-1 transition-colors hover:text-primary ${isActive ? 'text-primary font-semibold' : ''}`
            }
          >
            <li>Contact</li>
            <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
          </NavLink>
        </ul>

        {/* Right Action Items */}
        <div className='flex items-center gap-3 sm:gap-4'>
          {/* Quick Admin Portal Switcher */}
          <a
            href='http://localhost:5174'
            target='_blank'
            rel='noopener noreferrer'
            className='hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-indigo-200 bg-indigo-50/70 text-primary text-sm font-semibold hover:bg-indigo-100 transition-all'
            title='Open Admin & Doctor Management Portal'
          >
            <span>🛡️ Doctor/Admin Portal ↗</span>
          </a>

          {token ? (
            <div className='flex items-center gap-2 cursor-pointer group relative'>
              <UserIdentity name={userData?.name || 'User'} className='w-10 h-10 text-base' />
              <img src={assets.dropdown_icon} className='w-3 opacity-60 group-hover:opacity-100' alt='' />

              {/* Profile Dropdown Menu */}
              <div className='absolute top-0 right-0 pt-12 text-base font-medium text-gray-700 z-50 opacity-0 invisible transform translate-y-2 transition-all duration-200 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0'>
                <div className='min-w-60 bg-white rounded-2xl shadow-xl border border-gray-100 p-2.5 flex flex-col gap-1'>
                  <div className='px-3.5 py-2.5 border-b border-gray-100 mb-1'>
                    <p className='font-bold text-gray-900 text-base truncate'>{userData?.name || 'Patient'}</p>
                    <p className='text-xs text-gray-500 truncate'>{userData?.email}</p>
                  </div>
                  <button
                    onClick={() => navigate('/profile')}
                    className='text-left px-3.5 py-2.5 rounded-xl hover:bg-indigo-50 hover:text-primary transition-colors flex items-center gap-2.5 text-sm font-medium'
                  >
                    <span>👤</span> My Profile
                  </button>
                  <button
                    onClick={() => navigate('/my-appointments')}
                    className='text-left px-3.5 py-2.5 rounded-xl hover:bg-indigo-50 hover:text-primary transition-colors flex items-center gap-2.5 text-sm font-medium'
                  >
                    <span>📅</span> My Appointments
                  </button>
                  <div className='border-t border-gray-100 my-1'></div>
                  <button
                    onClick={logOut}
                    className='text-left px-3.5 py-2.5 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors flex items-center gap-2.5 text-sm font-medium'
                  >
                    <span>🚪</span> Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className='bg-primary text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-semibold hover:bg-opacity-95 active:scale-95 transition-all shadow-md'
            >
              Sign In / Register
            </button>
          )}

          {/* Mobile hamburger icon */}
          <button
            onClick={() => setShowMenu(true)}
            className='p-1.5 rounded-lg border border-gray-200 md:hidden text-gray-700 hover:bg-gray-50'
            aria-label='Toggle mobile menu'
          >
            <img src={assets.menu_icon} className='w-5' alt='Menu' />
          </button>

          {/* Mobile slide-in Drawer */}
          <div
            className={`${
              showMenu ? 'fixed inset-0 w-full h-full' : 'h-0 w-0 pointer-events-none'
            } md:hidden right-0 top-0 bottom-0 z-50 overflow-hidden bg-white/98 backdrop-blur-xl transition-all duration-300`}
          >
            <div className='flex items-center justify-between px-6 py-5 border-b'>
              <img src={assets.logo} alt='Prescripto' className='w-32' />
              <button onClick={() => setShowMenu(false)} className='p-2 rounded-full hover:bg-gray-100'>
                <img src={assets.cross_icon} className='w-5' alt='Close' />
              </button>
            </div>
            <ul className='flex flex-col items-center gap-3 mt-8 px-6 text-base font-medium text-gray-800'>
              <NavLink onClick={() => setShowMenu(false)} to='/' className='w-full text-center'>
                <p className='py-3 rounded-xl hover:bg-gray-100'>Home</p>
              </NavLink>
              <NavLink onClick={() => setShowMenu(false)} to='/doctors' className='w-full text-center'>
                <p className='py-3 rounded-xl hover:bg-gray-100'>Find Doctors</p>
              </NavLink>
              <NavLink onClick={() => setShowMenu(false)} to='/about' className='w-full text-center'>
                <p className='py-3 rounded-xl hover:bg-gray-100'>About Us</p>
              </NavLink>
              <NavLink onClick={() => setShowMenu(false)} to='/contact' className='w-full text-center'>
                <p className='py-3 rounded-xl hover:bg-gray-100'>Contact Support</p>
              </NavLink>
              {token ? (
                <>
                  <NavLink onClick={() => setShowMenu(false)} to='/my-appointments' className='w-full text-center'>
                    <p className='py-3 rounded-xl bg-indigo-50 text-primary font-semibold'>My Appointments</p>
                  </NavLink>
                  <NavLink onClick={() => setShowMenu(false)} to='/profile' className='w-full text-center'>
                    <p className='py-3 rounded-xl hover:bg-gray-100'>My Profile</p>
                  </NavLink>
                  <button
                    onClick={() => {
                      logOut()
                      setShowMenu(false)
                    }}
                    className='w-full py-3 rounded-xl text-rose-600 font-semibold'
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    navigate('/login')
                    setShowMenu(false)
                  }}
                  className='w-full py-3 mt-4 bg-primary text-white rounded-full font-semibold shadow-md'
                >
                  Sign In / Register
                </button>
              )}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
