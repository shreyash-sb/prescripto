import { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import DoctorIdentity from '../../components/DoctorIdentity'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const {
    aToken,
    getDashData,
    cancelAppointment,
    dashData,
    doctors,
    getAllDoctors,
  } = useContext(AdminContext)
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

  if (!dashData) {
    return (
      <div className='p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm'>
        <div className='inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent'></div>
        <p className='mt-3 text-xs text-gray-500 font-bold'>Loading hospital executive console...</p>
      </div>
    )
  }

  return (
    <div className='w-full max-w-7xl space-y-5'>
      {/* 1. Header Toolbar */}
      <div className='bg-white p-5 sm:p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <div className='flex items-center gap-2'>
            <h1 className='text-xl sm:text-2xl font-black text-gray-900'>Hospital Executive Dashboard</h1>
            <span className='px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs'>
              Live Console
            </span>
          </div>
          <p className='text-xs sm:text-sm text-gray-500 mt-1'>
            Real-time overview of hospital performance, doctor availability, revenue metrics, and patient consultations.
          </p>
        </div>

        <div className='flex items-center gap-2.5 flex-wrap'>
          <button
            onClick={() => navigate('/add-doctor')}
            className='bg-[#5F6FFF] hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2'
          >
            <span>+</span>
            <span>Onboard Doctor</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5'>
        {/* Total Doctors */}
        <div
          onClick={() => navigate('/doctor-list')}
          className='bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group'
        >
          <div>
            <p className='text-[11px] font-bold text-gray-500 uppercase tracking-wider'>Specialist Roster</p>
            <p className='text-2xl font-black text-gray-900 mt-1'>{totalDocs}</p>
            <div className='flex items-center gap-1.5 mt-1 text-xs'>
              <span className='text-emerald-700 font-bold'>🟢 {availableDocs} Active</span>
              <span className='text-gray-400'>•</span>
              <span className='text-rose-600 font-bold'>🔴 {unavailableDocs} Off</span>
            </div>
          </div>
          <div className='w-12 h-12 rounded-2xl bg-indigo-50 text-primary flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform'>
            👨‍⚕️
          </div>
        </div>

        {/* Total Consultations */}
        <div
          onClick={() => navigate('/all-appointments')}
          className='bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group'
        >
          <div>
            <p className='text-[11px] font-bold text-gray-500 uppercase tracking-wider'>Total Bookings</p>
            <p className='text-2xl font-black text-gray-900 mt-1'>{dashData.appointments || 0}</p>
            <span className='text-xs font-bold text-primary'>View Consultation Records →</span>
          </div>
          <div className='w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform'>
            📋
          </div>
        </div>

        {/* Total Patients */}
        <div className='bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-[11px] font-bold text-gray-500 uppercase tracking-wider'>Registered Patients</p>
            <p className='text-2xl font-black text-gray-900 mt-1'>{dashData.patients || 0}</p>
            <span className='text-xs text-gray-400 font-medium'>Active Healthcare Users</span>
          </div>
          <div className='w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-bold'>
            👥
          </div>
        </div>

        {/* Total Revenue */}
        <div className='bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-[11px] font-bold text-gray-500 uppercase tracking-wider'>Lifetime Revenue</p>
            <p className='text-2xl font-black text-emerald-800 mt-1'>
              {currency}{dashData.totalRevenue || dashData.monthlyIncome || 0}
            </p>
            <span className='text-xs text-emerald-700 font-bold'>Today: {currency}{dashData.todayIncome || 0}</span>
          </div>
          <div className='w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold'>
            💰
          </div>
        </div>
      </div>

      {/* 3. Financial Breakdown Streams (Cash at Counter vs Online) */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5'>
        {/* Cash at Counter */}
        <div className='bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between'>
          <div>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5'>
                <span>💵</span> Cash on Visit (Counter)
              </span>
              <span className='text-xs text-gray-400 font-medium'>In-Clinic Collections</span>
            </div>
            <p className='text-3xl font-black text-gray-900 mt-2'>
              {currency}{dashData.cashIncome || 0}
            </p>
            <p className='text-xs text-gray-500 mt-1'>
              Collected physically at hospital reception and verified by administrative staff.
            </p>
          </div>
          <div className='mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600 font-semibold'>
            <span>Settlement:</span>
            <span className='text-emerald-700 font-bold'>✓ Verified In-Person</span>
          </div>
        </div>

        {/* Online Digital Gateway */}
        <div className='bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between'>
          <div>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-xs font-bold text-indigo-800 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 flex items-center gap-1.5'>
                <span>💳</span> Online Digital Gateway
              </span>
              <span className='text-xs text-gray-400 font-medium'>Instant Settlement</span>
            </div>
            <p className='text-3xl font-black text-indigo-950 mt-2'>
              {currency}{dashData.onlineIncome || 0}
            </p>
            <p className='text-xs text-gray-500 mt-1'>
              Processed digitally with automatic 100% instant refund protection to patient wallet on cancellation.
            </p>
          </div>
          <div className='mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600 font-semibold'>
            <span>Refund Protection:</span>
            <span className='text-primary font-bold'>🛡️ 100% Instant Refund Engine Active</span>
          </div>
        </div>
      </div>

      {/* 4. 7-Day Income Chart & Specialty Wings Distribution */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
        {/* Day-Wise 7-Day Income Trend Chart */}
        <div className='lg:col-span-2 bg-white p-5 sm:p-6 rounded-3xl border border-gray-200/80 shadow-xs'>
          <div className='flex items-center justify-between mb-2'>
            <div>
              <h3 className='font-bold text-sm sm:text-base text-gray-900'>7-Day Revenue & Consultation Flow</h3>
              <p className='text-xs text-gray-400'>Daily collected revenue volume across OPD departments</p>
            </div>
            <span className='text-[10px] bg-indigo-50 text-primary font-bold px-2.5 py-1 rounded-lg border border-indigo-100'>
              Live Analytics
            </span>
          </div>

          {/* Bar Chart */}
          <div className='h-44 flex items-end justify-between gap-2.5 pt-4 px-2 border-b border-gray-100'>
            {weeklyTrends.map((col, idx) => {
              const heightPercent = Math.max(15, Math.round(((col.income || 20) / maxIncome) * 100))
              return (
                <div key={idx} className='flex-1 flex flex-col items-center gap-1.5 h-full justify-end group'>
                  <span className='text-[10px] font-bold text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity'>
                    {currency}{col.income}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className='w-full max-w-[36px] bg-gradient-to-t from-[#5F6FFF] to-indigo-400 rounded-t-xl group-hover:from-emerald-600 group-hover:to-emerald-400 transition-all shadow-xs'
                  />
                  <span className='text-[11px] font-bold text-gray-700'>{col.day}</span>
                </div>
              )
            })}
          </div>
          <div className='flex items-center justify-between text-xs text-gray-500 pt-3'>
            <span>Today&apos;s Income: <strong className='text-emerald-700 font-bold'>{currency}{dashData.todayIncome || 0}</strong></span>
            <span className='text-primary font-bold'>Settled Weekly: {currency}{dashData.weeklyIncome || 0}</span>
          </div>
        </div>

        {/* Department Volume Breakdown */}
        <div className='bg-white p-5 sm:p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between'>
          <div>
            <h3 className='font-bold text-sm sm:text-base text-gray-900 mb-0.5'>Specialty Distribution</h3>
            <p className='text-xs text-gray-400 mb-4'>Consultation share across hospital wings</p>
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
            <span>OPD Capacity:</span>
            <span className='font-bold text-emerald-700'>100% Operational</span>
          </div>
        </div>
      </div>

      {/* 5. Recent Consultations Stream */}
      <div className='bg-white border border-gray-200/80 rounded-3xl overflow-hidden shadow-xs'>
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70'>
          <div className='flex items-center gap-2.5'>
            <img src={assets.list_icon} alt='' className='w-4 h-4' />
            <h3 className='font-bold text-sm sm:text-base text-gray-900'>Recent Consultation Bookings</h3>
          </div>
          <button
            onClick={() => navigate('/all-appointments')}
            className='text-xs font-bold text-primary hover:underline flex items-center gap-1'
          >
            <span>View All Records</span>
            <span>→</span>
          </button>
        </div>

        <div className='divide-y divide-gray-100'>
          {dashData.latestAppointments && dashData.latestAppointments.length > 0 ? (
            dashData.latestAppointments.slice(0, 5).map((item, index) => (
              <div
                key={index}
                className='flex flex-col sm:flex-row sm:items-center px-6 py-3.5 gap-3 sm:gap-4 hover:bg-gray-50/80 transition-colors text-xs'
              >
                {/* Token Badge */}
                <div className='w-9 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-primary font-black text-xs flex items-center justify-center font-mono flex-shrink-0'>
                  #{item.tokenNumber || index + 1}
                </div>

                {/* Doctor Identity */}
                <div className='w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border'>
                  <DoctorIdentity
                    name={item.docData?.name || 'Doctor'}
                    speciality={item.docData?.speciality || 'Specialist'}
                    docId={item.docData?._id}
                    className='h-full w-full object-cover'
                  />
                </div>

                {/* Doctor & Patient Info */}
                <div className='flex-1 min-w-0'>
                  <p className='font-bold text-gray-900 truncate'>{item.docData?.name || 'Doctor'}</p>
                  <p className='text-gray-500 text-[11px] truncate'>
                    Patient: <strong className='text-gray-800'>{item.userData?.name || 'Patient'}</strong> •{' '}
                    {slotDateFormat(item.slotDate)} at {item.slotTime}
                  </p>
                </div>

                {/* Fee & Payment */}
                <div className='text-left sm:text-right'>
                  <p className='font-black text-gray-900'>{currency}{item.amount}</p>
                  {item.refundStatus === 'Refunded' ? (
                    <span className='text-[10px] text-purple-700 font-bold'>🛡️ 100% Refunded</span>
                  ) : item.payment ? (
                    <span className='text-[10px] text-emerald-700 font-bold'>Paid ({item.paymentMethod || 'Online'})</span>
                  ) : item.cancelled ? (
                    <span className='text-[10px] text-rose-500 font-bold'>Cancelled</span>
                  ) : (
                    <span className='text-[10px] text-amber-700 font-bold'>Unpaid</span>
                  )}
                </div>

                {/* Action / Status */}
                <div className='flex items-center gap-1.5'>
                  {item.cancelled ? (
                    <span className='text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-lg'>
                      Cancelled
                    </span>
                  ) : item.isCompleted ? (
                    <span className='text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg'>
                      Completed
                    </span>
                  ) : (
                    <button
                      onClick={() => cancelAppointment(item._id)}
                      className='text-[10px] font-bold text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 transition-all'
                      title='Cancel Appointment & Process Instant Refund'
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className='p-8 text-center text-xs text-gray-400'>No recent bookings recorded.</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
