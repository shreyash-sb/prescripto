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

  // Live Token Queue state (Streamlined - No crowd clutter)
  const [currentToken, setCurrentToken] = useState(1)
  const [totalInQueue, setTotalInQueue] = useState(5)
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
      }
      if (profileData.roomNumber) {
        setRoomNumber(profileData.roomNumber)
      }
    }
  }, [profileData])

  const handleNextPatient = async () => {
    const nextToken = currentToken + 1
    const nextTotal = Math.max(0, totalInQueue - 1)

    setCurrentToken(nextToken)
    setTotalInQueue(nextTotal)

    await updateLiveQueue({
      currentToken: nextToken,
      totalInQueue: nextTotal,
      roomNumber,
    })
    toast.success(`📢 Token #${nextToken} called to Room ${roomNumber}!`)
  }

  const handleSaveToken = async () => {
    await updateLiveQueue({
      currentToken: Number(currentToken),
      totalInQueue: Number(totalInQueue),
      roomNumber,
    })
    toast.success('Token queue status updated!')
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
      <div className='p-8 text-center bg-white rounded-2xl border shadow-sm'>
        <div className='inline-block animate-spin rounded-full h-7 w-7 border-4 border-indigo-500 border-t-transparent'></div>
        <p className='mt-2.5 text-xs text-gray-500 font-semibold'>Loading clinical workspace...</p>
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
    <div className='w-full max-w-7xl space-y-4'>
      {/* 1. Doctor Welcome Hero Card (Compact & Modern) */}
      <div className='bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden'>
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10'>
          <div>
            <div className='flex items-center gap-2 mb-1.5 flex-wrap'>
              <span className='px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-700/80 text-indigo-200 border border-indigo-500/40'>
                {profileData?.speciality || 'Specialist Doctor'}
              </span>
              <span className='px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-600/50 text-white border border-indigo-400/40'>
                Room: {roomNumber}
              </span>
              <span className='flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'>
                <span className='w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse'></span>
                {profileData?.available !== false ? 'OPD Active' : 'Schedule Paused'}
              </span>
            </div>
            <h1 className='text-xl sm:text-2xl font-black tracking-tight'>
              Welcome, {profileData?.name ? `Dr. ${profileData.name.replace(/^Dr\.\s*/i, '')}` : 'Doctor'}
            </h1>
            <p className='text-indigo-200 text-xs mt-0.5'>
              Clinical consultation queue, live token calling, and instant e-prescriptions.
            </p>
          </div>

          <div className='flex items-center gap-2.5 self-start md:self-auto'>
            <button
              onClick={() => navigate('/doctor-appointments')}
              className='px-4 py-2 bg-white text-indigo-950 hover:bg-indigo-50 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5'
            >
              <span>Full Schedule & Rx</span>
              <span>→</span>
            </button>
            <button
              onClick={() => navigate('/doctor-profile')}
              className='px-3.5 py-2 bg-indigo-700/60 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl border border-indigo-500/40 transition-all'
            >
              ⚙ Shifts
            </button>
          </div>
        </div>
      </div>

      {/* 2. Live Token Dispatcher & Next Patient Caller (Streamlined) */}
      <div className='bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-4 sm:p-5 rounded-2xl shadow border border-indigo-500/30 flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
        <div className='flex items-center gap-3.5'>
          <div className='w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-2xl shadow-inner'>
            📢
          </div>
          <div>
            <h2 className='text-sm sm:text-base font-black'>Live OPD Token Dispatcher</h2>
            <p className='text-xs text-indigo-200 mt-0.5'>
              Click "Call Next Token" to advance patient queue and notify the waiting area.
            </p>
          </div>
        </div>

        {/* Token Counter & Action */}
        <div className='flex flex-wrap items-center gap-3'>
          {/* Current Token */}
          <div className='bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/15 text-center'>
            <p className='text-[10px] text-indigo-300 uppercase font-bold'>Current Token</p>
            <div className='flex items-center gap-2 justify-center mt-0.5'>
              <button
                type='button'
                onClick={() => setCurrentToken((prev) => Math.max(1, prev - 1))}
                className='w-5 h-5 rounded-md bg-white/20 hover:bg-white/30 text-xs font-black'
              >
                -
              </button>
              <span className='text-lg font-black text-white font-mono'>#{currentToken}</span>
              <button
                type='button'
                onClick={() => setCurrentToken((prev) => prev + 1)}
                className='w-5 h-5 rounded-md bg-white/20 hover:bg-white/30 text-xs font-black'
              >
                +
              </button>
            </div>
          </div>

          {/* Patients in Waiting Queue */}
          <div className='bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/15 text-center'>
            <p className='text-[10px] text-indigo-300 uppercase font-bold'>In Queue</p>
            <div className='flex items-center gap-2 justify-center mt-0.5'>
              <button
                type='button'
                onClick={() => setTotalInQueue((prev) => Math.max(0, prev - 1))}
                className='w-5 h-5 rounded-md bg-white/20 hover:bg-white/30 text-xs font-black'
              >
                -
              </button>
              <span className='text-lg font-black text-emerald-300 font-mono'>{totalInQueue}</span>
              <button
                type='button'
                onClick={() => setTotalInQueue((prev) => prev + 1)}
                className='w-5 h-5 rounded-md bg-white/20 hover:bg-white/30 text-xs font-black'
              >
                +
              </button>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type='button'
            onClick={handleNextPatient}
            className='px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl shadow transition-all flex items-center gap-1.5'
          >
            <span>Call Next Token</span>
            <span>📢</span>
          </button>

          <button
            type='button'
            onClick={handleSaveToken}
            className='px-3 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl border border-white/20 transition-all'
            title='Save current token number'
          >
            Save
          </button>
        </div>
      </div>

      {/* 3. KPI Metric Cards (Compact & Crisp) */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3.5'>
        {/* Total Earnings */}
        <div className='bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-[11px] font-bold text-gray-500 uppercase tracking-wider'>Total Earnings</p>
            <p className='text-xl font-black text-gray-900 mt-0.5'>
              {currency} {dashData.earnings}
            </p>
            <span className='text-[10px] text-emerald-700 font-semibold'>Direct consultation income</span>
          </div>
          <div className='w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 flex-shrink-0'>
            <img src={assets.earning_icon} className='w-5 h-5' alt='' />
          </div>
        </div>

        {/* Total Appointments */}
        <div className='bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-[11px] font-bold text-gray-500 uppercase tracking-wider'>Appointments</p>
            <p className='text-xl font-black text-gray-900 mt-0.5'>{dashData.appointments}</p>
            <span className='text-[10px] text-indigo-600 font-semibold'>{pendingCount} Pending</span>
          </div>
          <div className='w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 flex-shrink-0'>
            <img src={assets.appointments_icon} className='w-5 h-5' alt='' />
          </div>
        </div>

        {/* Total Patients */}
        <div className='bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-[11px] font-bold text-gray-500 uppercase tracking-wider'>Patients Roster</p>
            <p className='text-xl font-black text-gray-900 mt-0.5'>{dashData.patients}</p>
            <span className='text-[10px] text-sky-700 font-semibold'>Unique patients treated</span>
          </div>
          <div className='w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center border border-sky-100 flex-shrink-0'>
            <img src={assets.patients_icon} className='w-5 h-5' alt='' />
          </div>
        </div>

        {/* Completed Rate */}
        <div className='bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-[11px] font-bold text-gray-500 uppercase tracking-wider'>Completed</p>
            <p className='text-xl font-black text-emerald-700 mt-0.5'>{completedCount}</p>
            <span className='text-[10px] text-gray-400 font-semibold'>{cancelledCount} Cancelled</span>
          </div>
          <div className='w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100 text-amber-500 font-bold text-lg flex-shrink-0'>
            ✓
          </div>
        </div>
      </div>

      {/* 4. Consultation Queue (Clean & Modern Table) */}
      <div className='bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden'>
        {/* Header & Controls */}
        <div className='p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/60'>
          <div className='flex items-center gap-2.5'>
            <div className='p-2 bg-indigo-50 rounded-lg text-primary text-sm'>📋</div>
            <div>
              <h2 className='font-bold text-gray-900 text-sm'>Recent Consultations</h2>
              <p className='text-[11px] text-gray-500'>Patient queue, drug allergy alerts, and prescription actions</p>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <input
              type='text'
              placeholder='Search patient name...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='text-xs px-3 py-1.5 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 w-full sm:w-48 bg-white'
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className='flex items-center gap-1.5 px-4 py-2 border-b border-gray-100 text-xs bg-white'>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              activeFilter === 'all'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({appointmentsList.length})
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              activeFilter === 'pending'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              activeFilter === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Completed ({completedCount})
          </button>
          {cancelledCount > 0 && (
            <button
              onClick={() => setActiveFilter('cancelled')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeFilter === 'cancelled'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Cancelled ({cancelledCount})
            </button>
          )}
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className='p-10 text-center text-gray-400'>
            <p className='text-2xl mb-1'>🩺</p>
            <p className='font-bold text-gray-700 text-xs'>No consultations matching criteria</p>
          </div>
        ) : (
          <div className='divide-y divide-gray-100 max-h-[460px] overflow-y-auto'>
            {filteredAppointments.map((item, index) => {
              const hasAllergies = item.userData?.allergies && item.userData.allergies.length > 0

              return (
                <div
                  key={index}
                  className='p-3.5 sm:px-5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-gray-50/80 transition-colors'
                >
                  {/* Patient info & Token */}
                  <div className='flex items-center gap-3'>
                    <div className='w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-primary font-black text-xs flex items-center justify-center font-mono'>
                      #{item.tokenNumber || index + 1}
                    </div>
                    <UserIdentity name={item.userData?.name || 'Patient'} className='w-9 h-9 text-xs' />
                    <div>
                      <div className='flex items-center gap-1.5 flex-wrap'>
                        <p className='text-xs sm:text-sm font-bold text-gray-900'>{item.userData?.name || 'Patient'}</p>
                        {hasAllergies && (
                          <span className='px-1.5 py-0.5 bg-red-100 text-red-700 border border-red-200 rounded text-[9px] font-bold'>
                            ⚠️ Allergy: {item.userData.allergies.join(', ')}
                          </span>
                        )}
                      </div>
                      <p className='text-[11px] text-gray-500 mt-0.5'>
                        {slotDateFormat(item.slotDate)} • <span className='font-bold text-indigo-600'>{item.slotTime}</span>
                        {item.userData?.bloodGroup && ` • ${item.userData.bloodGroup}`}
                      </p>
                    </div>
                  </div>

                  {/* Fees & Payment badge */}
                  <div className='flex items-center justify-between md:justify-end gap-3.5'>
                    <div className='text-left md:text-right'>
                      <p className='text-xs font-black text-gray-900'>
                        {currency} {item.amount}
                      </p>
                      {item.payment ? (
                        <span className='text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block'>
                          ✓ Paid
                        </span>
                      ) : item.cancelled ? (
                        <span className='text-[10px] text-gray-400 font-medium inline-block'>Cancelled</span>
                      ) : (
                        <div className='flex items-center gap-1 mt-0.5'>
                          <span className='text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200'>
                            Unpaid
                          </span>
                          <button
                            onClick={() => handleCollectCash(item._id)}
                            className='text-[9px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-1.5 py-0.5 rounded shadow-xs'
                            title='Collect cash at clinic'
                          >
                            Collect
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className='flex items-center gap-1.5'>
                      {item.cancelled ? (
                        <span className='text-xs font-bold px-2.5 py-0.5 bg-rose-50 text-rose-600 rounded-lg border border-rose-200'>
                          Cancelled
                        </span>
                      ) : item.isCompleted ? (
                        <span className='text-xs font-bold px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 flex items-center gap-1'>
                          ✓ Done
                        </span>
                      ) : (
                        <div className='flex items-center gap-1.5'>
                          <button
                            onClick={() => handleCancel(item._id)}
                            className='text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg font-bold transition-colors'
                            title='Cancel appointment'
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleComplete(item._id)}
                            className='text-xs bg-primary hover:bg-indigo-700 text-white px-3 py-1 rounded-lg font-bold shadow-xs transition-colors'
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

        {/* Footer */}
        <div className='p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500'>
          <span>Showing consultation queue</span>
          <button
            onClick={() => navigate('/doctor-appointments')}
            className='text-primary font-bold hover:underline'
          >
            Open Full Clinical Schedule →
          </button>
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard
