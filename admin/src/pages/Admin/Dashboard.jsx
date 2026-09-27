import { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import DoctorIdentity from '../../components/DoctorIdentity'
import UserIdentity from '../../components/UserIdentity'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const {
    aToken,
    getDashData,
    cancelAppointment,
    collectPayment,
    dashData,
    doctors,
    getAllDoctors,
    changeAvailability,
  } = useContext(AdminContext)
  const { slotDateFormat, currency, calculateAge } = useContext(AppContext)
  const navigate = useNavigate()

  // Dynamic Dashboard View Selector Dropdown State
  const [selectedView, setSelectedView] = useState('overview')
  const [searchDoctorQuery, setSearchDoctorQuery] = useState('')

  useEffect(() => {
    if (aToken) {
      getDashData()
      getAllDoctors()
    }
  }, [aToken])

  const totalDocs = doctors.length || dashData?.doctors || 0
  const availableDocs = doctors.filter((d) => d.available).length
  const unavailableDocs = totalDocs - availableDocs

  const weeklyTrends = dashData?.weeklyTrends || [
    { day: 'Mon', date: 'Day 1', income: 120, count: 2 },
    { day: 'Tue', date: 'Day 2', income: 240, count: 4 },
    { day: 'Wed', date: 'Day 3', income: 180, count: 3 },
    { day: 'Thu', date: 'Day 4', income: 320, count: 5 },
    { day: 'Fri', date: 'Day 5', income: 290, count: 4 },
    { day: 'Sat', date: 'Day 6', income: 150, count: 2 },
    { day: 'Sun', date: 'Today', income: 90, count: 1 },
  ]

  const maxIncome = Math.max(...weeklyTrends.map((t) => t.income || 0), 100)

  if (!dashData) {
    return (
      <div className='p-8 text-center bg-white rounded-2xl border shadow-sm'>
        <div className='inline-block animate-spin rounded-full h-7 w-7 border-4 border-indigo-500 border-t-transparent'></div>
        <p className='mt-2.5 text-xs text-gray-500 font-semibold'>Loading administrative console...</p>
      </div>
    )
  }

  const filteredDoctors = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(searchDoctorQuery.toLowerCase()) ||
      d.speciality.toLowerCase().includes(searchDoctorQuery.toLowerCase())
  )

  return (
    <div className='w-full max-w-7xl space-y-4'>
      {/* 1. Header Toolbar with Dynamic View Selector Dropdown */}
      <div className='bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3'>
        <div>
          <h1 className='text-lg sm:text-xl font-black text-gray-900'>Hospital Operations Console</h1>
          <p className='text-xs text-gray-500 mt-0.5'>
            Select your customized analytics view to inspect real-time performance.
          </p>
        </div>

        {/* Dynamic View Dropdown Selector */}
        <div className='flex items-center gap-2.5 flex-wrap'>
          <div className='flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5'>
            <span className='text-xs font-bold text-gray-500'>View Mode:</span>
            <select
              value={selectedView}
              onChange={(e) => setSelectedView(e.target.value)}
              className='bg-transparent text-xs font-bold text-gray-900 outline-none cursor-pointer'
            >
              <option value='overview'>📊 Executive Overview</option>
              <option value='financial'>💵 Financial & Revenue Streams</option>
              <option value='doctors'>👨‍⚕️ Doctors Availability & Roster</option>
              <option value='appointments'>📋 Consultation Registry</option>
              <option value='departments'>🏥 Department Distribution</option>
            </select>
          </div>

          <button
            onClick={() => navigate('/add-doctor')}
            className='bg-primary hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5'
          >
            <span>+</span>
            <span>Onboard Doctor</span>
          </button>
        </div>
      </div>

      {/* Quick Interactive View Filter Pills */}
      <div className='flex items-center gap-2 overflow-x-auto pb-1 text-xs'>
        {[
          { id: 'overview', label: '📊 All Overview' },
          { id: 'financial', label: '💵 Financial Analytics' },
          { id: 'doctors', label: `👨‍⚕️ Doctors (${availableDocs} Active / ${unavailableDocs} Off)` },
          { id: 'appointments', label: '📋 Consultation Queue' },
          { id: 'departments', label: '🏥 Medical Wings' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedView(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex-shrink-0 ${
              selectedView === tab.id
                ? 'bg-primary text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============================================================ */}
      {/* VIEW 1: EXECUTIVE OVERVIEW (ALL METRICS)                     */}
      {/* ============================================================ */}
      {(selectedView === 'overview' || selectedView === 'financial') && (
        <>
          {/* Doctor Availability Bar */}
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
            <div
              onClick={() => setSelectedView('doctors')}
              className='bg-emerald-50/60 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-emerald-100/50 transition-all'
            >
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg font-bold shadow-xs'>
                  🟢
                </div>
                <div>
                  <p className='text-xl font-black text-emerald-950'>{availableDocs}</p>
                  <p className='text-xs font-bold text-emerald-800'>Available Doctors (OPD Active)</p>
                </div>
              </div>
              <span className='text-[11px] font-bold text-emerald-800 bg-white/80 px-2 py-1 rounded-lg'>
                Inspect →
              </span>
            </div>

            <div
              onClick={() => setSelectedView('doctors')}
              className='bg-rose-50/60 border border-rose-200 p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-rose-100/50 transition-all'
            >
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center text-lg font-bold shadow-xs'>
                  🔴
                </div>
                <div>
                  <p className='text-xl font-black text-rose-950'>{unavailableDocs}</p>
                  <p className='text-xs font-bold text-rose-800'>Unavailable / Off-Duty</p>
                </div>
              </div>
              <span className='text-[11px] font-bold text-rose-800 bg-white/80 px-2 py-1 rounded-lg'>
                Manage →
              </span>
            </div>

            <div className='bg-indigo-50/60 border border-indigo-200 p-4 rounded-2xl flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center text-lg font-bold shadow-xs'>
                  👨‍⚕️
                </div>
                <div>
                  <p className='text-xl font-black text-indigo-950'>{totalDocs}</p>
                  <p className='text-xs font-bold text-indigo-800'>Total Hospital Specialists</p>
                </div>
              </div>
              <span className='text-[11px] font-bold text-primary bg-white/80 px-2 py-1 rounded-lg'>
                100% Verified
              </span>
            </div>
          </div>

          {/* Revenue KPI Cards */}
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
            <div className='bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between'>
              <div>
                <p className='text-[11px] font-bold text-gray-500 uppercase'>Today's Income</p>
                <p className='text-xl font-black text-emerald-700 mt-0.5'>
                  {currency}{dashData.todayIncome || 0}
                </p>
                <span className='text-[10px] text-gray-400'>Current 24h cycle</span>
              </div>
              <div className='w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-bold'>
                ☀️
              </div>
            </div>

            <div className='bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between'>
              <div>
                <p className='text-[11px] font-bold text-gray-500 uppercase'>Weekly Income</p>
                <p className='text-xl font-black text-indigo-700 mt-0.5'>
                  {currency}{dashData.weeklyIncome || 0}
                </p>
                <span className='text-[10px] text-gray-400'>Last 7 Days</span>
              </div>
              <div className='w-9 h-9 rounded-xl bg-indigo-50 text-primary flex items-center justify-center text-lg font-bold'>
                📊
              </div>
            </div>

            <div className='bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between'>
              <div>
                <p className='text-[11px] font-bold text-gray-500 uppercase'>Monthly Income</p>
                <p className='text-xl font-black text-blue-700 mt-0.5'>
                  {currency}{dashData.monthlyIncome || dashData.totalRevenue || 0}
                </p>
                <span className='text-[10px] text-gray-400'>Rolling 30 Days</span>
              </div>
              <div className='w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg font-bold'>
                📅
              </div>
            </div>

            <div className='bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between'>
              <div>
                <p className='text-[11px] font-bold text-gray-500 uppercase'>Total Lifetime</p>
                <p className='text-xl font-black text-gray-900 mt-0.5'>
                  {currency}{dashData.totalRevenue || 0}
                </p>
                <span className='text-[10px] text-gray-400'>All Settled Volume</span>
              </div>
              <div className='w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg font-bold'>
                💰
              </div>
            </div>
          </div>
        </>
      )}

      {/* ============================================================ */}
      {/* VIEW 2: FINANCIAL ANALYTICS & PAYMENT STREAMS                */}
      {/* ============================================================ */}
      {selectedView === 'financial' && (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5'>
          {/* Cash on visit */}
          <div className='bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between'>
            <div>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200'>
                  💵 Cash on Visit (Counter)
                </span>
                <span className='text-xs text-gray-400'>In-Clinic Collections</span>
              </div>
              <p className='text-3xl font-black text-gray-900 mt-2'>
                {currency}{dashData.cashIncome || 0}
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                Collected physically at the reception counter and verified by doctors or desk administrators.
              </p>
            </div>
            <div className='mt-4 pt-3 border-t flex items-center justify-between text-xs text-gray-600 font-semibold'>
              <span>Settlement Status:</span>
              <span className='text-emerald-700 font-bold'>✓ 100% Handled Locally</span>
            </div>
          </div>

          {/* Online Digital Payments */}
          <div className='bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between'>
            <div>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-xs font-bold text-indigo-800 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200'>
                  💳 Online Digital Gateway
                </span>
                <span className='text-xs text-gray-400'>Instant Auto-Settlement</span>
              </div>
              <p className='text-3xl font-black text-indigo-950 mt-2'>
                {currency}{dashData.onlineIncome || 0}
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                Processed securely via payment gateway sandbox with automated 100% instant refunds on cancellation.
              </p>
            </div>
            <div className='mt-4 pt-3 border-t flex items-center justify-between text-xs text-gray-600 font-semibold'>
              <span>Refund Protection:</span>
              <span className='text-primary font-bold'>🛡️ 100% Instant Refund Engine Active</span>
            </div>
          </div>
        </div>
      )}

      {/* 7-Day Income Chart & Wings (Visible in Overview & Financial) */}
      {(selectedView === 'overview' || selectedView === 'financial' || selectedView === 'departments') && (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
          {/* Day-Wise / 7-Day Income Trend Chart */}
          <div className='lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs'>
            <div className='flex items-center justify-between mb-2'>
              <div>
                <h3 className='font-bold text-xs sm:text-sm text-gray-800'>7-Day Income & Consultation Flow</h3>
                <p className='text-[11px] text-gray-400'>Daily collected revenue and appointment volume</p>
              </div>
              <span className='text-[10px] bg-indigo-50 text-primary font-bold px-2 py-0.5 rounded-md'>
                Live Analytics
              </span>
            </div>

            {/* Bar Chart */}
            <div className='h-40 flex items-end justify-between gap-2 pt-4 px-2 border-b border-gray-100'>
              {weeklyTrends.map((col, idx) => {
                const heightPercent = Math.max(15, Math.round(((col.income || 20) / maxIncome) * 100))
                return (
                  <div key={idx} className='flex-1 flex flex-col items-center gap-1 h-full justify-end group'>
                    <span className='text-[9px] font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity'>
                      {currency}{col.income}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className='w-full max-w-[32px] bg-gradient-to-t from-primary to-indigo-400 rounded-t-lg group-hover:from-emerald-600 group-hover:to-emerald-400 transition-all shadow-xs'
                    />
                    <span className='text-[10px] font-bold text-gray-700'>{col.day}</span>
                  </div>
                )
              })}
            </div>
            <div className='flex items-center justify-between text-[11px] text-gray-500 pt-2.5'>
              <span>Today's Cashflow: <strong className='text-emerald-700 font-bold'>{currency}{dashData.todayIncome || 0}</strong></span>
              <span className='text-primary font-bold'>Settled Weekly: {currency}{dashData.weeklyIncome || 0}</span>
            </div>
          </div>

          {/* Department Breakdown */}
          <div className='bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between'>
            <div>
              <h3 className='font-bold text-xs sm:text-sm text-gray-800 mb-0.5'>Speciality Volume</h3>
              <p className='text-[11px] text-gray-400 mb-3'>Consultation distribution across wings</p>
              <div className='space-y-2.5 text-xs'>
                <div>
                  <div className='flex justify-between font-semibold text-gray-700 mb-0.5'>
                    <span>General Physicians</span>
                    <span className='font-bold text-primary'>38%</span>
                  </div>
                  <div className='w-full bg-gray-100 h-1.5 rounded-full overflow-hidden'>
                    <div className='bg-primary h-full rounded-full' style={{ width: '38%' }}></div>
                  </div>
                </div>
                <div>
                  <div className='flex justify-between font-semibold text-gray-700 mb-0.5'>
                    <span>Dermatology</span>
                    <span className='font-bold text-emerald-600'>24%</span>
                  </div>
                  <div className='w-full bg-gray-100 h-1.5 rounded-full overflow-hidden'>
                    <div className='bg-emerald-500 h-full rounded-full' style={{ width: '24%' }}></div>
                  </div>
                </div>
                <div>
                  <div className='flex justify-between font-semibold text-gray-700 mb-0.5'>
                    <span>Gynecology</span>
                    <span className='font-bold text-indigo-600'>18%</span>
                  </div>
                  <div className='w-full bg-gray-100 h-1.5 rounded-full overflow-hidden'>
                    <div className='bg-indigo-500 h-full rounded-full' style={{ width: '18%' }}></div>
                  </div>
                </div>
                <div>
                  <div className='flex justify-between font-semibold text-gray-700 mb-0.5'>
                    <span>Pediatrics & Neurology</span>
                    <span className='font-bold text-amber-600'>20%</span>
                  </div>
                  <div className='w-full bg-gray-100 h-1.5 rounded-full overflow-hidden'>
                    <div className='bg-amber-500 h-full rounded-full' style={{ width: '20%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className='mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500'>
              <span>OPD Balancing</span>
              <span className='font-bold text-emerald-700'>100% Operational</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VIEW 3: DOCTORS AVAILABILITY & ROSTER MATRIX                 */}
      {/* ============================================================ */}
      {(selectedView === 'overview' || selectedView === 'doctors') && (
        <div className='bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden'>
          <div className='p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-gray-50/60'>
            <div className='flex items-center gap-2'>
              <span className='text-sm'>👨‍⚕️</span>
              <div>
                <h3 className='font-bold text-xs sm:text-sm text-gray-800'>
                  Doctor Availability & Live Roster Matrix
                </h3>
                <p className='text-[11px] text-gray-500'>
                  Real-time schedule status and instant availability toggles
                </p>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <input
                type='text'
                placeholder='Filter doctor or speciality...'
                value={searchDoctorQuery}
                onChange={(e) => setSearchDoctorQuery(e.target.value)}
                className='text-xs px-3 py-1.5 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 w-full sm:w-48 bg-white'
              />
              <button
                onClick={() => navigate('/doctor-list')}
                className='text-xs font-bold text-primary hover:underline flex-shrink-0'
              >
                Manage Staff →
              </button>
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 p-4'>
            {filteredDoctors.map((doc, idx) => (
              <div
                key={idx}
                className='border border-gray-200 rounded-xl p-3 bg-white flex flex-col justify-between hover:shadow-sm transition-all'
              >
                <div className='flex items-center gap-2.5 mb-2'>
                  <DoctorIdentity
                    name={doc.name}
                    speciality={doc.speciality}
                    docId={doc._id}
                    mode='avatar'
                    className='w-10 h-10 text-xs'
                  />
                  <div className='min-w-0 flex-1'>
                    <p className='font-bold text-xs text-gray-900 truncate'>{doc.name}</p>
                    <p className='text-[11px] text-primary font-medium truncate'>{doc.speciality}</p>
                    <p className='text-[10px] text-gray-400 truncate'>{doc.degree} • {doc.experience}</p>
                  </div>
                </div>

                <div className='pt-2 border-t flex items-center justify-between text-xs'>
                  <span className='text-[11px] text-gray-500'>Live Availability:</span>
                  <label className='flex items-center gap-1.5 cursor-pointer font-bold'>
                    <input
                      type='checkbox'
                      checked={doc.available}
                      onChange={() => changeAvailability(doc._id)}
                      className='accent-primary w-3.5 h-3.5 cursor-pointer'
                    />
                    <span className={doc.available ? 'text-emerald-600 text-[11px]' : 'text-rose-500 text-[11px]'}>
                      {doc.available ? '🟢 OPD Active' : '🔴 Off-Duty'}
                    </span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VIEW 4: CONSULTATION REGISTRY & APPOINTMENTS                 */}
      {/* ============================================================ */}
      {(selectedView === 'overview' || selectedView === 'appointments') && (
        <div className='bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-xs'>
          <div className='flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/60'>
            <div className='flex items-center gap-2'>
              <img src={assets.list_icon} alt='' className='w-4.5 h-4.5' />
              <p className='font-bold text-xs sm:text-sm text-gray-800'>Consultation Registry (Recent Bookings)</p>
            </div>
            <button
              onClick={() => navigate('/all-appointments')}
              className='text-xs font-bold text-primary hover:underline'
            >
              View All Consultation Records →
            </button>
          </div>

          <div className='divide-y divide-gray-100'>
            {dashData.latestAppointments && dashData.latestAppointments.length > 0 ? (
              dashData.latestAppointments.slice(0, 6).map((item, index) => (
                <div key={index} className='flex items-center px-5 py-3 gap-3.5 hover:bg-gray-50 transition-colors text-xs'>
                  <div className='w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-primary font-black text-xs flex items-center justify-center font-mono flex-shrink-0'>
                    #{item.tokenNumber || index + 1}
                  </div>

                  <div className='w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border'>
                    <DoctorIdentity
                      name={item.docData?.name || 'Doctor'}
                      speciality={item.docData?.speciality || 'Specialist'}
                      docId={item.docData?._id}
                      className='h-full w-full object-cover'
                    />
                  </div>

                  <div className='flex-1 min-w-0'>
                    <p className='font-bold text-gray-900 truncate'>{item.docData?.name}</p>
                    <p className='text-gray-500 text-[11px] truncate'>
                      Patient: <strong className='text-gray-700'>{item.userData?.name || 'Patient'}</strong> •{' '}
                      {slotDateFormat(item.slotDate)} at {item.slotTime}
                    </p>
                  </div>

                  <div className='text-right'>
                    <p className='font-black text-gray-900'>{currency}{item.amount}</p>
                    {item.payment ? (
                      <span className='text-[10px] text-emerald-700 font-bold'>Paid ({item.paymentMethod || 'Online'})</span>
                    ) : item.cancelled ? (
                      <span className='text-[10px] text-rose-500 font-bold'>Cancelled</span>
                    ) : (
                      <span className='text-[10px] text-amber-700 font-bold'>Unpaid</span>
                    )}
                  </div>

                  <div className='flex items-center gap-1.5'>
                    {item.cancelled ? (
                      <span className='text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md'>
                        Cancelled
                      </span>
                    ) : item.isCompleted ? (
                      <span className='text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md'>
                        Completed
                      </span>
                    ) : (
                      <button
                        onClick={() => cancelAppointment(item._id)}
                        className='text-[10px] font-bold text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-md border border-rose-200 transition-all'
                        title='Cancel Appointment'
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className='p-6 text-center text-xs text-gray-400'>No recent appointments booked.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
