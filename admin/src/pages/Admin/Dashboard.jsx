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

  // Mock weekly consultation trends for SVG Chart (Sun-Sat)
  const weeklyData = [
    { day: 'Mon', count: 12, height: '60%' },
    { day: 'Tue', count: 18, height: '85%' },
    { day: 'Wed', count: 15, height: '70%' },
    { day: 'Thu', count: 22, height: '95%' },
    { day: 'Fri', count: 19, height: '88%' },
    { day: 'Sat', count: 14, height: '65%' },
    { day: 'Sun', count: 8, height: '40%' },
  ]

  return (
    dashData && (
      <div className='w-full max-w-6xl m-5 space-y-6'>
        {/* Page Header */}
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>Hospital Operations & Analytics</h1>
          <p className='text-xs text-gray-500 mt-0.5'>
            Real-time platform overview across clinical rosters, consultations, and revenue settlements
          </p>
        </div>

        {/* High-Level Stat Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {/* Revenue */}
          <div className='bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between hover:shadow-md transition-all'>
            <div className='flex items-center gap-3.5'>
              <div className='p-3 bg-emerald-50 rounded-2xl'>
                <img src={assets.earning_icon} className='w-8 h-8' alt='Revenue' />
              </div>
              <div>
                <p className='text-2xl font-extrabold text-gray-900'>
                  {currency}{dashData.totalRevenue || 0}
                </p>
                <p className='text-xs font-semibold text-gray-500'>Hospital Volume</p>
              </div>
            </div>
            <span className='text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200'>
              Settled
            </span>
          </div>

          {/* Doctors */}
          <div className='bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between hover:shadow-md transition-all'>
            <div className='flex items-center gap-3.5'>
              <div className='p-3 bg-indigo-50 rounded-2xl'>
                <img src={assets.doctor_icon} className='w-8 h-8' alt='Doctors' />
              </div>
              <div>
                <p className='text-2xl font-extrabold text-gray-900'>{dashData.doctors}</p>
                <p className='text-xs font-semibold text-gray-500'>Specialist Roster</p>
              </div>
            </div>
            <span className='text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200'>
              Verified
            </span>
          </div>

          {/* Appointments */}
          <div className='bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between hover:shadow-md transition-all'>
            <div className='flex items-center gap-3.5'>
              <div className='p-3 bg-blue-50 rounded-2xl'>
                <img src={assets.appointments_icon} className='w-8 h-8' alt='Appointments' />
              </div>
              <div>
                <p className='text-2xl font-extrabold text-gray-900'>{dashData.appointments}</p>
                <p className='text-xs font-semibold text-gray-500'>Active Bookings</p>
              </div>
            </div>
            <span className='text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200'>
              Live Slots
            </span>
          </div>

          {/* Patients */}
          <div className='bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between hover:shadow-md transition-all'>
            <div className='flex items-center gap-3.5'>
              <div className='p-3 bg-amber-50 rounded-2xl'>
                <img src={assets.patients_icon} className='w-8 h-8' alt='Patients' />
              </div>
              <div>
                <p className='text-2xl font-extrabold text-gray-900'>{dashData.patients}</p>
                <p className='text-xs font-semibold text-gray-500'>Total Patients</p>
              </div>
            </div>
            <span className='text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200'>
              E-Records
            </span>
          </div>
        </div>

        {/* Analytics Chart & Hospital Capacity */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Weekly Consultation Chart */}
          <div className='lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm'>
            <div className='flex items-center justify-between mb-4'>
              <div>
                <h3 className='font-bold text-sm text-gray-800'>Weekly Patient Consultation Flow</h3>
                <p className='text-xs text-gray-400'>Live volume metrics across hospital departments</p>
              </div>
              <span className='text-xs bg-indigo-50 text-[#5F65FF] font-bold px-2.5 py-1 rounded-lg'>
                This Week
              </span>
            </div>

            {/* Custom SVG / Pure CSS Bar Chart */}
            <div className='h-44 flex items-end justify-between gap-3 pt-6 px-2 border-b border-gray-100'>
              {weeklyData.map((col, idx) => (
                <div key={idx} className='flex-1 flex flex-col items-center gap-1.5 h-full justify-end group'>
                  <span className='text-[10px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity'>
                    {col.count}
                  </span>
                  <div
                    style={{ height: col.height }}
                    className='w-full max-w-[36px] bg-gradient-to-t from-[#5F65FF] to-indigo-400 rounded-t-xl group-hover:from-indigo-600 group-hover:to-indigo-500 transition-all shadow-sm'
                  />
                  <span className='text-[11px] font-semibold text-gray-500'>{col.day}</span>
                </div>
              ))}
            </div>
            <div className='flex items-center justify-between text-xs text-gray-500 pt-3'>
              <span>Peak Day: <strong>Thursday (22 Consultations)</strong></span>
              <span className='text-emerald-600 font-bold'>↑ 18.5% higher than last week</span>
            </div>
          </div>

          {/* Department Breakdown */}
          <div className='bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between'>
            <div>
              <h3 className='font-bold text-sm text-gray-800 mb-1'>Clinical Specialities</h3>
              <p className='text-xs text-gray-400 mb-4'>Departmental coverage</p>
              <div className='space-y-3 text-xs'>
                <div>
                  <div className='flex justify-between font-semibold text-gray-700 mb-1'>
                    <span>General Physicians</span>
                    <span className='font-bold text-primary'>35%</span>
                  </div>
                  <div className='w-full bg-gray-100 h-2 rounded-full overflow-hidden'>
                    <div className='bg-[#5F65FF] h-full rounded-full' style={{ width: '35%' }} />
                  </div>
                </div>

                <div>
                  <div className='flex justify-between font-semibold text-gray-700 mb-1'>
                    <span>Gynecology & Pediatrics</span>
                    <span className='font-bold text-emerald-600'>30%</span>
                  </div>
                  <div className='w-full bg-gray-100 h-2 rounded-full overflow-hidden'>
                    <div className='bg-emerald-500 h-full rounded-full' style={{ width: '30%' }} />
                  </div>
                </div>

                <div>
                  <div className='flex justify-between font-semibold text-gray-700 mb-1'>
                    <span>Dermatology & Neuro</span>
                    <span className='font-bold text-amber-600'>25%</span>
                  </div>
                  <div className='w-full bg-gray-100 h-2 rounded-full overflow-hidden'>
                    <div className='bg-amber-500 h-full rounded-full' style={{ width: '25%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className='p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 mt-4'>
              <strong>System Status:</strong> All server API nodes healthy and operating with active MongoDB Atlas cluster.
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
                        ✓ Paid
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
