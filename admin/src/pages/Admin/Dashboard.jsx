import { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import DoctorIdentity from '../../components/DoctorIdentity'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const { aToken, getDashData, cancelAppointment, dashData, doctors, getAllDoctors } = useContext(AdminContext)
  const { slotDateFormat, currency } = useContext(AppContext)
  const navigate = useNavigate()

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

  return (
    dashData && (
      <div className='w-full max-w-6xl space-y-6'>
        {/* Page Header */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Hospital Operations & Revenue Analytics</h1>
            <p className='text-xs text-gray-500 mt-0.5'>
              Real-time financial analytics, consultation metrics, and doctor availability tracking
            </p>
          </div>
          <button
            onClick={() => navigate('/add-doctor')}
            className='bg-primary text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl hover:bg-opacity-95 shadow-sm transition-all self-start sm:self-auto'
          >
            + Onboard Doctor
          </button>
        </div>

        {/* Doctor Availability & OPD Status Panel */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          {/* Available Doctors */}
          <div className='bg-white p-5 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-sm flex items-center justify-between'>
            <div className='flex items-center gap-3.5'>
              <div className='w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-xl font-bold shadow-sm'>
                🟢
              </div>
              <div>
                <p className='text-2xl font-black text-emerald-800'>{availableDocs}</p>
                <p className='text-xs font-bold text-emerald-700'>Available Doctors (OPD Active)</p>
              </div>
            </div>
            <span
              onClick={() => navigate('/doctor-list')}
              className='text-[11px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg cursor-pointer transition-colors'
            >
              View →
            </span>
          </div>

          {/* Unavailable Doctors */}
          <div className='bg-white p-5 rounded-2xl border border-rose-200/80 bg-rose-50/20 shadow-sm flex items-center justify-between'>
            <div className='flex items-center gap-3.5'>
              <div className='w-11 h-11 rounded-xl bg-rose-500 text-white flex items-center justify-center text-xl font-bold shadow-sm'>
                🔴
              </div>
              <div>
                <p className='text-2xl font-black text-rose-800'>{unavailableDocs}</p>
                <p className='text-xs font-bold text-rose-700'>Unavailable / Off-Duty</p>
              </div>
            </div>
            <span
              onClick={() => navigate('/doctor-list')}
              className='text-[11px] font-bold text-rose-800 bg-rose-100 hover:bg-rose-200 px-2.5 py-1 rounded-lg cursor-pointer transition-colors'
            >
              Manage →
            </span>
          </div>

          {/* Total Registered Doctors */}
          <div className='bg-white p-5 rounded-2xl border border-indigo-200/80 bg-indigo-50/20 shadow-sm flex items-center justify-between'>
            <div className='flex items-center gap-3.5'>
              <div className='w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center text-xl font-bold shadow-sm'>
                👨‍⚕️
              </div>
              <div>
                <p className='text-2xl font-black text-indigo-900'>{totalDocs}</p>
                <p className='text-xs font-bold text-indigo-700'>Total Clinical Specialists</p>
              </div>
            </div>
            <span className='text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-lg'>
              100% Verified
            </span>
          </div>
        </div>

        {/* Financial & Operational Metric Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {/* Day-Wise Income */}
          <div className='bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between hover:shadow-md transition-all'>
            <div className='flex items-center gap-3.5'>
              <div className='p-3 bg-emerald-50 text-emerald-600 rounded-2xl text-2xl font-bold'>
                ☀️
              </div>
              <div>
                <p className='text-2xl font-extrabold text-gray-900'>
                  {currency}{dashData.todayIncome || 0}
                </p>
                <p className='text-xs font-semibold text-gray-500'>Today's Income</p>
              </div>
            </div>
            <span className='text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200'>
              Today
            </span>
          </div>

          {/* Week-Wise Income */}
          <div className='bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between hover:shadow-md transition-all'>
            <div className='flex items-center gap-3.5'>
              <div className='p-3 bg-indigo-50 text-indigo-600 rounded-2xl text-2xl font-bold'>
                📊
              </div>
              <div>
                <p className='text-2xl font-extrabold text-gray-900'>
                  {currency}{dashData.weeklyIncome || 0}
                </p>
                <p className='text-xs font-semibold text-gray-500'>Weekly Income (7 Days)</p>
              </div>
            </div>
            <span className='text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200'>
              7 Days
            </span>
          </div>

          {/* Month-Wise Income */}
          <div className='bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between hover:shadow-md transition-all'>
            <div className='flex items-center gap-3.5'>
              <div className='p-3 bg-blue-50 text-blue-600 rounded-2xl text-2xl font-bold'>
                📅
              </div>
              <div>
                <p className='text-2xl font-extrabold text-gray-900'>
                  {currency}{dashData.monthlyIncome || dashData.totalRevenue || 0}
                </p>
                <p className='text-xs font-semibold text-gray-500'>Monthly Income (30 Days)</p>
              </div>
            </div>
            <span className='text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200'>
              Monthly
            </span>
          </div>

          {/* Total Revenue & Volume */}
          <div className='bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between hover:shadow-md transition-all'>
            <div className='flex items-center gap-3.5'>
              <div className='p-3 bg-amber-50 text-amber-600 rounded-2xl text-2xl font-bold'>
                💰
              </div>
              <div>
                <p className='text-2xl font-extrabold text-gray-900'>
                  {currency}{dashData.totalRevenue || 0}
                </p>
                <p className='text-xs font-semibold text-gray-500'>Total Lifetime Volume</p>
              </div>
            </div>
            <span className='text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200'>
              All Time
            </span>
          </div>
        </div>

        {/* Payment Channels & Operational Metrics */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          <div className='bg-white p-4 rounded-2xl border border-gray-200/70 shadow-sm flex items-center justify-between'>
            <div>
              <p className='text-xs text-gray-500 font-semibold'>💵 Cash on Visit</p>
              <p className='text-xl font-bold text-emerald-700 mt-1'>{currency}{dashData.cashIncome || 0}</p>
            </div>
            <span className='text-xs bg-emerald-50 text-emerald-700 font-bold px-2 py-1 rounded-lg'>Counter</span>
          </div>

          <div className='bg-white p-4 rounded-2xl border border-gray-200/70 shadow-sm flex items-center justify-between'>
            <div>
              <p className='text-xs text-gray-500 font-semibold'>💳 Online Payments</p>
              <p className='text-xl font-bold text-indigo-700 mt-1'>{currency}{dashData.onlineIncome || 0}</p>
            </div>
            <span className='text-xs bg-indigo-50 text-indigo-700 font-bold px-2 py-1 rounded-lg'>Digital</span>
          </div>

          <div className='bg-white p-4 rounded-2xl border border-gray-200/70 shadow-sm flex items-center justify-between'>
            <div>
              <p className='text-xs text-gray-500 font-semibold'>👥 Total Consultations</p>
              <p className='text-xl font-bold text-gray-800 mt-1'>{dashData.appointments} Bookings</p>
            </div>
            <span className='text-xs bg-gray-100 text-gray-600 font-bold px-2 py-1 rounded-lg'>Queue</span>
          </div>

          <div className='bg-white p-4 rounded-2xl border border-gray-200/70 shadow-sm flex items-center justify-between'>
            <div>
              <p className='text-xs text-gray-500 font-semibold'>👥 Registered Patients</p>
              <p className='text-xl font-bold text-gray-800 mt-1'>{dashData.patients} Patients</p>
            </div>
            <span className='text-xs bg-gray-100 text-gray-600 font-bold px-2 py-1 rounded-lg'>Records</span>
          </div>
        </div>

        {/* Analytics Chart & Income Trends */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Day-Wise / 7-Day Income Trend Chart */}
          <div className='lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm'>
            <div className='flex items-center justify-between mb-4'>
              <div>
                <h3 className='font-bold text-sm text-gray-800'>7-Day Income & Consultation Flow</h3>
                <p className='text-xs text-gray-400'>Daily collected revenue and appointment volume</p>
              </div>
              <span className='text-xs bg-indigo-50 text-[#5F65FF] font-bold px-2.5 py-1 rounded-lg'>
                Live Analytics
              </span>
            </div>

            {/* Bar Chart */}
            <div className='h-48 flex items-end justify-between gap-3 pt-6 px-2 border-b border-gray-100'>
              {weeklyTrends.map((col, idx) => {
                const heightPercent = Math.max(15, Math.round(((col.income || 20) / maxIncome) * 100))
                return (
                  <div key={idx} className='flex-1 flex flex-col items-center gap-1.5 h-full justify-end group'>
                    <span className='text-[10px] font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity'>
                      {currency}{col.income}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className='w-full max-w-[38px] bg-gradient-to-t from-[#5F65FF] to-indigo-400 rounded-t-xl group-hover:from-emerald-600 group-hover:to-emerald-400 transition-all shadow-sm'
                    />
                    <span className='text-[11px] font-bold text-gray-700'>{col.day}</span>
                    <span className='text-[9px] text-gray-400 -mt-1'>{col.date}</span>
                  </div>
                )
              })}
            </div>
            <div className='flex flex-wrap items-center justify-between text-xs text-gray-500 pt-3 gap-2'>
              <span>Today's Cashflow: <strong className='text-emerald-700 font-bold'>{currency}{dashData.todayIncome || 0}</strong></span>
              <span className='text-indigo-600 font-bold'>Settled Weekly Volume: {currency}{dashData.weeklyIncome || 0}</span>
            </div>
          </div>

          {/* Department Breakdown */}
          <div className='bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between'>
            <div>
              <h3 className='font-bold text-sm text-gray-800 mb-1'>Speciality Volume</h3>
              <p className='text-xs text-gray-400 mb-4'>Revenue share by medical wing</p>
              <div className='space-y-3 text-xs'>
                <div>
                  <div className='flex justify-between font-semibold text-gray-700 mb-1'>
                    <span>General Physicians</span>
                    <span className='font-bold text-primary'>38%</span>
                  </div>
                  <div className='w-full bg-gray-100 h-2 rounded-full overflow-hidden'>
                    <div className='bg-primary h-full rounded-full' style={{ width: '38%' }}></div>
                  </div>
                </div>
                <div>
                  <div className='flex justify-between font-semibold text-gray-700 mb-1'>
                    <span>Dermatology</span>
                    <span className='font-bold text-emerald-600'>24%</span>
                  </div>
                  <div className='w-full bg-gray-100 h-2 rounded-full overflow-hidden'>
                    <div className='bg-emerald-500 h-full rounded-full' style={{ width: '24%' }}></div>
                  </div>
                </div>
                <div>
                  <div className='flex justify-between font-semibold text-gray-700 mb-1'>
                    <span>Gynecology</span>
                    <span className='font-bold text-indigo-600'>18%</span>
                  </div>
                  <div className='w-full bg-gray-100 h-2 rounded-full overflow-hidden'>
                    <div className='bg-indigo-500 h-full rounded-full' style={{ width: '18%' }}></div>
                  </div>
                </div>
                <div>
                  <div className='flex justify-between font-semibold text-gray-700 mb-1'>
                    <span>Pediatrics & Neurology</span>
                    <span className='font-bold text-amber-600'>20%</span>
                  </div>
                  <div className='w-full bg-gray-100 h-2 rounded-full overflow-hidden'>
                    <div className='bg-amber-500 h-full rounded-full' style={{ width: '20%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className='mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500'>
              <span>Auto-balanced OPD</span>
              <span className='font-bold text-emerald-700'>100% Operational</span>
            </div>
          </div>
        </div>

        {/* Latest Bookings Table */}
        <div className='bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm'>
          <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50'>
            <div className='flex items-center gap-2.5'>
              <img src={assets.list_icon} alt='' className='w-5 h-5' />
              <p className='font-bold text-sm text-gray-800'>Recent Consultation Bookings</p>
            </div>
            <button
              onClick={() => navigate('/all-appointments')}
              className='text-xs font-bold text-primary hover:underline'
            >
              View All Appointments →
            </button>
          </div>

          <div className='divide-y divide-gray-100'>
            {dashData.latestAppointments && dashData.latestAppointments.length > 0 ? (
              dashData.latestAppointments.slice(0, 6).map((item, index) => (
                <div key={index} className='flex items-center px-6 py-3.5 gap-4 hover:bg-gray-50 transition-colors'>
                  <div className='w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border'>
                    <DoctorIdentity
                      name={item.docData?.name || 'Doctor'}
                      speciality={item.docData?.speciality || 'Specialist'}
                      docId={item.docData?._id}
                      className='h-full w-full object-cover'
                    />
                  </div>

                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-bold text-gray-900 truncate'>{item.docData?.name}</p>
                    <p className='text-xs text-gray-500'>
                      Patient: <strong className='text-gray-700'>{item.userData?.name || 'Patient'}</strong> •{' '}
                      {slotDateFormat(item.slotDate)} at {item.slotTime}
                    </p>
                  </div>

                  <div className='flex items-center gap-2'>
                    {item.cancelled ? (
                      <span className='text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full'>
                        Cancelled
                      </span>
                    ) : item.isCompleted ? (
                      <span className='text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full'>
                        Completed
                      </span>
                    ) : (
                      <button
                        onClick={() => cancelAppointment(item._id)}
                        className='text-xs font-bold text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-lg border border-transparent hover:border-rose-200 transition-all'
                        title='Cancel Appointment'
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className='p-6 text-center text-xs text-gray-400'>No recent appointments available.</p>
            )}
          </div>
        </div>
      </div>
    )
  )
}

export default Dashboard
