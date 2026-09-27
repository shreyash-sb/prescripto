import { useContext, useState } from 'react'
import { assets } from '../assets/assets.js'
import { NavLink, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'
import UserIdentity from './UserIdentity.jsx'
import EmergencySOSModal from './EmergencySOSModal.jsx'
import SymptomTriageModal from './SymptomTriageModal.jsx'

const Navbar = () => {
  const [showSidePanel, setShowSidePanel] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showSOSModal, setShowSOSModal] = useState(false)
  const [showTriageModal, setShowTriageModal] = useState(false)

  const { token, setToken, userData, t } = useContext(AppContext)
  const navigate = useNavigate()

  const logOut = () => {
    setToken(false)
    localStorage.removeItem('token')
    setShowSidePanel(false)
    setShowMobileMenu(false)
    navigate('/')
  }

  const navigateAndClose = (path) => {
    navigate(path)
    setShowSidePanel(false)
    setShowMobileMenu(false)
  }

  return (
    <>
      <EmergencySOSModal isOpen={showSOSModal} onClose={() => setShowSOSModal(false)} />
      <SymptomTriageModal isOpen={showTriageModal} onClose={() => setShowTriageModal(false)} />

      {/* Main Top Navigation Bar (Clean, uncluttered, authentic Prescripto design) */}
      <nav className='sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 py-3.5 mb-6 transition-all'>
        <div className='flex items-center justify-between'>
          {/* Brand Logo */}
          <div className='flex items-center gap-4'>
            <img
              onClick={() => navigate('/')}
              className='w-36 sm:w-44 cursor-pointer hover:opacity-90 transition-opacity'
              src={assets.logo}
              alt='Prescripto Logo'
            />
          </div>

          {/* Clean Primary Navigation Links (Only standard 4 links) */}
          <ul className='hidden md:flex items-center gap-7 font-semibold text-sm text-gray-700'>
            <NavLink
              to='/'
              className={({ isActive }) =>
                `py-1 border-b-2 transition-all ${
                  isActive ? 'text-primary border-primary font-bold' : 'border-transparent hover:text-primary'
                }`
              }
            >
              <li>{t('home')}</li>
            </NavLink>

            <NavLink
              to='/doctors'
              className={({ isActive }) =>
                `py-1 border-b-2 transition-all ${
                  isActive ? 'text-primary border-primary font-bold' : 'border-transparent hover:text-primary'
                }`
              }
            >
              <li>{t('findDoctors')}</li>
            </NavLink>

            <NavLink
              to='/about'
              className={({ isActive }) =>
                `py-1 border-b-2 transition-all ${
                  isActive ? 'text-primary border-primary font-bold' : 'border-transparent hover:text-primary'
                }`
              }
            >
              <li>{t('about')}</li>
            </NavLink>

            <NavLink
              to='/contact'
              className={({ isActive }) =>
                `py-1 border-b-2 transition-all ${
                  isActive ? 'text-primary border-primary font-bold' : 'border-transparent hover:text-primary'
                }`
              }
            >
              <li>{t('contact')}</li>
            </NavLink>
          </ul>

          {/* Right Action Items */}
          <div className='flex items-center gap-2 sm:gap-3'>
            {/* Emergency SOS Button */}
            <button
              onClick={() => setShowSOSModal(true)}
              className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-all shadow-sm'
              title='Emergency SOS Helplines'
            >
              <span>🚨</span> <span className='hidden sm:inline'>{t('emergencySOS')}</span>
            </button>

            {/* Patient Account Button or Login Button */}
            {token ? (
              <button
                onClick={() => setShowSidePanel(true)}
                className='flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 rounded-full border border-indigo-100 bg-indigo-50/70 hover:bg-indigo-100 text-gray-800 transition-all shadow-sm group'
                title='Open Patient Health Hub & Features'
              >
                <UserIdentity name={userData?.name || 'Patient'} className='w-7 h-7 text-xs' />
                <div className='hidden sm:flex flex-col text-left leading-tight'>
                  <span className='text-xs font-bold text-gray-900 max-w-[100px] truncate'>
                    {userData?.name ? userData.name.split(' ')[0] : 'Account'}
                  </span>
                  <span className='text-[10px] text-primary font-semibold flex items-center gap-0.5'>
                    Health Hub ▾
                  </span>
                </div>
                <span className='sm:hidden text-xs font-bold text-primary'>Account ▾</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className='bg-primary text-white px-5 sm:px-7 py-2 rounded-full text-xs sm:text-sm font-bold hover:bg-opacity-95 active:scale-95 transition-all shadow-md'
              >
                {t('signInRegister')}
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setShowMobileMenu(true)}
              className='p-2 rounded-lg border border-gray-200 md:hidden text-gray-700 hover:bg-gray-50'
              aria-label='Toggle menu'
            >
              <img src={assets.menu_icon} className='w-4.5' alt='Menu' />
            </button>
          </div>
        </div>
      </nav>

      {/* ============================================================ */}
      {/* PATIENT ACCOUNT SIDE PANEL (SLIDE-OVER DRAWER)              */}
      {/* ============================================================ */}
      {showSidePanel && (
        <div className='fixed inset-0 z-50 overflow-hidden'>
          {/* Backdrop Overlay */}
          <div
            className='fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-fadeIn'
            onClick={() => setShowSidePanel(false)}
          />

          <div className='fixed inset-y-0 right-0 max-w-full flex pl-10'>
            <div className='w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between overflow-hidden border-l border-gray-100 animate-slideInRight'>
              {/* Panel Header */}
              <div className='p-5 border-b border-gray-100 bg-gradient-to-br from-indigo-50/60 via-white to-sky-50/40'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center gap-2'>
                    <span className='w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse'></span>
                    <h2 className='text-sm font-black uppercase tracking-wider text-gray-600'>
                      Patient Health Hub
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowSidePanel(false)}
                    className='w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-all'
                  >
                    ✕
                  </button>
                </div>

                {/* Patient Profile Card */}
                <div className='flex items-center gap-3.5 bg-white p-3.5 rounded-2xl border border-indigo-100/80 shadow-sm'>
                  <UserIdentity name={userData?.name || 'Patient'} className='w-13 h-13 text-base shadow' />
                  <div className='flex-1 min-w-0'>
                    <h3 className='font-bold text-gray-900 text-sm truncate'>{userData?.name || 'Demo Patient'}</h3>
                    <p className='text-xs text-gray-500 truncate'>{userData?.email || 'patient@example.com'}</p>
                    <div className='mt-1.5 flex flex-wrap items-center gap-1.5'>
                      <span className='inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md'>
                        💰 Wallet: ${userData?.walletBalance || 0}
                      </span>
                      {userData?.bloodGroup && (
                        <span className='inline-flex items-center text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded-md'>
                          🩸 {userData.bloodGroup}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Drug Allergies Alert in Side Panel if recorded */}
                {userData?.allergies && userData.allergies.length > 0 && (
                  <div className='mt-2.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] font-semibold flex items-center gap-1.5'>
                    <span>⚠️</span>
                    <span className='truncate'>Allergies: {userData.allergies.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Panel Menu Items (Clean vertical alignment with icons & descriptions) */}
              <div className='flex-1 overflow-y-auto p-4 space-y-1.5 divide-y divide-gray-50'>
                {/* Section 1: Core Patient Navigation */}
                <div className='space-y-1 pb-2'>
                  <p className='text-[10px] font-extrabold uppercase tracking-wider text-gray-400 px-3 pt-1'>
                    My Health & Consultations
                  </p>

                  <button
                    onClick={() => navigateAndClose('/profile')}
                    className='w-full text-left p-3 rounded-2xl hover:bg-indigo-50/80 transition-all flex items-center gap-3.5 group'
                  >
                    <div className='w-10 h-10 rounded-xl bg-indigo-100/70 text-primary flex items-center justify-center text-lg group-hover:scale-105 transition-transform'>
                      👤
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='font-bold text-gray-900 text-xs group-hover:text-primary transition-colors'>
                        {t('myProfile')}
                      </p>
                      <p className='text-[11px] text-gray-500 truncate'>
                        Personal data, allergy shield & emergency contacts
                      </p>
                    </div>
                    <span className='text-gray-300 group-hover:text-primary transition-colors text-xs'>→</span>
                  </button>

                  <button
                    onClick={() => navigateAndClose('/my-appointments')}
                    className='w-full text-left p-3 rounded-2xl hover:bg-indigo-50/80 transition-all flex items-center gap-3.5 group'
                  >
                    <div className='w-10 h-10 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center text-lg group-hover:scale-105 transition-transform'>
                      📅
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='font-bold text-gray-900 text-xs group-hover:text-primary transition-colors'>
                        {t('myAppointments')}
                      </p>
                      <p className='text-[11px] text-gray-500 truncate'>
                        Track live queue tokens & instant refund receipts
                      </p>
                    </div>
                    <span className='text-gray-300 group-hover:text-primary transition-colors text-xs'>→</span>
                  </button>

                  <button
                    onClick={() => navigateAndClose('/medicine-schedule')}
                    className='w-full text-left p-3 rounded-2xl hover:bg-indigo-50/80 transition-all flex items-center gap-3.5 group'
                  >
                    <div className='w-10 h-10 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center text-lg group-hover:scale-105 transition-transform'>
                      💊
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='font-bold text-gray-900 text-xs group-hover:text-primary transition-colors'>
                        {t('medicineSchedule')}
                      </p>
                      <p className='text-[11px] text-gray-500 truncate'>
                        Prescription auto-sync & daily morning/night timeline
                      </p>
                    </div>
                    <span className='text-gray-300 group-hover:text-primary transition-colors text-xs'>→</span>
                  </button>

                  <button
                    onClick={() => navigateAndClose('/follow-ups')}
                    className='w-full text-left p-3 rounded-2xl hover:bg-indigo-50/80 transition-all flex items-center gap-3.5 group'
                  >
                    <div className='w-10 h-10 rounded-xl bg-purple-100/70 text-purple-700 flex items-center justify-center text-lg group-hover:scale-105 transition-transform'>
                      🔄
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='font-bold text-gray-900 text-xs group-hover:text-primary transition-colors'>
                        {t('followUpManager')}
                      </p>
                      <p className='text-[11px] text-gray-500 truncate'>
                        7-day recovery check-ins & post-consultation tracking
                      </p>
                    </div>
                    <span className='text-gray-300 group-hover:text-primary transition-colors text-xs'>→</span>
                  </button>
                </div>

                {/* Section 2: Smart Clinical Tools & Privacy */}
                <div className='space-y-1 pt-2.5 pb-2'>
                  <p className='text-[10px] font-extrabold uppercase tracking-wider text-gray-400 px-3 pt-1'>
                    Smart Health Tools & Privacy
                  </p>

                  <button
                    onClick={() => {
                      setShowSidePanel(false)
                      setShowTriageModal(true)
                    }}
                    className='w-full text-left p-3 rounded-2xl hover:bg-indigo-50/80 transition-all flex items-center gap-3.5 group'
                  >
                    <div className='w-10 h-10 rounded-xl bg-amber-100/70 text-amber-700 flex items-center justify-center text-lg group-hover:scale-105 transition-transform'>
                      🤖
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='font-bold text-gray-900 text-xs group-hover:text-primary transition-colors'>
                        {t('aiSymptomChecker')}
                      </p>
                      <p className='text-[11px] text-gray-500 truncate'>
                        Instant symptom triage & specialist finder
                      </p>
                    </div>
                    <span className='text-gray-300 group-hover:text-primary transition-colors text-xs'>→</span>
                  </button>

                  <button
                    onClick={() => navigateAndClose('/privacy-logs')}
                    className='w-full text-left p-3 rounded-2xl hover:bg-indigo-50/80 transition-all flex items-center gap-3.5 group'
                  >
                    <div className='w-10 h-10 rounded-xl bg-teal-100/70 text-teal-700 flex items-center justify-center text-lg group-hover:scale-105 transition-transform'>
                      🛡️
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='font-bold text-gray-900 text-xs group-hover:text-primary transition-colors'>
                        {t('privacyLogs')}
                      </p>
                      <p className='text-[11px] text-gray-500 truncate'>
                        HIPAA audit: see who accessed records and when
                      </p>
                    </div>
                    <span className='text-gray-300 group-hover:text-primary transition-colors text-xs'>→</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowSidePanel(false)
                      setShowSOSModal(true)
                    }}
                    className='w-full text-left p-3 rounded-2xl hover:bg-rose-50 transition-all flex items-center gap-3.5 group'
                  >
                    <div className='w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center text-lg group-hover:scale-105 transition-transform'>
                      🚨
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='font-bold text-rose-700 text-xs'>
                        {t('emergencySOS')}
                      </p>
                      <p className='text-[11px] text-rose-500 truncate'>
                        Ambulance, hospital emergency line & poisons hotline
                      </p>
                    </div>
                    <span className='text-rose-400 text-xs'>→</span>
                  </button>
                </div>
              </div>

              {/* Panel Footer */}
              <div className='p-4 border-t border-gray-100 bg-gray-50/70 space-y-2'>
                <a
                  href='http://localhost:5174'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-full py-2 px-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all flex items-center justify-center gap-2'
                >
                  <span>🏥 Hospital Doctor & Admin Portal ↗</span>
                </a>

                <button
                  onClick={logOut}
                  className='w-full py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center justify-center gap-2'
                >
                  <span>🚪</span> {t('logout')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MOBILE GENERAL NAVIGATION DRAWER                             */}
      {/* ============================================================ */}
      {showMobileMenu && (
        <div className='fixed inset-0 z-50 md:hidden bg-slate-900/40 backdrop-blur-sm'>
          <div className='fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-2xl flex flex-col justify-between overflow-y-auto'>
            {/* Header */}
            <div className='flex items-center justify-between p-4 border-b'>
              <img src={assets.logo} alt='Prescripto' className='w-32' />
              <button
                onClick={() => setShowMobileMenu(false)}
                className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500'
              >
                ✕
              </button>
            </div>

            {/* SOS Emergency Link */}
            <div className='p-4 border-b flex items-center justify-end bg-gray-50/70'>
              <button
                onClick={() => {
                  setShowMobileMenu(false)
                  setShowSOSModal(true)
                }}
                className='px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-full flex items-center gap-1'
              >
                <span>🚨</span> Emergency SOS
              </button>
            </div>

            {/* Links */}
            <div className='flex-1 p-4 space-y-1 text-sm font-bold text-gray-700'>
              <NavLink
                to='/'
                onClick={() => setShowMobileMenu(false)}
                className='block py-2.5 px-3 rounded-xl hover:bg-gray-100'
              >
                🏠 {t('home')}
              </NavLink>

              <NavLink
                to='/doctors'
                onClick={() => setShowMobileMenu(false)}
                className='block py-2.5 px-3 rounded-xl hover:bg-gray-100'
              >
                👨‍⚕️ {t('findDoctors')}
              </NavLink>

              <NavLink
                to='/about'
                onClick={() => setShowMobileMenu(false)}
                className='block py-2.5 px-3 rounded-xl hover:bg-gray-100'
              >
                ℹ️ {t('about')}
              </NavLink>

              <NavLink
                to='/contact'
                onClick={() => setShowMobileMenu(false)}
                className='block py-2.5 px-3 rounded-xl hover:bg-gray-100'
              >
                📞 {t('contact')}
              </NavLink>

              {token && (
                <>
                  <div className='border-t border-gray-100 my-2 pt-2'>
                    <p className='text-[10px] font-extrabold uppercase text-gray-400 px-3 mb-1'>
                      Patient Features
                    </p>
                    <NavLink
                      to='/profile'
                      onClick={() => setShowMobileMenu(false)}
                      className='block py-2 px-3 rounded-xl hover:bg-indigo-50 text-xs'
                    >
                      👤 {t('myProfile')}
                    </NavLink>
                    <NavLink
                      to='/my-appointments'
                      onClick={() => setShowMobileMenu(false)}
                      className='block py-2 px-3 rounded-xl hover:bg-indigo-50 text-xs'
                    >
                      📅 {t('myAppointments')}
                    </NavLink>
                    <NavLink
                      to='/medicine-schedule'
                      onClick={() => setShowMobileMenu(false)}
                      className='block py-2 px-3 rounded-xl hover:bg-indigo-50 text-xs'
                    >
                      💊 {t('medicineSchedule')}
                    </NavLink>
                    <NavLink
                      to='/follow-ups'
                      onClick={() => setShowMobileMenu(false)}
                      className='block py-2 px-3 rounded-xl hover:bg-indigo-50 text-xs'
                    >
                      🔄 {t('followUpManager')}
                    </NavLink>
                    <NavLink
                      to='/privacy-logs'
                      onClick={() => setShowMobileMenu(false)}
                      className='block py-2 px-3 rounded-xl hover:bg-indigo-50 text-xs'
                    >
                      🛡️ {t('privacyLogs')}
                    </NavLink>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className='p-4 border-t bg-gray-50'>
              {token ? (
                <button
                  onClick={logOut}
                  className='w-full py-2.5 bg-rose-50 text-rose-700 font-bold text-xs rounded-xl hover:bg-rose-100'
                >
                  🚪 {t('logout')}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowMobileMenu(false)
                    navigate('/login')
                  }}
                  className='w-full py-2.5 bg-primary text-white font-bold text-xs rounded-xl shadow'
                >
                  {t('signInRegister')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
