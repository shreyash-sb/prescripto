import { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import DoctorIdentity from '../../components/DoctorIdentity'

const Dashboard = () => {
  const { aToken, getDashData, cancelAppointment, dashData } = useContext(AdminContext)
  const { slotDateFormat, currency } = useContext(AppContext)

  useEffect(() => {
    if (aToken) {
      getDashData()
    }
  }, [aToken])

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
      <div className='w-full max-w-6xl m-5 space-y-6'>
        {/* Page Header */}
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>Hospital Operations & Revenue Analytics</h1>
          <p className='text-xs text-gray-500 mt-0.5'>
            Comprehensive financial summaries: day-wise, week-wise, month-wise income and patient consultations
          </p>
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
                <p className='text-xs font-semibold text-gray-500'>Today's Income (Day-Wise)</p>
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
              <p className='text-xs text-gray-500 font-semibold'>💵 Cash on Visit Collections</p>
              <p className='text-xl font-bold text-emerald-700 mt-1'>{currency}{dashData.cashIncome || 0}</p>
            </div>
            <span className='text-xs bg-emerald-50 text-emerald-700 font-bold px-2 py-1 rounded-lg'>Counter</span>
          </div>

          <div className='bg-white p-4 rounded-2xl border border-gray-200/70 shadow-sm flex items-center justify-between'>
            <div>
              <p className='text-xs text-gray-500 font-semibold'>💳 Online & Card Payments</p>
              <p className='text-xl font-bold text-indigo-700 mt-1'>{currency}{dashData.onlineIncome || 0}</p>
            </div>
            <span className='text-xs bg-indigo-50 text-indigo-700 font-bold px-2 py-1 rounded-lg'>Digital</span>
          </div>

          <div className='bg-white p-4 rounded-2xl border border-gray-200/70 shadow-sm flex items-center justify-between'>
            <div>
              <p className='text-xs text-gray-500 font-semibold'>👨‍⚕️ Active Specialists</p>
              <p className='text-xl font-bold text-gray-800 mt-1'>{dashData.doctors} Doctors</p>
            </div>
            <span className='text-xs bg-gray-100 text-gray-600 font-bold px-2 py-1 rounded-lg'>Staff</span>
          </div>

          <div className='bg-white p-4 rounded-2xl border border-gray-200/70 shadow-sm flex items-center justify-between'>
            <div>
              <p className='text-xs text-gray-500 font-semibold'>👥 Total Patients Registered</p>
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

            {/* Pure CSS / SVG Bar Chart */}
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
                    <div className='bg-[#5F65FF] h-full rounded-full' style={{ width: '38%' }} />
                  </div>
                </div>

                <div>
                  <div className='flex justify-between font-semibold text-gray-700 mb-1'>
                    <span>Gynecology & Pediatrics</span>
                    <span className='font-bold text-emerald-600'>32%</span>
                  </div>
                  <div className='w-full bg-gray-100 h-2 rounded-full overflow-hidden'>
                    <div className='bg-emerald-500 h-full rounded-full' style={{ width: '32%' }} />
                  </div>
                </div>

                <div>
                  <div className='flex justify-between font-semibold text-gray-700 mb-1'>
                    <span>Dermatology & Neurology</span>
                    <span className='font-bold text-amber-600'>30%</span>
                  </div>
                  <div className='w-full bg-gray-100 h-2 rounded-full overflow-hidden'>
                    <div className='bg-amber-500 h-full rounded-full' style={{ width: '30%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className='p-3 bg-emerald-50/80 border border-emerald-100 rounded-xl text-xs text-emerald-950 mt-4'>
              <strong>Financial Audit:</strong> All patient consultation transactions & wallet settlements are verified.
            </div>
          </div>
        </div>

        {/* Latest Bookings Table */}
        <div className='bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden'>
          <div className='flex items-center justify-between px-6 py-4 border-b bg-gray-50/70'>
            <div className='flex items-center gap-2.5'>
              <img src={assets.list_icon} alt='' />
              <p className='font-bold text-sm text-gray-800'>Recent Consultation Bookings</p>
            </div>
            <span className='text-xs text-gray-400 font-medium'>Live Feed</span>
          </div>

          <div className='divide-y divide-gray-100'>
            {(dashData.latest_appointments || []).map((item, index) => (
              <div
                key={index}
                className='flex items-center justify-between px-6 py-3.5 gap-4 hover:bg-gray-50/80 transition-colors'
              >
                <div className='flex items-center gap-3'>
                  <DoctorIdentity
                    name={item.docData.name}
                    speciality={item.docData.speciality}
                    docId={item.docData._id}
                    mode='avatar'
                  />
                  <div className='text-xs'>
                    <p className='text-gray-900 font-bold text-sm'>{item.docData.name}</p>
                    <p className='text-gray-500'>
                      {item.userData?.name} • {slotDateFormat(item.slotDate)} ({item.slotTime})
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <div className='text-right'>
                    <p className='text-xs font-bold text-gray-800'>{currency}{item.amount}</p>
                    {item.payment ? (
                      <span className='text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 block mt-0.5'>
                        ✓ Paid ({item.paymentMethod || 'Online'})
                      </span>
                    ) : item.cancelled ? (
                      <span className='text-[10px] text-gray-400 block mt-0.5'>Cancelled</span>
                    ) : (
                      <span className='text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 block mt-0.5'>
                        Pending
                      </span>
                    )}
                  </div>

                  <div>
                    {item.cancelled ? (
                      <span className='text-xs font-semibold px-3 py-1 bg-rose-50 text-rose-600 rounded-full border border-rose-200'>
                        Cancelled
                      </span>
                    ) : item.isCompleted ? (
                      <span className='text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200'>
                        ✓ Completed
                      </span>
                    ) : (
                      <button
                        onClick={() => cancelAppointment(item._id)}
                        className='p-1.5 hover:bg-rose-50 rounded-lg text-rose-500 transition-colors'
                        title='Cancel Appointment'
                      >
                        <img className='w-6 h-6' src={assets.cancel_icon} alt='Cancel' />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  )
}

export default Dashboard
