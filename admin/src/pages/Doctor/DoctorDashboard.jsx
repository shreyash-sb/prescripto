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
    acceptAppointment,
    rejectAppointment,
    collectPayment,
    profileData,
    getProfileData,
    updateLiveQueue,
  } = useContext(DoctorContext)
  const { currency, slotDateFormat, calculateAge } = useContext(AppContext)
  const navigate = useNavigate()

  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals for Case & Reject Workflow
  const [selectedCaseAppt, setSelectedCaseAppt] = useState(null)
  const [rejectingAppt, setRejectingAppt] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isActionLoading, setIsActionLoading] = useState(false)

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

  const handleAccept = async (appointmentId) => {
    setIsActionLoading(true)
    const success = await acceptAppointment(appointmentId)
    if (success) {
      if (selectedCaseAppt && selectedCaseAppt._id === appointmentId) {
        setSelectedCaseAppt((prev) => ({ ...prev, appointmentStatus: 'Accepted' }))
      }
      getDashData()
    }
    setIsActionLoading(false)
  }

  const handleRejectSubmit = async (e) => {
    e.preventDefault()
    if (!rejectingAppt) return

    setIsActionLoading(true)
    const success = await rejectAppointment(
      rejectingAppt._id,
      rejectionReason.trim() || 'Doctor unavailable for this slot / Clinical conflict'
    )
    if (success) {
      setRejectingAppt(null)
      setRejectionReason('')
      if (selectedCaseAppt && selectedCaseAppt._id === rejectingAppt._id) {
        setSelectedCaseAppt(null)
      }
      getDashData()
    }
    setIsActionLoading(false)
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
  const pendingCount = appointmentsList.filter((a) => !a.isCompleted && !a.cancelled && a.appointmentStatus !== 'Accepted').length
  const acceptedCount = appointmentsList.filter((a) => !a.isCompleted && !a.cancelled && a.appointmentStatus === 'Accepted').length
  const cancelledCount = appointmentsList.filter((a) => a.cancelled).length

  const filteredAppointments = appointmentsList.filter((item) => {
    const matchesFilter =
      activeFilter === 'all'
        ? true
        : activeFilter === 'pending'
        ? !item.isCompleted && !item.cancelled && item.appointmentStatus !== 'Accepted'
        : activeFilter === 'accepted'
        ? !item.isCompleted && !item.cancelled && item.appointmentStatus === 'Accepted'
        : activeFilter === 'completed'
        ? item.isCompleted
        : activeFilter === 'cancelled'
        ? item.cancelled
        : true

    const matchesSearch =
      searchQuery === '' ||
      item.userData?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.patientProblem?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
              Clinical consultation queue, 3-option case review (History/Accept/Reject), and instant e-prescriptions.
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

      {/* 2. Live Token Dispatcher & Next Patient Caller */}
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

      {/* 3. KPI Metric Cards */}
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
            <span className='text-[10px] text-indigo-600 font-semibold'>{pendingCount} New Review</span>
          </div>
          <div className='w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 flex-shrink-0'>
            <img src={assets.appointments_icon} className='w-5 h-5' alt='' />
          </div>
        </div>

        {/* Accepted / In Queue */}
        <div className='bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-[11px] font-bold text-gray-500 uppercase tracking-wider'>Accepted Active</p>
            <p className='text-xl font-black text-emerald-600 mt-0.5'>{acceptedCount}</p>
            <span className='text-[10px] text-sky-700 font-semibold'>{dashData.patients} Patients Roster</span>
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

      {/* 4. Consultation Queue (3 Options: Case & Medical History, Accept, Reject) */}
      <div className='bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden'>
        {/* Header & Controls */}
        <div className='p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/60'>
          <div className='flex items-center gap-2.5'>
            <div className='p-2 bg-indigo-50 rounded-lg text-primary text-sm'>🩺</div>
            <div>
              <h2 className='font-bold text-gray-900 text-sm'>Recent Consultations & 3-Option Case Triage</h2>
              <p className='text-[11px] text-gray-500'>
                1. Review Case & Medical History • 2. Accept Consultation • 3. Reject with Auto-Refund
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <input
              type='text'
              placeholder='Search patient or symptoms...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='text-xs px-3 py-1.5 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 w-full sm:w-56 bg-white'
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className='flex items-center gap-1.5 px-4 py-2 border-b border-gray-100 text-xs bg-white overflow-x-auto'>
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
            New Requests ({pendingCount})
          </button>
          <button
            onClick={() => setActiveFilter('accepted')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              activeFilter === 'accepted'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Accepted Active ({acceptedCount})
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              activeFilter === 'completed'
                ? 'bg-indigo-600 text-white shadow-xs'
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
              Rejected/Cancelled ({cancelledCount})
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
          <div className='divide-y divide-gray-100 max-h-[500px] overflow-y-auto'>
            {filteredAppointments.map((item, index) => {
              const hasAllergies = item.userData?.allergies && item.userData.allergies.length > 0
              const isPending = !item.cancelled && !item.isCompleted && item.appointmentStatus !== 'Accepted'
              const isAccepted = !item.cancelled && !item.isCompleted && item.appointmentStatus === 'Accepted'

              return (
                <div
                  key={index}
                  className='p-3.5 sm:px-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-gray-50/80 transition-colors'
                >
                  {/* Patient info, Problem & Token */}
                  <div className='flex items-start gap-3 max-w-xl'>
                    <div className='w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-primary font-black text-xs flex items-center justify-center font-mono shrink-0 mt-0.5'>
                      #{item.tokenNumber || index + 1}
                    </div>
                    <UserIdentity name={item.userData?.name || 'Patient'} className='w-9 h-9 text-xs shrink-0' />
                    <div>
                      <div className='flex items-center gap-1.5 flex-wrap'>
                        <p className='text-xs sm:text-sm font-bold text-gray-900'>{item.userData?.name || 'Patient'}</p>
                        {item.userData?.bloodGroup && (
                          <span className='px-1.5 py-0.2 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[9px] font-black'>
                            {item.userData.bloodGroup}
                          </span>
                        )}
                        {hasAllergies && (
                          <span className='px-1.5 py-0.2 bg-red-100 text-red-700 border border-red-200 rounded text-[9px] font-bold'>
                            ⚠️ Allergy: {item.userData.allergies.join(', ')}
                          </span>
                        )}
                        {isPending && (
                          <span className='px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-[9px] font-extrabold animate-pulse'>
                            ● Awaiting Review
                          </span>
                        )}
                        {isAccepted && (
                          <span className='px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-[9px] font-extrabold'>
                            ✓ Accepted
                          </span>
                        )}
                      </div>

                      {/* Current Patient Problem / Complaint Snippet */}
                      <p className='text-xs text-gray-700 font-medium mt-1 bg-amber-50/60 border border-amber-100 px-2 py-1 rounded-lg line-clamp-1'>
                        <strong className='text-amber-900'>Case:</strong> {item.patientProblem || 'General Health Consultation'}
                      </p>

                      <p className='text-[11px] text-gray-500 mt-1'>
                        {slotDateFormat(item.slotDate)} • <span className='font-bold text-indigo-600'>{item.slotTime}</span>
                        {item.userData?.dob && ` • ${calculateAge(item.userData.dob)} yrs`}
                      </p>
                    </div>
                  </div>

                  {/* Payment Info & 3 Options for Doctor */}
                  <div className='flex flex-wrap items-center justify-between lg:justify-end gap-3 shrink-0'>
                    <div className='text-left lg:text-right'>
                      <p className='text-xs font-black text-gray-900'>
                        {currency} {item.amount}
                      </p>
                      {item.payment ? (
                        <span className='text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block'>
                          ✓ Paid
                        </span>
                      ) : item.cancelled ? (
                        <span className='text-[10px] text-gray-400 font-medium inline-block'>
                          {item.refundStatus === 'Refunded' ? 'Refunded' : 'Cancelled'}
                        </span>
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

                    {/* 3 PRIMARY DOCTOR OPTIONS */}
                    <div className='flex items-center gap-1.5 flex-wrap'>
                      {/* OPTION 1: View Medical History & Current Case */}
                      <button
                        onClick={() => setSelectedCaseAppt(item)}
                        className='text-xs bg-indigo-50 hover:bg-indigo-100 text-primary border border-indigo-200 px-2.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1'
                        title='View Current Problem, Drug Allergies & Medical History'
                      >
                        <span>🔍 Case & History</span>
                      </button>

                      {/* If Cancelled / Rejected */}
                      {item.cancelled ? (
                        <span className='text-xs font-bold px-2.5 py-1 bg-rose-50 text-rose-600 rounded-xl border border-rose-200'>
                          {item.appointmentStatus === 'Rejected' ? '✕ Rejected' : '✕ Cancelled'}
                        </span>
                      ) : item.isCompleted ? (
                        <span className='text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 flex items-center gap-1'>
                          ✓ Completed
                        </span>
                      ) : isPending ? (
                        <>
                          {/* OPTION 2: Accept Consultation */}
                          <button
                            disabled={isActionLoading}
                            onClick={() => handleAccept(item._id)}
                            className='text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold shadow-xs transition-all flex items-center gap-1'
                            title='Accept this consultation into active schedule'
                          >
                            <span>✓ Accept</span>
                          </button>

                          {/* OPTION 3: Reject Consultation */}
                          <button
                            disabled={isActionLoading}
                            onClick={() => setRejectingAppt(item)}
                            className='text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1'
                            title='Reject consultation request & auto-refund 100% fee'
                          >
                            <span>✕ Reject</span>
                          </button>
                        </>
                      ) : (
                        /* If already Accepted by doctor */
                        <div className='flex items-center gap-1.5'>
                          <button
                            onClick={() => setRejectingAppt(item)}
                            className='text-xs text-rose-500 hover:bg-rose-50 border border-rose-200 px-2 py-1.5 rounded-xl font-bold transition-colors'
                            title='Cancel & Refund'
                          >
                            ✕
                          </button>
                          <button
                            onClick={() => handleComplete(item._id)}
                            className='text-xs bg-primary hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl font-bold shadow-xs transition-all flex items-center gap-1'
                            title='Mark complete'
                          >
                            <span>✓ Complete</span>
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
          <span>Showing consultation queue with medical history triage</span>
          <button
            onClick={() => navigate('/doctor-appointments')}
            className='text-primary font-bold hover:underline'
          >
            Open Full Clinical Schedule →
          </button>
        </div>
      </div>

      {/* 5. Patient Clinical Case & Medical History Modal */}
      {selectedCaseAppt && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto'>
          <div className='bg-white rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl border my-8'>
            <div className='flex justify-between items-center border-b pb-4 mb-4'>
              <div className='flex items-center gap-3'>
                <UserIdentity name={selectedCaseAppt.userData?.name || 'Patient'} className='w-12 h-12 text-sm' />
                <div>
                  <div className='flex items-center gap-2'>
                    <h3 className='text-xl font-black text-gray-900'>{selectedCaseAppt.userData?.name}</h3>
                    <span className='text-xs font-mono font-bold bg-indigo-50 text-primary border border-indigo-200 px-2 py-0.5 rounded'>
                      Token #{selectedCaseAppt.tokenNumber || 1}
                    </span>
                  </div>
                  <p className='text-xs text-gray-500'>
                    {selectedCaseAppt.userData?.dob && `${calculateAge(selectedCaseAppt.userData.dob)} Years`} • {selectedCaseAppt.userData?.gender || 'Gender not specified'} • Contact: {selectedCaseAppt.userData?.phone || selectedCaseAppt.userData?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCaseAppt(null)}
                className='w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold flex items-center justify-center'
              >
                ✕
              </button>
            </div>

            <div className='space-y-4 text-xs sm:text-sm max-h-[65vh] overflow-y-auto pr-1'>
              {/* Patient's Current Problem / Chief Complaint */}
              <div className='p-4.5 bg-amber-50/90 border border-amber-200 rounded-2xl'>
                <span className='text-xs font-black text-amber-900 uppercase tracking-wider block mb-1 flex items-center gap-1.5'>
                  <span>🩺</span> Patient's Current Problem & Symptoms
                </span>
                <p className='text-sm sm:text-base text-gray-900 font-semibold leading-relaxed'>
                  {selectedCaseAppt.patientProblem || 'General health checkup and consultation request.'}
                </p>
                <div className='mt-2 pt-2 border-t border-amber-200/70 text-[11px] text-amber-800 flex items-center justify-between'>
                  <span>Requested Slot: <strong>{slotDateFormat(selectedCaseAppt.slotDate)} at {selectedCaseAppt.slotTime}</strong></span>
                  <span className='font-bold'>Fee: {currency}{selectedCaseAppt.amount}</span>
                </div>
              </div>

              {/* Drug Allergies Alert Shield */}
              {selectedCaseAppt.userData?.allergies && selectedCaseAppt.userData.allergies.length > 0 ? (
                <div className='p-4 bg-red-50 border border-red-300 rounded-2xl flex items-start gap-3'>
                  <span className='text-2xl'>🛡️</span>
                  <div>
                    <h4 className='text-xs font-black text-red-950 uppercase tracking-wider'>
                      Critical Safety Alert: Patient Drug Allergies
                    </h4>
                    <p className='text-xs text-red-800 font-bold mt-0.5'>
                      Documented Allergies: {selectedCaseAppt.userData.allergies.join(', ')}
                    </p>
                    <p className='text-[11px] text-red-700 mt-0.5'>
                      Do not prescribe medications containing these allergens or their active chemical derivatives.
                    </p>
                  </div>
                </div>
              ) : (
                <div className='p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2'>
                  <span>✓</span> No Known Drug Allergies Documented in Patient Profile.
                </div>
              )}

              {/* Medical History & Chronic Conditions */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <div className='p-3.5 bg-gray-50 border border-gray-200 rounded-2xl'>
                  <span className='text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1'>
                    Chronic Health Conditions
                  </span>
                  {selectedCaseAppt.userData?.chronicConditions && selectedCaseAppt.userData.chronicConditions.length > 0 ? (
                    <div className='flex flex-wrap gap-1.5 mt-1'>
                      {selectedCaseAppt.userData.chronicConditions.map((cond, idx) => (
                        <span key={idx} className='bg-indigo-50 text-primary border border-indigo-200 px-2 py-0.5 rounded text-xs font-bold'>
                          {cond}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className='text-xs text-gray-600 font-medium'>No chronic illnesses reported.</p>
                  )}
                </div>

                <div className='p-3.5 bg-gray-50 border border-gray-200 rounded-2xl'>
                  <span className='text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1'>
                    Blood Group & Emergency Info
                  </span>
                  <p className='text-xs text-gray-800 font-bold'>
                    Blood Type: <span className='text-rose-600 font-black text-sm'>{selectedCaseAppt.userData?.bloodGroup || 'O+'}</span>
                  </p>
                  {selectedCaseAppt.userData?.emergencyContact?.name && (
                    <p className='text-[11px] text-gray-600 mt-1'>
                      Emergency Contact: {selectedCaseAppt.userData.emergencyContact.name} ({selectedCaseAppt.userData.emergencyContact.phone})
                    </p>
                  )}
                </div>
              </div>

              {/* Latest Vitals Snapshot */}
              {selectedCaseAppt.userData?.vitals && Object.keys(selectedCaseAppt.userData.vitals).length > 0 && (
                <div className='p-3.5 bg-blue-50/60 border border-blue-200 rounded-2xl'>
                  <span className='text-[11px] font-bold text-blue-900 uppercase tracking-wider block mb-1.5'>
                    📊 Latest Recorded Vitals Snapshot
                  </span>
                  <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs'>
                    {selectedCaseAppt.userData.vitals.bloodPressure && (
                      <div className='bg-white p-2 rounded-xl border border-blue-100'>
                        <span className='text-[10px] text-gray-400 block uppercase'>Blood Pressure</span>
                        <span className='font-bold text-gray-900 font-mono'>{selectedCaseAppt.userData.vitals.bloodPressure}</span>
                      </div>
                    )}
                    {selectedCaseAppt.userData.vitals.heartRate && (
                      <div className='bg-white p-2 rounded-xl border border-blue-100'>
                        <span className='text-[10px] text-gray-400 block uppercase'>Heart Rate</span>
                        <span className='font-bold text-gray-900 font-mono'>{selectedCaseAppt.userData.vitals.heartRate} bpm</span>
                      </div>
                    )}
                    {selectedCaseAppt.userData.vitals.spo2 && (
                      <div className='bg-white p-2 rounded-xl border border-blue-100'>
                        <span className='text-[10px] text-gray-400 block uppercase'>SpO2 Oxygen</span>
                        <span className='font-bold text-gray-900 font-mono'>{selectedCaseAppt.userData.vitals.spo2}%</span>
                      </div>
                    )}
                    {selectedCaseAppt.userData.vitals.temperature && (
                      <div className='bg-white p-2 rounded-xl border border-blue-100'>
                        <span className='text-[10px] text-gray-400 block uppercase'>Body Temp</span>
                        <span className='font-bold text-gray-900 font-mono'>{selectedCaseAppt.userData.vitals.temperature}°F</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className='mt-6 pt-4 border-t border-gray-100 flex flex-wrap justify-between items-center gap-3'>
              <button
                onClick={() => setSelectedCaseAppt(null)}
                className='px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-600 hover:bg-gray-50'
              >
                Close Window
              </button>

              {!selectedCaseAppt.cancelled && !selectedCaseAppt.isCompleted && (
                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => {
                      setRejectingAppt(selectedCaseAppt)
                    }}
                    className='px-4 py-2.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors'
                  >
                    ✕ Reject Consultation
                  </button>

                  {selectedCaseAppt.appointmentStatus !== 'Accepted' && (
                    <button
                      onClick={() => handleAccept(selectedCaseAppt._id)}
                      className='px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition-all'
                    >
                      ✓ Accept Consultation
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Reject Appointment Prompt Modal (with 100% automated refund guarantee) */}
      {rejectingAppt && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in'>
          <div className='bg-white rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl border'>
            <div className='flex justify-between items-center border-b pb-3 mb-4'>
              <h3 className='font-black text-rose-700 text-base flex items-center gap-1.5'>
                <span>✕</span> Reject Consultation Request
              </h3>
              <button
                onClick={() => setRejectingAppt(null)}
                className='text-gray-400 hover:text-gray-600 font-bold'
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className='space-y-4 text-xs'>
              <p className='text-gray-700'>
                You are rejecting the appointment for <strong className='text-gray-900'>{rejectingAppt.userData?.name}</strong> on {slotDateFormat(rejectingAppt.slotDate)} ({rejectingAppt.slotTime}).
              </p>

              {rejectingAppt.payment && (
                <div className='p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs'>
                  ✓ <strong>100% Automated Refund:</strong> The consultation fee of {currency}{rejectingAppt.amount} will be immediately refunded to the patient's wallet.
                </div>
              )}

              <div>
                <label className='block font-bold text-gray-800 uppercase tracking-wider mb-1'>
                  Reason for Rejection (Patient will be notified):
                </label>
                <textarea
                  rows='3'
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder='e.g., Emergency surgery scheduled, outside clinical scope, or doctor unavailable at this time slot...'
                  className='w-full border border-gray-300 rounded-2xl p-3 outline-none focus:border-rose-500 font-sans'
                />
              </div>

              <div className='flex justify-end gap-2.5 pt-3 border-t'>
                <button
                  type='button'
                  onClick={() => setRejectingAppt(null)}
                  className='px-4 py-2.5 rounded-xl border border-gray-300 font-bold text-gray-600 hover:bg-gray-50'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={isActionLoading}
                  className='px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md transition-all'
                >
                  {isActionLoading ? 'Processing...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorDashboard
