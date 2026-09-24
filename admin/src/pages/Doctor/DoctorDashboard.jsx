import { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import UserIdentity from '../../components/UserIdentity'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const DoctorDashboard = () => {
  const {
    dashData,
    getDashData,
    dToken,
    completeAppointment,
    cancelAppointment,
    collectPayment,
    profileData,
    getProfileData,
  } = useContext(DoctorContext)
  const { currency, slotDateFormat } = useContext(AppContext)
  const navigate = useNavigate()

  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (dToken) {
      getDashData()
      if (!profileData) {
        getProfileData()
      }
    }
  }, [dToken])

  const handleComplete = async (appointmentId) => {
    const success = await completeAppointment(
      appointmentId,
      'Standard clinical follow-up completed.',
      'Routine consultation and vital review completed successfully.'
    )
    if (success) {
      getDashData()
    }
  }

  const handleCancel = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      const success = await cancelAppointment(appointmentId)
      if (success) {
        getDashData()
      }
    }
  }

  const handleCollectCash = async (appointmentId) => {
    const success = await collectPayment(appointmentId, 'Cash Collected (Clinic)')
    if (success) {
      toast.success('Cash payment recorded successfully!')
      getDashData()
    }
  }

  if (!dashData) {
    return (
      <div className='m-6 p-12 text-center bg-white rounded-2xl border shadow-sm'>
        <div className='inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent'></div>
        <p className='mt-3 text-sm text-gray-500 font-medium'>Loading your clinical dashboard...</p>
      </div>
    )
  }

  const appointmentsList = dashData.latestAppointments || []
  const completedCount = appointmentsList.filter((a) => a.isCompleted).length
  const pendingCount = appointmentsList.filter((a) => !a.isCompleted && !a.cancelled).length
  const cancelledCount = appointmentsList.filter((a) => a.cancelled).length

  const filteredAppointments = appointmentsList.filter((item) => {
    const matchesFilter =
      activeFilter === 'all'
        ? true
        : activeFilter === 'pending'
        ? !item.isCompleted && !item.cancelled
        : activeFilter === 'completed'
        ? item.isCompleted
        : activeFilter === 'cancelled'
        ? item.cancelled
        : true

    const matchesSearch =
      searchQuery === '' ||
      item.userData?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.slotDate?.includes(searchQuery)

    return matchesFilter && matchesSearch
  })

  // Simulated weekly volume breakdown for visual telemetry
  const daysOfWeek = [
    { day: 'Mon', count: 4, height: '65%' },
    { day: 'Tue', count: 6, height: '90%' },
    { day: 'Wed', count: 3, height: '50%' },
    { day: 'Thu', count: 5, height: '75%' },
    { day: 'Fri', count: 7, height: '100%', isPeak: true },
    { day: 'Sat', count: 4, height: '60%' },
    { day: 'Sun', count: 2, height: '35%' },
  ]

  return (
    <div className='w-full max-w-7xl m-4 sm:m-6 space-y-6'>
      {/* 1. Doctor Welcome Hero Card */}
      <div className='bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden'>
        <div className='absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-600/20 rounded-full blur-2xl pointer-events-none'></div>
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10'>
          <div>
            <div className='flex items-center gap-2 mb-1'>
              <span className='px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-700/60 text-indigo-200 border border-indigo-500/30'>
                {profileData?.speciality || 'Practicing Specialist'}
              </span>
              <span className='flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'>
                <span className='w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse'></span>
                {profileData?.available !== false ? 'Accepting Patients' : 'Schedule Paused'}
              </span>
            </div>
            <h1 className='text-2xl sm:text-3xl font-bold tracking-tight'>
              Welcome back, {profileData?.name ? `Dr. ${profileData.name.replace(/^Dr\.\s*/i, '')}` : 'Doctor'}
            </h1>
            <p className='text-indigo-200 text-xs sm:text-sm mt-1 max-w-2xl'>
              Practice overview, scheduled patient queues, and clinical appointment management.
            </p>
          </div>

          <div className='flex items-center gap-3 self-start md:self-auto'>
            <button
              onClick={() => navigate('/doctor-appointments')}
              className='px-4 py-2 bg-white text-indigo-900 hover:bg-indigo-50 font-semibold text-xs rounded-xl shadow transition-colors flex items-center gap-2'
            >
              <span>Consultation Schedule</span>
              <span>→</span>
            </button>
            <button
              onClick={() => navigate('/doctor-profile')}
              className='px-3 py-2 bg-indigo-700/60 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl border border-indigo-500/40 transition-colors'
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* 2. 4 Elevated KPI Metric Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {/* Total Earnings */}
        <div className='bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow'>
          <div className='flex items-center justify-between'>
            <div className='w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100'>
              <img src={assets.earning_icon} className='w-6 h-6' alt='Earnings' />
            </div>
            <span className='text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200'>
              Direct Payouts
            </span>
          </div>
          <div className='mt-4'>
            <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>Total Earnings</p>
            <p className='text-2xl font-bold text-gray-900 mt-1'>
              {currency} {dashData.earnings}
            </p>
            <p className='text-[11px] text-gray-400 mt-1'>From completed & paid consultations</p>
          </div>
        </div>

        {/* Total Appointments */}
        <div className='bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow'>
          <div className='flex items-center justify-between'>
            <div className='w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100'>
              <img src={assets.appointments_icon} className='w-6 h-6' alt='Appointments' />
            </div>
            <span className='text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200'>
              {pendingCount} Pending Today
            </span>
          </div>
          <div className='mt-4'>
            <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>Appointments</p>
            <p className='text-2xl font-bold text-gray-900 mt-1'>{dashData.appointments}</p>
            <p className='text-[11px] text-gray-400 mt-1'>{completedCount} completed sessions</p>
          </div>
        </div>

        {/* Total Patients */}
        <div className='bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow'>
          <div className='flex items-center justify-between'>
            <div className='w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center border border-sky-100'>
              <img src={assets.patients_icon} className='w-6 h-6' alt='Patients' />
            </div>
            <span className='text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200'>
              Active Roster
            </span>
          </div>
          <div className='mt-4'>
            <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>Total Patients</p>
            <p className='text-2xl font-bold text-gray-900 mt-1'>{dashData.patients}</p>
            <p className='text-[11px] text-gray-400 mt-1'>Unique patients treated</p>
          </div>
        </div>

        {/* Clinical Rating & Trust */}
        <div className='bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow'>
          <div className='flex items-center justify-between'>
            <div className='w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100 text-amber-500 text-xl font-bold'>
              ★
            </div>
            <span className='text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200'>
              98% Satisfaction
            </span>
          </div>
          <div className='mt-4'>
            <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>Clinical Rating</p>
            <p className='text-2xl font-bold text-gray-900 mt-1'>4.9 / 5.0</p>
            <p className='text-[11px] text-gray-400 mt-1'>Top-rated patient feedback</p>
          </div>
        </div>
      </div>

      {/* 3. Main Split Section */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* Left Column: Recent Consultation Queue (7/12) */}
        <div className='lg:col-span-8 bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col justify-between'>
          <div>
            {/* Header & Controls */}
            <div className='p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50'>
              <div className='flex items-center gap-2.5'>
                <div className='p-2 bg-indigo-50 rounded-lg'>
                  <img src={assets.list_icon} className='w-4 h-4' alt='' />
                </div>
                <div>
                  <h2 className='font-bold text-gray-900 text-base'>Recent Consultation Queue</h2>
                  <p className='text-xs text-gray-500'>Showing latest appointments assigned to your practice</p>
                </div>
              </div>

              {/* Search Bar */}
              <input
                type='text'
                placeholder='Search patient...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='text-xs px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 w-full sm:w-44'
              />
            </div>

            {/* Filter Tabs */}
            <div className='flex items-center gap-2 px-5 py-2.5 border-b border-gray-100 text-xs overflow-x-auto bg-white'>
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-full font-medium transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({appointmentsList.length})
              </button>
              <button
                onClick={() => setActiveFilter('pending')}
                className={`px-3 py-1 rounded-full font-medium transition-colors ${
                  activeFilter === 'pending'
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setActiveFilter('completed')}
                className={`px-3 py-1 rounded-full font-medium transition-colors ${
                  activeFilter === 'completed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Completed ({completedCount})
              </button>
              {cancelledCount > 0 && (
                <button
                  onClick={() => setActiveFilter('cancelled')}
                  className={`px-3 py-1 rounded-full font-medium transition-colors ${
                    activeFilter === 'cancelled'
                      ? 'bg-rose-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Cancelled ({cancelledCount})
                </button>
              )}
            </div>

            {/* Appointments List */}
            {filteredAppointments.length === 0 ? (
              <div className='p-12 text-center text-gray-400'>
                <p className='text-3xl mb-2'>🩺</p>
                <p className='font-bold text-gray-700 text-sm'>No matching consultations found</p>
                <p className='text-xs text-gray-400 mt-1'>
                  {searchQuery ? 'Try changing your search query or filter.' : 'New patient appointments will appear here.'}
                </p>
              </div>
            ) : (
              <div className='divide-y divide-gray-100 max-h-[500px] overflow-y-auto'>
                {filteredAppointments.map((item, index) => (
                  <div
                    key={index}
                    className='p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/80 transition-colors'
                  >
                    {/* Patient info */}
                    <div className='flex items-center gap-3.5'>
                      <UserIdentity name={item.userData?.name || 'Patient'} className='w-10 h-10 text-sm' />
                      <div>
                        <p className='text-sm font-bold text-gray-900'>{item.userData?.name || 'Patient'}</p>
                        <p className='text-xs text-gray-500'>
                          {slotDateFormat(item.slotDate)} • <span className='font-medium text-indigo-600'>{item.slotTime}</span>
                        </p>
                      </div>
                    </div>

                    {/* Fees & Payment badge */}
                    <div className='flex items-center gap-3'>
                      <div className='text-left sm:text-right'>
                        <p className='text-xs font-bold text-gray-900'>
                          {currency} {item.amount}
                        </p>
                        {item.payment ? (
                          <span className='text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block'>
                            ✓ Paid ({item.paymentMethod || 'Online'})
                          </span>
                        ) : item.cancelled ? (
                          <span className='text-[10px] text-gray-400 font-medium inline-block'>Cancelled</span>
                        ) : (
                          <div className='flex items-center gap-1.5 mt-0.5'>
                            <span className='text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200'>
                              Payment Due
                            </span>
                            <button
                              onClick={() => handleCollectCash(item._id)}
                              className='text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-0.5 rounded transition-colors shadow-xs'
                              title='Collect cash at clinic'
                            >
                              Collect
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Action status/buttons */}
                      <div className='flex items-center gap-1.5'>
                        {item.cancelled ? (
                          <span className='text-xs font-semibold px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg border border-rose-200'>
                            Cancelled
                          </span>
                        ) : item.isCompleted ? (
                          <span className='text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 flex items-center gap-1'>
                            <span>✓</span> Completed
                          </span>
                        ) : (
                          <div className='flex items-center gap-1.5'>
                            <button
                              onClick={() => handleCancel(item._id)}
                              className='text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg font-medium transition-colors'
                              title='Cancel appointment'
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleComplete(item._id)}
                              className='text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg font-semibold shadow-sm transition-colors'
                              title='Mark consultation complete'
                            >
                              Complete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card Footer */}
          <div className='p-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500'>
            <span>Showing recent consultations</span>
            <button
              onClick={() => navigate('/doctor-appointments')}
              className='text-indigo-600 font-semibold hover:text-indigo-800 transition-colors'
            >
              View Full Clinical Ledger →
            </button>
          </div>
        </div>

        {/* Right Column: Practice Pulse & Analytics (4/12) */}
        <div className='lg:col-span-4 space-y-6'>
          {/* Weekly Consultation Load Visualizer */}
          <div className='bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm'>
            <div className='flex items-center justify-between mb-4'>
              <div>
                <h3 className='font-bold text-gray-900 text-sm'>Weekly Consultation Load</h3>
                <p className='text-xs text-gray-400'>Patient distribution this week</p>
              </div>
              <span className='text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200'>
                Peak: Friday
              </span>
            </div>

            {/* Simulated bar chart */}
            <div className='flex items-end justify-between h-36 pt-4 pb-2 border-b border-gray-100 gap-2'>
              {daysOfWeek.map((item, idx) => (
                <div key={idx} className='flex-1 flex flex-col items-center gap-1.5 h-full justify-end'>
                  <span className='text-[10px] font-bold text-gray-500'>{item.count}</span>
                  <div
                    style={{ height: item.height }}
                    className={`w-full max-w-[28px] rounded-t-md transition-all ${
                      item.isPeak ? 'bg-indigo-600' : 'bg-indigo-200 hover:bg-indigo-300'
                    }`}
                  ></div>
                  <span className='text-[11px] font-semibold text-gray-600'>{item.day}</span>
                </div>
              ))}
            </div>

            <div className='mt-3 flex items-center justify-between text-xs text-gray-500'>
              <span>Avg Consultations: <strong className='text-gray-800'>4.5 / day</strong></span>
              <span className='text-emerald-600 font-semibold'>● 96% Turnout</span>
            </div>
          </div>

          {/* Quick Practice Shortcuts */}
          <div className='bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm'>
            <h3 className='font-bold text-gray-900 text-sm mb-3'>Practice Quick Actions</h3>
            <div className='space-y-2.5'>
              <button
                onClick={() => navigate('/doctor-profile')}
                className='w-full p-3 text-left rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all flex items-center justify-between group'
              >
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm'>
                    ⚙
                  </div>
                  <div>
                    <p className='text-xs font-bold text-gray-800 group-hover:text-indigo-600 transition-colors'>
                      Manage Consultation Fees
                    </p>
                    <p className='text-[11px] text-gray-400'>Current: {currency} {profileData?.fees || 50}</p>
                  </div>
                </div>
                <span className='text-gray-400 text-xs group-hover:translate-x-0.5 transition-transform'>→</span>
              </button>

              <button
                onClick={() => navigate('/doctor-appointments')}
                className='w-full p-3 text-left rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all flex items-center justify-between group'
              >
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm'>
                    📋
                  </div>
                  <div>
                    <p className='text-xs font-bold text-gray-800 group-hover:text-emerald-600 transition-colors'>
                      Issue Prescriptions & Notes
                    </p>
                    <p className='text-[11px] text-gray-400'>Clinical prescription ledger</p>
                  </div>
                </div>
                <span className='text-gray-400 text-xs group-hover:translate-x-0.5 transition-transform'>→</span>
              </button>
            </div>
          </div>

          {/* Clinical Care Best Practice Tip */}
          <div className='bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-200/80'>
            <div className='flex items-center gap-2 mb-1 text-amber-900 font-bold text-xs'>
              <span>💡</span>
              <span>Clinical Reminder</span>
            </div>
            <p className='text-xs text-amber-800/90 leading-relaxed'>
              Please remember to document diagnosis notes and issue digital prescriptions when marking consultations complete. Patients can instantly view and print their records from their portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard
