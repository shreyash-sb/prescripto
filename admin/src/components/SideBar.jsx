import { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { AdminContext } from '../context/AdminContext'
import { assets } from '../assets/assets'
import { DoctorContext } from '../context/DoctorContext'

const SideBar = () => {
  const { aToken } = useContext(AdminContext)
  const { dToken, profileData } = useContext(DoctorContext)

  return (
    <aside className='w-56 sm:w-64 bg-white border-r border-gray-200/80 flex-shrink-0 sticky top-[61px] h-[calc(100vh-61px)] p-4 flex flex-col justify-between select-none shadow-xs overflow-y-auto z-20'>
      {/* Navigation Sections */}
      <div className='space-y-4'>
        {/* Role Identity Badge */}
        {aToken && (
          <div className='bg-indigo-50/80 border border-indigo-100 rounded-2xl p-3 flex items-center gap-3'>
            <div className='w-9 h-9 rounded-xl bg-[#5F6FFF] text-white flex items-center justify-center text-base font-bold shadow-sm flex-shrink-0'>
              🛡️
            </div>
            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-1.5'>
                <span className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse'></span>
                <p className='text-xs font-bold text-gray-900 truncate'>Hospital Admin</p>
              </div>
              <p className='text-[11px] text-gray-500 truncate'>Management Console</p>
            </div>
          </div>
        )}

        {dToken && (
          <div className='bg-emerald-50/80 border border-emerald-100 rounded-2xl p-3 flex items-center gap-3'>
            <div className='w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-base font-bold shadow-sm flex-shrink-0'>
              👨‍⚕️
            </div>
            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-1.5'>
                <span className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse'></span>
                <p className='text-xs font-bold text-gray-900 truncate'>{profileData?.name || 'Doctor Portal'}</p>
              </div>
              <p className='text-[11px] text-emerald-700 font-semibold truncate'>{profileData?.speciality || 'OPD Doctor'}</p>
            </div>
          </div>
        )}

        {/* Admin Navigation Menu */}
        {aToken && (
          <div className='space-y-1.5'>
            <p className='text-[10px] font-extrabold uppercase tracking-wider text-gray-400 px-3 pb-1'>
              Management
            </p>
            <nav className='space-y-1.5'>
              <NavLink
                to='/admin-dashboard'
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                    isActive
                      ? 'bg-[#5F6FFF] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <img
                      src={assets.home_icon}
                      alt=''
                      className={`w-4.5 h-4.5 transition-all ${isActive ? 'brightness-0 invert' : 'opacity-70'}`}
                    />
                    <span className={`block font-bold ${isActive ? 'text-white' : 'text-gray-700'}`}>Dashboard</span>
                  </>
                )}
              </NavLink>

              <NavLink
                to='/all-appointments'
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                    isActive
                      ? 'bg-[#5F6FFF] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <img
                      src={assets.appointment_icon}
                      alt=''
                      className={`w-4.5 h-4.5 transition-all ${isActive ? 'brightness-0 invert' : 'opacity-70'}`}
                    />
                    <span className={`block font-bold ${isActive ? 'text-white' : 'text-gray-700'}`}>Appointments</span>
                  </>
                )}
              </NavLink>

              <NavLink
                to='/add-doctor'
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                    isActive
                      ? 'bg-[#5F6FFF] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <img
                      src={assets.add_icon}
                      alt=''
                      className={`w-4.5 h-4.5 transition-all ${isActive ? 'brightness-0 invert' : 'opacity-70'}`}
                    />
                    <span className={`block font-bold ${isActive ? 'text-white' : 'text-gray-700'}`}>Add Doctor</span>
                  </>
                )}
              </NavLink>

              <NavLink
                to='/doctor-list'
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                    isActive
                      ? 'bg-[#5F6FFF] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <img
                      src={assets.people_icon}
                      alt=''
                      className={`w-4.5 h-4.5 transition-all ${isActive ? 'brightness-0 invert' : 'opacity-70'}`}
                    />
                    <span className={`block font-bold ${isActive ? 'text-white' : 'text-gray-700'}`}>Doctors List</span>
                  </>
                )}
              </NavLink>

              <NavLink
                to='/admin-knowledge'
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                    isActive
                      ? 'bg-[#5F6FFF] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className='text-base leading-none'>🧠</span>
                    <span className={`block font-bold ${isActive ? 'text-white' : 'text-gray-700'}`}>Operations Q&A</span>
                  </>
                )}
              </NavLink>
            </nav>
          </div>
        )}

        {/* Doctor Navigation Menu */}
        {dToken && (
          <div className='space-y-1.5'>
            <p className='text-[10px] font-extrabold uppercase tracking-wider text-gray-400 px-3 pb-1'>
              Doctor Workspace
            </p>
            <nav className='space-y-1.5'>
              <NavLink
                to='/doctor-dashboard'
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                    isActive
                      ? 'bg-[#5F6FFF] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <img
                      src={assets.home_icon}
                      alt=''
                      className={`w-4.5 h-4.5 transition-all ${isActive ? 'brightness-0 invert' : 'opacity-70'}`}
                    />
                    <span className={`block font-bold ${isActive ? 'text-white' : 'text-gray-700'}`}>Dashboard</span>
                  </>
                )}
              </NavLink>

              <NavLink
                to='/doctor-appointments'
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                    isActive
                      ? 'bg-[#5F6FFF] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <img
                      src={assets.appointment_icon}
                      alt=''
                      className={`w-4.5 h-4.5 transition-all ${isActive ? 'brightness-0 invert' : 'opacity-70'}`}
                    />
                    <span className={`block font-bold ${isActive ? 'text-white' : 'text-gray-700'}`}>Appointments</span>
                  </>
                )}
              </NavLink>

              <NavLink
                to='/doctor-profile'
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                    isActive
                      ? 'bg-[#5F6FFF] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <img
                      src={assets.people_icon}
                      alt=''
                      className={`w-4.5 h-4.5 transition-all ${isActive ? 'brightness-0 invert' : 'opacity-70'}`}
                    />
                    <span className={`block font-bold ${isActive ? 'text-white' : 'text-gray-700'}`}>Profile</span>
                  </>
                )}
              </NavLink>
            </nav>
          </div>
        )}
      </div>

      {/* Patient Portal Link */}
      <div className='pt-3 border-t border-gray-100'>
        <a
          href='https://prescripto-frontend-ten-theta.vercel.app'
          target='_blank'
          rel='noopener noreferrer'
          className='w-full py-2.5 px-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs'
        >
          <span>🌐 Patient Portal ↗</span>
        </a>
      </div>
    </aside>
  )
}

export default SideBar
