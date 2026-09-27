import { useContext, useState, useEffect } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import UserIdentity from '../../components/UserIdentity'

const DoctorAppointment = () => {
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext)
  const {
    dToken,
    appointments,
    getAppointments,
    completeAppointment,
    acceptAppointment,
    rejectAppointment,
    collectPayment,
  } = useContext(DoctorContext)

  // Filter & Search
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isActionLoading, setIsActionLoading] = useState(false)

  // Clinical & Review Modals State
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [diagnosisNotes, setDiagnosisNotes] = useState('')
  const [prescription, setPrescription] = useState('')
  const [followUpDays, setFollowUpDays] = useState(7)
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [viewDetailsAppointment, setViewDetailsAppointment] = useState(null)

  // 3-Option Workflow Modals
  const [selectedCaseAppt, setSelectedCaseAppt] = useState(null)
  const [rejectingAppt, setRejectingAppt] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // Structured Medication list
  const [structuredMedicines, setStructuredMedicines] = useState([
    {
      name: 'Paracetamol 500mg',
      dosage: '1 Tab',
      frequency: 'Thrice daily',
      scheduleSlots: ['Morning', 'Afternoon', 'Night'],
      mealTime: 'After Food',
      duration: 3,
      instructions: 'For fever or mild pain',
    },
  ])

  useEffect(() => {
    if (dToken) {
      getAppointments()
    }
  }, [dToken])

  const handleAccept = async (appointmentId) => {
    setIsActionLoading(true)
    const success = await acceptAppointment(appointmentId)
    if (success) {
      if (selectedCaseAppt && selectedCaseAppt._id === appointmentId) {
        setSelectedCaseAppt((prev) => ({ ...prev, appointmentStatus: 'Accepted' }))
      }
      getAppointments()
    }
    setIsActionLoading(false)
  }

  const handleRejectSubmit = async (e) => {
    e.preventDefault()
    if (!rejectingAppt) return

    setIsActionLoading(true)
    const success = await rejectAppointment(
      rejectingAppt._id,
      rejectionReason.trim() || 'Doctor unavailable for requested slot / Case referral'
    )
    if (success) {
      setRejectingAppt(null)
      setRejectionReason('')
      if (selectedCaseAppt && selectedCaseAppt._id === rejectingAppt._id) {
        setSelectedCaseAppt(null)
      }
      getAppointments()
    }
    setIsActionLoading(false)
  }

  const openCompleteModal = (appointment) => {
    setSelectedAppointment(appointment)
    setDiagnosisNotes('Routine clinical checkup completed. Vital signs stable and within normal limits.')
    setPrescription(
      '1. Paracetamol 500mg - 1 tab thrice daily after meals for 3 days\n2. Multivitamin & Minerals - 1 tab daily after breakfast for 14 days\n3. Rest and plenty of fluids'
    )
    setFollowUpDays(7)
    setStructuredMedicines([
      {
        name: 'Paracetamol 500mg',
        dosage: '1 Tab',
        frequency: 'Thrice daily',
        scheduleSlots: ['Morning', 'Afternoon', 'Night'],
        mealTime: 'After Food',
        duration: 3,
        instructions: 'Take after meals',
      },
    ])
    setShowPrescriptionModal(true)
  }

  const addStructuredMedicineRow = () => {
    setStructuredMedicines((prev) => [
      ...prev,
      {
        name: '',
        dosage: '1 Tab',
        frequency: 'Twice daily',
        scheduleSlots: ['Morning', 'Night'],
        mealTime: 'After Food',
        duration: 5,
        instructions: '',
      },
    ])
  }

  const updateMedRow = (index, field, value) => {
    setStructuredMedicines((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const removeMedRow = (index) => {
    setStructuredMedicines((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCompleteSubmit = async (e) => {
    e.preventDefault()
    if (!selectedAppointment) return

    const validMeds = structuredMedicines.filter((m) => m.name && m.name.trim() !== '')

    const success = await completeAppointment(
      selectedAppointment._id,
      prescription,
      diagnosisNotes,
      validMeds,
      Number(followUpDays)
    )
    if (success) {
      setShowPrescriptionModal(false)
      setSelectedAppointment(null)
      getAppointments()
    }
  }

  const completedCount = appointments.filter((a) => a.isCompleted).length
  const remainingCount = appointments.filter((a) => !a.isCompleted && !a.cancelled).length
  const cancelledCount = appointments.filter((a) => a.cancelled).length

  const filteredAppointments = appointments.filter((item) => {
    const matchesTab =
      activeTab === 'all'
        ? true
        : activeTab === 'remaining'
        ? !item.isCompleted && !item.cancelled
        : activeTab === 'completed'
        ? item.isCompleted
        : activeTab === 'cancelled'
        ? item.cancelled
        : true

    const matchesSearch =
      searchQuery === '' ||
      item.userData?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.patientProblem?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.slotDate?.includes(searchQuery)

    return matchesTab && matchesSearch
  })

  return (
    <div className='w-full max-w-7xl space-y-5'>
      {/* Header & Stats */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-black text-gray-900'>Doctor Consultation Schedule & Case Triage</h1>
          <p className='text-xs sm:text-sm text-gray-500'>
            Review patient case & medical history reports, manage remaining queues, and issue structured e-prescriptions.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <span className='px-3.5 py-1.5 bg-indigo-50 text-primary border border-indigo-200 rounded-xl font-bold text-xs'>
            {appointments.length} Total Consultations
          </span>
        </div>
      </div>

      {/* 4 Standard Queue Filter Tabs (All, Remaining, Completed, Cancelled) & Search Bar */}
      <div className='bg-white p-3 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3'>
        <div className='flex items-center gap-1.5 overflow-x-auto text-xs'>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'all' ? 'bg-primary text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>All</span>
            <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${activeTab === 'all' ? 'bg-white/20' : 'bg-gray-200'}`}>
              {appointments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('remaining')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'remaining' ? 'bg-amber-500 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>Remaining</span>
            <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${activeTab === 'remaining' ? 'bg-white/20' : 'bg-amber-100 text-amber-800'}`}>
              {remainingCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'completed' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>Completed</span>
            <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${activeTab === 'completed' ? 'bg-white/20' : 'bg-emerald-100 text-emerald-800'}`}>
              {completedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('cancelled')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'cancelled' ? 'bg-rose-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>Cancelled</span>
            <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${activeTab === 'cancelled' ? 'bg-white/20' : 'bg-rose-100 text-rose-800'}`}>
              {cancelledCount}
            </span>
          </button>
        </div>

        <input
          type='text'
          placeholder='Search patient name, problem or slot...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='text-xs px-3.5 py-1.5 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 w-full md:w-64 bg-gray-50/50'
        />
      </div>

      {/* Appointments List Table */}
      <div className='bg-white border rounded-3xl text-sm max-h-[75vh] min-h-[50vh] overflow-y-scroll shadow-sm'>
        <div className='hidden xl:grid grid-cols-[0.5fr_2.2fr_1.4fr_1.3fr_1.4fr_0.8fr_2.4fr] py-3.5 px-6 border-b bg-gray-50/80 text-gray-700 font-bold text-xs uppercase tracking-wider'>
          <p># Token</p>
          <p>Patient & Current Problem</p>
          <p>Medical History / Age</p>
          <p>Payment Status</p>
          <p>Date & Time Slot</p>
          <p>Fee</p>
          <p className='text-center'>3 Actions (Case / Accept / Reject)</p>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className='p-16 text-center text-gray-400'>
            <p className='text-4xl mb-2'>📋</p>
            <p className='font-bold text-gray-700 text-sm'>No consultations in this category</p>
            <p className='text-xs mt-1'>Upcoming bookings submitted by patients will appear in this clinical schedule.</p>
          </div>
        ) : (
          [...filteredAppointments].reverse().map((item, index) => {
            const hasAllergies = item.userData?.allergies && item.userData.allergies.length > 0
            const patientVitals = item.userData?.vitals || {}
            const isPending = !item.cancelled && !item.isCompleted && item.appointmentStatus !== 'Accepted'
            const isAccepted = !item.cancelled && !item.isCompleted && item.appointmentStatus === 'Accepted'

            return (
              <div
                key={index}
                className='flex flex-col xl:grid xl:grid-cols-[0.5fr_2.2fr_1.4fr_1.3fr_1.4fr_0.8fr_2.4fr] items-start xl:items-center text-gray-600 py-3.5 px-6 border-b hover:bg-gray-50/70 transition-colors gap-3 xl:gap-0'
              >
                {/* Token Number */}
                <div className='flex items-center gap-2'>
                  <span className='w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-primary font-black text-xs flex items-center justify-center font-mono'>
                    #{item.tokenNumber || index + 1}
                  </span>
                </div>

                {/* Patient & Current Problem */}
                <div className='flex items-start gap-3 max-w-sm'>
                  <UserIdentity name={item.userData?.name || 'Patient'} className='w-9 h-9 shrink-0 mt-0.5' />
                  <div>
                    <div className='flex items-center gap-1.5 flex-wrap'>
                      <p className='font-bold text-gray-900 text-xs sm:text-sm'>{item.userData?.name}</p>
                      {item.userData?.bloodGroup && (
                        <span className='text-[10px] font-black text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded'>
                          {item.userData.bloodGroup}
                        </span>
                      )}
                      {isPending && (
                        <span className='px-2 py-0.2 bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-[9px] font-extrabold animate-pulse'>
                          ● New Request
                        </span>
                      )}
                      {isAccepted && (
                        <span className='px-2 py-0.2 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-[9px] font-extrabold'>
                          ✓ Accepted
                        </span>
                      )}
                    </div>

                    {/* Patient Problem */}
                    <p className='text-xs text-gray-700 font-medium mt-1 bg-amber-50/70 border border-amber-100 px-2 py-0.5 rounded-lg line-clamp-1'>
                      <strong className='text-amber-900'>Case:</strong> {item.patientProblem || 'General health consultation'}
                    </p>
                  </div>
                </div>

                {/* Medical History & Allergies */}
                <div>
                  <p className='text-xs font-semibold text-gray-800'>
                    {item.userData?.dob ? `${calculateAge(item.userData.dob)} yrs` : 'Adult'}
                    {patientVitals.bloodPressure && ` • BP: ${patientVitals.bloodPressure}`}
                  </p>
                  {hasAllergies ? (
                    <span className='inline-block mt-0.5 px-2 py-0.5 bg-red-100 text-red-700 border border-red-300 rounded-md text-[10px] font-black'>
                      ⚠️ Allergy: {item.userData.allergies.join(', ')}
                    </span>
                  ) : (
                    <span className='text-[10px] text-emerald-600 font-semibold'>✓ No Drug Allergies</span>
                  )}
                </div>

                {/* Payment Status */}
                <div>
                  {item.payment ? (
                    <span className='text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block'>
                      ✓ Paid ({item.paymentMethod || 'Online'})
                    </span>
                  ) : item.cancelled ? (
                    <span className='text-xs px-2.5 py-1 rounded-full text-gray-400 bg-gray-50 border'>
                      {item.refundStatus === 'Refunded' ? 'Refunded' : 'Cancelled'}
                    </span>
                  ) : (
                    <div className='flex items-center gap-1.5 flex-wrap'>
                      <span className='text-xs px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-200'>
                        Unpaid
                      </span>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Confirm collection of ${currency}${item.amount} consultation fee in cash from ${item.userData.name}?`
                            )
                          ) {
                            collectPayment(item._id, 'Cash Collected (Clinic)')
                          }
                        }}
                        className='text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-0.5 rounded-md shadow-xs transition-colors'
                      >
                        Collect Cash
                      </button>
                    </div>
                  )}
                </div>

                {/* Date & Time Slot */}
                <div>
                  <p className='text-xs font-bold text-gray-900'>{slotDateFormat(item.slotDate)}</p>
                  <p className='text-xs text-indigo-600 font-bold'>{item.slotTime}</p>
                </div>

                {/* Fee */}
                <p className='font-black text-gray-900 text-xs sm:text-sm'>
                  {currency}{item.amount}
                </p>

                {/* 3 ACTIONS FOR DOCTOR (Case & History, Accept, Reject) */}
                <div className='flex items-center justify-start xl:justify-center gap-1.5 w-full xl:w-auto pt-2 xl:pt-0 flex-wrap'>
                  {/* Option 1: View Medical History & Current Case */}
                  <button
                    onClick={() => setSelectedCaseAppt(item)}
                    className='px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-primary border border-indigo-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1'
                    title='View Current Problem, Drug Allergies & Medical History'
                  >
                    <span>🔍 Case & History</span>
                  </button>

                  {/* If Cancelled / Rejected */}
                  {item.cancelled ? (
                    <span className='text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-xl font-bold'>
                      {item.appointmentStatus === 'Rejected' ? '✕ Rejected' : '✕ Cancelled'}
                    </span>
                  ) : item.isCompleted ? (
                    <div className='flex items-center gap-1.5'>
                      <span className='text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl font-bold'>
                        ✓ Done
                      </span>
                      {(item.prescription || item.diagnosisNotes) && (
                        <button
                          onClick={() => setViewDetailsAppointment(item)}
                          className='px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-primary rounded-lg text-xs font-bold border border-indigo-200'
                        >
                          Rx Card
                        </button>
                      )}
                    </div>
                  ) : isPending ? (
                    <>
                      {/* Option 2: Accept Consultation */}
                      <button
                        disabled={isActionLoading}
                        onClick={() => handleAccept(item._id)}
                        className='px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1 transition-all'
                        title='Accept this consultation into schedule'
                      >
                        <span>✓ Accept</span>
                      </button>

                      {/* Option 3: Reject Consultation */}
                      <button
                        disabled={isActionLoading}
                        onClick={() => setRejectingAppt(item)}
                        className='px-2.5 py-1.5 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all flex items-center gap-1'
                        title='Reject consultation request & auto-refund 100% fee'
                      >
                        <span>✕ Reject</span>
                      </button>
                    </>
                  ) : (
                    /* If Already Accepted by doctor -> Start Consultation / Issue Rx */
                    <div className='flex items-center gap-1.5'>
                      <button
                        onClick={() => setRejectingAppt(item)}
                        title='Cancel Appointment & Auto Refund'
                        className='p-1.5 rounded-xl hover:bg-rose-50 text-rose-500 transition-colors border border-rose-200'
                      >
                        <img className='w-4 h-4' src={assets.cancel_icon} alt='Cancel' />
                      </button>
                      <button
                        onClick={() => openCompleteModal(item)}
                        title='Start Consultation, Review Case Reports & Issue Rx'
                        className='px-3.5 py-1.5 rounded-xl bg-primary hover:bg-indigo-700 text-white text-xs font-black shadow-sm flex items-center gap-1.5 transition-all'
                      >
                        <img className='w-3.5 h-3.5 invert' src={assets.tick_icon} alt='Complete' />
                        <span>Start Consultation & Rx</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Patient Clinical Case & Medical History Standalone Modal */}
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
              {/* Patient's Current Problem / Chief Complaint Report */}
              <div className='p-4.5 bg-amber-50/90 border border-amber-200 rounded-2xl'>
                <span className='text-xs font-black text-amber-900 uppercase tracking-wider block mb-1 flex items-center gap-1.5'>
                  <span>🩺</span> Patient&apos;s Current Problem & Symptoms Report
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

      {/* Reject Appointment Prompt Modal */}
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
                  ✓ <strong>100% Automated Refund:</strong> The consultation fee of {currency}{rejectingAppt.amount} will be immediately refunded to the patient&apos;s wallet.
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

      {/* Active Consultation & E-Prescription Modal with Both Reports (History + Current Problem) */}
      {showPrescriptionModal && selectedAppointment && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto'>
          <div className='bg-white rounded-3xl w-full max-w-3xl p-6 sm:p-8 shadow-2xl border my-6'>
            <div className='flex justify-between items-center border-b pb-4 mb-4'>
              <div className='flex items-center gap-3'>
                <UserIdentity name={selectedAppointment.userData?.name || 'Patient'} className='w-11 h-11 text-xs' />
                <div>
                  <div className='flex items-center gap-2'>
                    <h3 className='text-lg sm:text-xl font-black text-gray-900'>
                      Active Consultation & E-Prescription
                    </h3>
                    <span className='text-xs font-mono font-bold bg-indigo-50 text-primary border border-indigo-200 px-2 py-0.5 rounded'>
                      Token #{selectedAppointment.tokenNumber || 1}
                    </span>
                  </div>
                  <p className='text-xs text-gray-500 mt-0.5'>
                    Patient: <strong className='text-gray-900'>{selectedAppointment.userData?.name}</strong> • {selectedAppointment.userData?.dob ? `${calculateAge(selectedAppointment.userData.dob)} yrs` : 'Adult'} • Blood: <span className='text-rose-600 font-bold'>{selectedAppointment.userData?.bloodGroup || 'O+'}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPrescriptionModal(false)}
                className='w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold flex items-center justify-center'
              >
                ✕
              </button>
            </div>

            {/* INTEGRATED CLINICAL REPORT CARD: BOTH CURRENT PROBLEM & MEDICAL HISTORY */}
            <div className='mb-5 p-4 bg-gradient-to-br from-indigo-50/70 via-slate-50 to-blue-50/70 border border-indigo-100 rounded-2xl space-y-3'>
              <div className='flex items-center justify-between border-b border-indigo-100/80 pb-2'>
                <span className='text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center gap-1.5'>
                  <span>📋</span> Patient Case Report & Medical Profile
                </span>
                <span className='text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full'>
                  Verified Patient Record ✓
                </span>
              </div>

              {/* 1. Current Problem / Symptoms */}
              <div className='bg-white p-3 rounded-xl border border-indigo-100/80'>
                <span className='text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block'>
                  🩺 Current Problem / Reason for Visit:
                </span>
                <p className='text-xs sm:text-sm font-bold text-gray-900 mt-0.5 leading-relaxed'>
                  {selectedAppointment.patientProblem || 'General Health Consultation & Routine Checkup'}
                </p>
              </div>

              {/* 2. Drug Allergies & Chronic Conditions */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs'>
                {/* Allergy Safety Shield */}
                <div className={`p-2.5 rounded-xl border ${
                  selectedAppointment.userData?.allergies?.length > 0
                    ? 'bg-rose-50/90 border-rose-200 text-rose-900'
                    : 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                }`}>
                  <span className='text-[10px] font-extrabold uppercase tracking-wider block'>
                    🛡️ Drug Allergies:
                  </span>
                  <span className='font-bold text-xs mt-0.5 block'>
                    {selectedAppointment.userData?.allergies?.length > 0
                      ? `⚠️ ${selectedAppointment.userData.allergies.join(', ')}`
                      : '✓ No Known Drug Allergies'}
                  </span>
                </div>

                {/* Chronic Conditions */}
                <div className='p-2.5 bg-white rounded-xl border border-gray-200 text-gray-800'>
                  <span className='text-[10px] font-bold text-gray-500 uppercase tracking-wider block'>
                    Chronic Conditions / Past History:
                  </span>
                  <span className='font-semibold text-xs mt-0.5 block'>
                    {selectedAppointment.userData?.chronicConditions?.length > 0
                      ? selectedAppointment.userData.chronicConditions.join(', ')
                      : 'None documented in profile'}
                  </span>
                </div>
              </div>

              {/* 3. Vitals Snapshot */}
              {selectedAppointment.userData?.vitals && Object.keys(selectedAppointment.userData.vitals).length > 0 && (
                <div className='flex items-center gap-3 text-xs bg-white/80 p-2 rounded-xl border border-gray-200 flex-wrap'>
                  <span className='text-[10px] font-bold text-gray-500 uppercase'>Recorded Vitals:</span>
                  {selectedAppointment.userData.vitals.bloodPressure && (
                    <span className='font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded'>
                      BP: {selectedAppointment.userData.vitals.bloodPressure}
                    </span>
                  )}
                  {selectedAppointment.userData.vitals.heartRate && (
                    <span className='font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded'>
                      Pulse: {selectedAppointment.userData.vitals.heartRate} bpm
                    </span>
                  )}
                  {selectedAppointment.userData.vitals.spo2 && (
                    <span className='font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded'>
                      SpO2: {selectedAppointment.userData.vitals.spo2}%
                    </span>
                  )}
                </div>
              )}
            </div>

            <form onSubmit={handleCompleteSubmit} className='flex flex-col gap-4 text-xs'>
              {/* Diagnosis Notes */}
              <div>
                <label className='block font-bold text-gray-700 uppercase tracking-wider mb-1'>
                  Clinical Observations & Diagnosis Findings:
                </label>
                <textarea
                  rows='2'
                  value={diagnosisNotes}
                  onChange={(e) => setDiagnosisNotes(e.target.value)}
                  placeholder='Enter clinical observations, diagnosis, physical findings...'
                  className='w-full border border-gray-300 rounded-2xl p-3 text-xs outline-none focus:border-primary font-sans'
                />
              </div>

              {/* Structured Medication Builder */}
              <div>
                <div className='flex items-center justify-between mb-1.5'>
                  <label className='font-bold text-gray-700 uppercase tracking-wider'>
                    Medications (Auto-synced into patient&apos;s Medicine Routine & Alarms):
                  </label>
                  <button
                    type='button'
                    onClick={addStructuredMedicineRow}
                    className='text-[11px] font-bold text-primary hover:underline'
                  >
                    + Add Medication
                  </button>
                </div>

                <div className='space-y-2 max-h-44 overflow-y-auto pr-1'>
                  {structuredMedicines.map((med, idx) => (
                    <div key={idx} className='p-3 bg-gray-50 border border-gray-200 rounded-2xl grid grid-cols-1 sm:grid-cols-12 gap-2 items-center'>
                      <input
                        type='text'
                        value={med.name}
                        placeholder='Medicine name (e.g. Amoxicillin 500mg)'
                        onChange={(e) => updateMedRow(idx, 'name', e.target.value)}
                        className='sm:col-span-4 border border-gray-300 rounded-xl p-2 bg-white text-xs outline-none focus:border-primary font-bold'
                      />
                      <input
                        type='text'
                        value={med.dosage}
                        placeholder='Dosage (1 Tab)'
                        onChange={(e) => updateMedRow(idx, 'dosage', e.target.value)}
                        className='sm:col-span-2 border border-gray-300 rounded-xl p-2 bg-white text-xs outline-none focus:border-primary'
                      />
                      <select
                        value={med.mealTime}
                        onChange={(e) => updateMedRow(idx, 'mealTime', e.target.value)}
                        className='sm:col-span-3 border border-gray-300 rounded-xl p-2 bg-white text-xs outline-none'
                      >
                        <option value='After Food'>After Food</option>
                        <option value='Before Food'>Before Food</option>
                        <option value='With Food'>With Food</option>
                      </select>
                      <input
                        type='number'
                        value={med.duration}
                        placeholder='Days'
                        onChange={(e) => updateMedRow(idx, 'duration', e.target.value)}
                        className='sm:col-span-2 border border-gray-300 rounded-xl p-2 bg-white text-xs outline-none'
                        title='Duration in days'
                      />
                      <button
                        type='button'
                        onClick={() => removeMedRow(idx)}
                        className='sm:col-span-1 text-red-500 hover:text-red-700 font-black text-center text-sm'
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Free-text Prescription Text */}
              <div>
                <div className='flex justify-between items-center mb-1'>
                  <label className='font-bold text-gray-700 uppercase tracking-wider'>
                    ℞ Printable Prescription Memo & Lifestyle Instructions:
                  </label>
                </div>
                <textarea
                  rows='2'
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  className='w-full border border-gray-300 rounded-2xl p-3 text-xs outline-none focus:border-primary font-sans'
                />
              </div>

              {/* Automatic Follow-up Schedule */}
              <div className='p-3 bg-blue-50/60 border border-blue-200 rounded-2xl flex items-center justify-between'>
                <div>
                  <label className='block font-bold text-blue-900'>Automatic Follow-Up Manager</label>
                  <p className='text-[11px] text-blue-700'>
                    Schedules a follow-up reminder in the patient&apos;s portal.
                  </p>
                </div>
                <select
                  value={followUpDays}
                  onChange={(e) => setFollowUpDays(e.target.value)}
                  className='border border-blue-300 rounded-xl p-2 bg-white text-xs font-bold text-blue-950 outline-none'
                >
                  <option value={0}>No Follow-Up Required</option>
                  <option value={3}>In 3 Days</option>
                  <option value={7}>In 7 Days (Recommended)</option>
                  <option value={14}>In 14 Days (2 Weeks)</option>
                  <option value={30}>In 30 Days (1 Month)</option>
                </select>
              </div>

              <div className='flex justify-end gap-3 pt-3 border-t'>
                <button
                  type='button'
                  onClick={() => setShowPrescriptionModal(false)}
                  className='px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-6 py-2.5 rounded-xl font-black bg-primary hover:bg-indigo-700 text-white shadow-lg transition-all flex items-center gap-1.5'
                >
                  <span>✓ Complete Consultation & Issue Rx</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Clinical Consultation Record Modal */}
      {viewDetailsAppointment && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in'>
          <div className='bg-white rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl border'>
            <div className='flex justify-between items-center border-b pb-3 mb-4'>
              <h3 className='font-black text-gray-900 text-base'>Clinical Consultation Record</h3>
              <button
                onClick={() => setViewDetailsAppointment(null)}
                className='text-gray-400 hover:text-gray-600 font-bold'
              >
                ✕
              </button>
            </div>
            <div className='text-xs text-gray-700 space-y-3'>
              <div>
                <span className='text-gray-400 font-bold block mb-0.5 uppercase text-[10px]'>Patient</span>
                <p className='font-bold text-sm text-gray-900'>{viewDetailsAppointment.userData.name}</p>
              </div>
              {viewDetailsAppointment.patientProblem && (
                <div>
                  <span className='text-gray-400 font-bold block mb-0.5 uppercase text-[10px]'>Reported Problem</span>
                  <p className='bg-amber-50/70 p-2.5 rounded-xl border border-amber-200 text-gray-900 font-medium'>
                    {viewDetailsAppointment.patientProblem}
                  </p>
                </div>
              )}
              {viewDetailsAppointment.diagnosisNotes && (
                <div>
                  <span className='text-gray-400 font-bold block mb-0.5 uppercase text-[10px]'>Clinical Observations</span>
                  <p className='bg-gray-50 p-3 rounded-2xl border text-gray-800 leading-relaxed'>
                    {viewDetailsAppointment.diagnosisNotes}
                  </p>
                </div>
              )}
              {viewDetailsAppointment.prescription && (
                <div>
                  <span className='text-gray-400 font-bold block mb-0.5 uppercase text-[10px]'>℞ Prescription Summary</span>
                  <pre className='bg-indigo-50/50 p-3.5 rounded-2xl border border-indigo-100 text-gray-800 font-sans whitespace-pre-wrap leading-relaxed'>
                    {viewDetailsAppointment.prescription}
                  </pre>
                </div>
              )}
            </div>
            <div className='mt-5 text-right'>
              <button
                onClick={() => setViewDetailsAppointment(null)}
                className='px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-xs'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorAppointment
