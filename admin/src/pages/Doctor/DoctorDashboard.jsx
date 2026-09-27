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
    updateLiveQueue,
  } = useContext(DoctorContext)
  const { currency, slotDateFormat } = useContext(AppContext)
  const navigate = useNavigate()

  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Live Queue state
  const [currentToken, setCurrentToken] = useState(1)
  const [totalInQueue, setTotalInQueue] = useState(5)
  const [crowdStatus, setCrowdStatus] = useState('Low')
  const [roomNumber, setRoomNumber] = useState('OPD-102')

  useEffect(() => {
    if (dToken) {
      getDashData()
      if (!profileData) {
        getProfileData()
      }
    }
  }, [dToken])

  useEffect(() => {
    if (profileData) {
      if (profileData.liveQueue) {
        setCurrentToken(profileData.liveQueue.currentToken || 1)
        setTotalInQueue(profileData.liveQueue.totalInQueue || 5)
        setCrowdStatus(profileData.liveQueue.crowdStatus || 'Low')
      }
      if (profileData.roomNumber) {
        setRoomNumber(profileData.roomNumber)
      }
    }
  }, [profileData])

  const handleNextPatient = async () => {
    const nextToken = currentToken + 1
    const nextTotal = Math.max(0, totalInQueue - 1)
    let autoCrowd = crowdStatus
    if (nextTotal > 8) autoCrowd = 'Busy'
    else if (nextTotal > 3) autoCrowd = 'Moderate'
    else autoCrowd = 'Low'

    setCurrentToken(nextToken)
    setTotalInQueue(nextTotal)
    setCrowdStatus(autoCrowd)

    await updateLiveQueue({
      currentToken: nextToken,
      totalInQueue: nextTotal,
      crowdStatus: autoCrowd,
      roomNumber,
    })
    toast.success(`Calling Token #${nextToken} to ${roomNumber}!`)
  }

  const handleSaveQueue = async () => {
    await updateLiveQueue({
      currentToken: Number(currentToken),
      totalInQueue: Number(totalInQueue),
      crowdStatus,
      roomNumber,
    })
  }

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
    if (window.confirm('Are you sure you want to cancel this appointment? 100% refund will be issued if paid.')) {
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

  return (
    <div className='w-full max-w-7xl m-4 sm:m-6 space-y-6'>
      {/* 1. Doctor Welcome Hero Card */}
      <div className='bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden'>
        <div className='absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none'></div>
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10'>
          <div>
            <div className='flex items-center gap-2 mb-2 flex-wrap'>
              <span className='px-3 py-1 rounded-full text-xs font-bold bg-indigo-700/80 text-indigo-200 border border-indigo-500/40'>
                {profileData?.speciality || 'Practicing Specialist'}
              </span>
              <span className='px-3 py-1 rounded-full text-xs font-bold bg-indigo-600/50 text-white border border-indigo-400/40'>
                Room: {roomNumber}
              </span>
              <span className='flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'>
                <span className='w-2 h-2 rounded-full bg-emerald-400 animate-pulse'></span>
                {profileData?.available !== false ? 'OPD Active' : 'Schedule Paused'}
              </span>
            </div>
            <h1 className='text-2xl sm:text-3xl font-black tracking-tight'>
              Welcome, {profileData?.name ? `Dr. ${profileData.name.replace(/^Dr\.\s*/i, '')}` : 'Doctor'}
            </h1>
            <p className='text-indigo-200 text-xs sm:text-sm mt-1 max-w-2xl'>
              Practice overview, live clinic crowd controller, and pre-consultation allergy alerts.
            </p>
          </div>

          <div className='flex items-center gap-3 self-start md:self-auto'>
            <button
              onClick={() => navigate('/doctor-appointments')}
              className='px-5 py-3 bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2'
            >
              <span>Consultation Schedule</span>
              <span>→</span>
            </button>
            <button
              onClick={() => navigate('/doctor-profile')}
              className='px-4 py-3 bg-indigo-700/60 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-2xl border border-indigo-500/40 transition-all'
            >
              ⚙ Profile
            </button>
          </div>
        </div>
      </div>

      {/* 2. Live OPD Crowd & Queue Controller Widget */}
      <div className='bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-lg border border-indigo-500/30'>
        <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-6'>
          <div className='flex items-center gap-4'>
            <div className='w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-3xl shadow-inner'>
              📢
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <h2 className='text-lg font-black'>Live Clinic Queue & Crowd Controller</h2>
                <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${
                  crowdStatus === 'Low'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                    : crowdStatus === 'Moderate'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-400/40'
                }`}>
                  {crowdStatus} Crowd
                </span>
              </div>
              <p className='text-xs text-indigo-200 mt-0.5'>
                Patients see this live token and crowd status when booking slots.
              </p>
            </div>
          </div>

          {/* Controller Inputs & Actions */}
          <div className='flex flex-wrap items-center gap-3'>
            <div className='bg-white/10 px-4 py-2 rounded-2xl border border-white/15 text-center'>
              <p className='text-[10px] text-indigo-300 uppercase font-bold'>Current Token</p>
              <div className='flex items-center gap-2 justify-center mt-0.5'>
                <button
                  type='button'
                  onClick={() => setCurrentToken((prev) => Math.max(1, prev - 1))}
                  className='w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 text-xs font-black'
                >
                  -
                </button>
                <span className='text-xl font-black text-white font-mono'>#{currentToken}</span>
                <button
                  type='button'
                  onClick={() => setCurrentToken((prev) => prev + 1)}
                  className='w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 text-xs font-black'
                >
                  +
                </button>
              </div>
            </div>

            <div className='bg-white/10 px-4 py-2 rounded-2xl border border-white/15 text-center'>
              <p className='text-[10px] text-indigo-300 uppercase font-bold'>In Waiting Queue</p>
              <div className='flex items-center gap-2 justify-center mt-0.5'>
                <button
                  type='button'
                  onClick={() => setTotalInQueue((prev) => Math.max(0, prev - 1))}
                  className='w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 text-xs font-black'
                >
                  -
                </button>
                <span className='text-xl font-black text-emerald-300 font-mono'>{totalInQueue}</span>
                <button
                  type='button'
                  onClick={() => setTotalInQueue((prev) => prev + 1)}
                  className='w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 text-xs font-black'
                >
                  +
                </button>
              </div>
            </div>

            <div className='bg-white/10 px-3 py-2 rounded-2xl border border-white/15'>
              <p className='text-[10px] text-indigo-300 uppercase font-bold mb-1'>Crowd Level</p>
              <select
                value={crowdStatus}
                onChange={(e) => setCrowdStatus(e.target.value)}
                className='bg-slate-900 text-white text-xs font-bold rounded-lg p-1.5 outline-none border border-white/20'
              >
                <option value='Low'>🟢 Low Crowd (&lt; 15 min)</option>
                <option value='Moderate'>🟡 Moderate (&lt; 30 min)</option>
                <option value='Busy'>🔴 Busy (&gt; 45 min)</option>
              </select>
            </div>

            <button
              type='button'
              onClick={handleNextPatient}
              className='px-5 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2'
            >
              <span>Call Next Token 📢</span>
            </button>

            <button
              type='button'
              onClick={handleSaveQueue}
              className='px-4 py-3.5 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-2xl border border-white/20 transition-all'
            >
              Save Status
            </button>
          </div>
        </div>
      </div>

      {/* 3. Elevated KPI Metric Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {/* Total Earnings */}
        <div className='bg-white p-5 rounded-3xl border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow'>
          <div className='flex items-center justify-between'>
            <div className='w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100'>
              <img src={assets.earning_icon} className='w-6 h-6' alt='Earnings' />
            </div>
            <span className='text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200'>
              Direct Payouts
            </span>
          </div>
          <div className='mt-4'>
            <p className='text-xs font-bold text-gray-500 uppercase tracking-wider'>Total Earnings</p>
            <p className='text-2xl font-black text-gray-900 mt-1'>
              {currency} {dashData.earnings}
            </p>
            <p className='text-[11px] text-gray-400 mt-1'>From completed & paid consultations</p>
          </div>
        </div>

        {/* Total Appointments */}
        <div className='bg-white p-5 rounded-3xl border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow'>
          <div className='flex items-center justify-between'>
            <div className='w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100'>
              <img src={assets.appointments_icon} className='w-6 h-6' alt='Appointments' />
            </div>
            <span className='text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200'>
              {pendingCount} Pending Today
            </span>
          </div>
          <div className='mt-4'>
            <p className='text-xs font-bold text-gray-500 uppercase tracking-wider'>Appointments</p>
            <p className='text-2xl font-black text-gray-900 mt-1'>{dashData.appointments}</p>
            <p className='text-[11px] text-gray-400 mt-1'>{completedCount} completed sessions</p>
          </div>
        </div>

        {/* Total Patients */}
        <div className='bg-white p-5 rounded-3xl border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow'>
          <div className='flex items-center justify-between'>
            <div className='w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center border border-sky-100'>
              <img src={assets.patients_icon} className='w-6 h-6' alt='Patients' />
            </div>
            <span className='text-[10px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200'>
              Active Roster
            </span>
          </div>
          <div className='mt-4'>
            <p className='text-xs font-bold text-gray-500 uppercase tracking-wider'>Total Patients</p>
            <p className='text-2xl font-black text-gray-900 mt-1'>{dashData.patients}</p>
            <p className='text-[11px] text-gray-400 mt-1'>Unique patients treated</p>
          </div>
        </div>

        {/* Clinical Rating & Trust */}
        <div className='bg-white p-5 rounded-3xl border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow'>
          <div className='flex items-center justify-between'>
            <div className='w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100 text-amber-500 text-xl font-bold'>
              ★
            </div>
            <span className='text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200'>
              98% Satisfaction
            </span>
          </div>
          <div className='mt-4'>
            <p className='text-xs font-bold text-gray-500 uppercase tracking-wider'>Clinical Rating</p>
            <p className='text-2xl font-black text-gray-900 mt-1'>4.9 / 5.0</p>
            <p className='text-[11px] text-gray-400 mt-1'>Top-rated patient feedback</p>
          </div>
        </div>
      </div>

      {/* 4. Consultation Queue with Allergy Warnings */}
      <div className='bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden'>
        {/* Header & Controls */}
        <div className='p-5 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50'>
          <div className='flex items-center gap-3'>
            <div className='p-2.5 bg-indigo-50 rounded-xl'>
              <img src={assets.list_icon} className='w-5 h-5' alt='' />
            </div>
            <div>
              <h2 className='font-black text-gray-900 text-lg'>Recent Consultation Queue</h2>
              <p className='text-xs text-gray-500'>Showing latest appointments with pre-consultation allergy alerts</p>
            </div>
          </div>

          {/* Search Bar */}
          <input
            type='text'
            placeholder='Search patient name or date...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='text-xs px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 w-full sm:w-60 bg-white'
          />
        </div>

        {/* Filter Tabs */}
        <div className='flex items-center gap-2 px-6 py-3 border-b border-gray-100 text-xs overflow-x-auto bg-white'>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              activeFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({appointmentsList.length})
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              activeFilter === 'pending'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              activeFilter === 'completed'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Completed ({completedCount})
          </button>
          {cancelledCount > 0 && (
            <button
              onClick={() => setActiveFilter('cancelled')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                activeFilter === 'cancelled'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Cancelled ({cancelledCount})
            </button>
          )}
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className='p-16 text-center text-gray-400'>
            <p className='text-3xl mb-2'>🩺</p>
            <p className='font-bold text-gray-700 text-sm'>No matching consultations found</p>
            <p className='text-xs text-gray-400 mt-1'>
              {searchQuery ? 'Try changing your search query or filter.' : 'New patient appointments will appear here.'}
            </p>
          </div>
        ) : (
          <div className='divide-y divide-gray-100 max-h-[500px] overflow-y-auto'>
            {filteredAppointments.map((item, index) => {
              const hasAllergies = item.userData?.allergies && item.userData.allergies.length > 0

              return (
                <div
                  key={index}
                  className='p-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/80 transition-colors'
                >
                  {/* Patient info & Token */}
                  <div className='flex items-center gap-3.5'>
                    <div className='w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-primary font-black text-xs flex items-center justify-center font-mono'>
                      #{item.tokenNumber || index + 1}
                    </div>
                    <UserIdentity name={item.userData?.name || 'Patient'} className='w-10 h-10 text-sm' />
                    <div>
                      <div className='flex items-center gap-2 flex-wrap'>
                        <p className='text-sm font-bold text-gray-900'>{item.userData?.name || 'Patient'}</p>
                        {hasAllergies && (
                          <span className='px-2 py-0.5 bg-red-100 text-red-700 border border-red-200 rounded-md text-[10px] font-bold'>
                            ⚠️ Allergy: {item.userData.allergies.join(', ')}
                          </span>
                        )}
                      </div>
                      <p className='text-xs text-gray-500 mt-0.5'>
                        {slotDateFormat(item.slotDate)} • <span className='font-bold text-indigo-600'>{item.slotTime}</span>
                        {item.userData?.bloodGroup && ` • Blood: ${item.userData.bloodGroup}`}
                      </p>
                    </div>
                  </div>

                  {/* Fees & Payment badge */}
                  <div className='flex items-center justify-between md:justify-end gap-4'>
                    <div className='text-left md:text-right'>
                      <p className='text-xs font-black text-gray-900'>
                        {currency} {item.amount}
                      </p>
                      {item.payment ? (
                        <span className='text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block'>
                          ✓ Paid ({item.paymentMethod || 'Online'})
                        </span>
                      ) : item.cancelled ? (
                        <span className='text-[10px] text-gray-400 font-medium inline-block'>
                          {item.refundStatus === 'Refunded' ? 'Refunded' : 'Cancelled'}
                        </span>
                      ) : (
                        <div className='flex items-center gap-1.5 mt-0.5'>
                          <span className='text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200'>
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
                    <div className='flex items-center gap-2'>
                      {item.cancelled ? (
                        <span className='text-xs font-bold px-3 py-1 bg-rose-50 text-rose-600 rounded-xl border border-rose-200'>
                          Cancelled
                        </span>
                      ) : item.isCompleted ? (
                        <span className='text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 flex items-center gap-1'>
                          <span>✓</span> Completed
                        </span>
                      ) : (
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => handleCancel(item._id)}
                            className='text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl font-bold transition-colors'
                            title='Cancel appointment'
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleComplete(item._id)}
                            className='text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl font-bold shadow-sm transition-colors'
                            title='Mark consultation complete'
                          >
                            Complete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Card Footer */}
        <div className='p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500'>
          <span>Showing latest patient consultation queue</span>
          <button
            onClick={() => navigate('/doctor-appointments')}
            className='text-indigo-600 font-bold hover:text-indigo-800 transition-colors'
          >
            View Full Clinical Schedule & Issue Rx →
          </button>
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard
