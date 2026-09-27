import { useContext, useState, useEffect } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import UserIdentity from '../../components/UserIdentity'

const DoctorAppointment = () => {
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext)
  const { dToken, appointments, getAppointments, completeAppointment, cancelAppointment, collectPayment } =
    useContext(DoctorContext)

  // Clinical Modal State
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [diagnosisNotes, setDiagnosisNotes] = useState('')
  const [prescription, setPrescription] = useState('')
  const [followUpDays, setFollowUpDays] = useState(7)
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [viewDetailsAppointment, setViewDetailsAppointment] = useState(null)

  // Structured Medication list
  const [structuredMedicines, setStructuredMedicines] = useState([
    {
      name: 'Paracetamol 500mg',
      dosage: '1 Tab',
      frequency: 'Thrice daily',
      scheduleSlots: ['Morning', 'Afternoon', 'Night'],
      mealTime: 'After Food',
      duration: 3,
      instructions: 'For fever or mild pain'
    }
  ])

  useEffect(() => {
    if (dToken) {
      getAppointments()
    }
  }, [dToken])

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
        instructions: 'Take after meals'
      }
    ])
    setShowPrescriptionModal(true)
  }

  const addPrescriptionPreset = (text, medObj) => {
    setPrescription((prev) => (prev ? `${prev}\n${text}` : text))
    if (medObj) {
      setStructuredMedicines((prev) => [...prev, medObj])
    }
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
        instructions: ''
      }
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
    }
  }

  return (
    <div className='w-full max-w-7xl space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-black text-gray-900'>Doctor Consultation Schedule & E-Prescriptions</h1>
          <p className='text-xs sm:text-sm text-gray-500'>
            Manage assigned patient queues, review pre-consultation allergy alerts, and auto-sync prescriptions into patient schedules.
          </p>
        </div>
        <span className='px-4 py-2 bg-indigo-50 text-primary border border-indigo-200 rounded-2xl font-black text-xs self-start sm:self-auto'>
          {appointments.length} Total Patients
        </span>
      </div>

      <div className='bg-white border rounded-3xl text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll shadow-sm'>
        <div className='hidden lg:grid grid-cols-[0.5fr_2fr_1.5fr_1.5fr_2fr_1fr_1.5fr] py-4 px-6 border-b bg-gray-50/80 text-gray-700 font-bold text-xs uppercase tracking-wider'>
          <p># Token</p>
          <p>Patient & Allergies</p>
          <p>Vitals / Age</p>
          <p>Payment Status</p>
          <p>Date & Time Slot</p>
          <p>Fee</p>
          <p className='text-center'>Actions</p>
        </div>

        {appointments.length === 0 ? (
          <div className='p-20 text-center text-gray-400'>
            <p className='text-4xl mb-3'>📋</p>
            <p className='font-bold text-gray-700 text-base'>No appointments scheduled yet</p>
            <p className='text-xs mt-1'>Upcoming consultations booked by patients will appear in this clinical queue.</p>
          </div>
        ) : (
          [...appointments].reverse().map((item, index) => {
            const hasAllergies = item.userData?.allergies && item.userData.allergies.length > 0
            const patientVitals = item.userData?.vitals || {}

            return (
              <div
                key={index}
                className='flex flex-col lg:grid lg:grid-cols-[0.5fr_2fr_1.5fr_1.5fr_2fr_1fr_1.5fr] items-start lg:items-center text-gray-600 py-4 px-6 border-b hover:bg-gray-50/70 transition-colors gap-3 lg:gap-0'
              >
                {/* Token Number */}
                <div className='flex items-center gap-2'>
                  <span className='w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-primary font-black text-xs flex items-center justify-center font-mono'>
                    #{item.tokenNumber || index + 1}
                  </span>
                </div>

                {/* Patient & Allergy Shield */}
                <div className='flex items-center gap-3'>
                  <UserIdentity name={item.userData?.name || 'Patient'} className='w-10 h-10 shrink-0' />
                  <div>
                    <div className='flex items-center gap-2 flex-wrap'>
                      <p className='font-bold text-gray-900'>{item.userData?.name}</p>
                      {item.userData?.bloodGroup && (
                        <span className='text-[10px] font-black text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded'>
                          {item.userData.bloodGroup}
                        </span>
                      )}
                    </div>
                    {hasAllergies ? (
                      <span className='inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-700 border border-red-300 rounded-md text-[10px] font-black'>
                        ⚠️ Allergy: {item.userData.allergies.join(', ')}
                      </span>
                    ) : (
                      <span className='text-[10px] text-emerald-600 font-semibold'>✓ No Known Drug Allergies</span>
                    )}
                  </div>
                </div>

                {/* Vitals / Age */}
                <div>
                  <p className='text-xs font-semibold text-gray-800'>{calculateAge(item.userData?.dob)} yrs</p>
                  {patientVitals.bloodPressure && (
                    <p className='text-[11px] text-blue-700 font-mono'>
                      BP: {patientVitals.bloodPressure} {patientVitals.spo2 && `• SpO2: ${patientVitals.spo2}%`}
                    </p>
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
                        Pending
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

                {/* Actions */}
                <div className='flex items-center justify-start lg:justify-center gap-2 w-full lg:w-auto pt-2 lg:pt-0'>
                  {item.cancelled ? (
                    <span className='text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-xl font-bold'>
                      Cancelled
                    </span>
                  ) : item.isCompleted ? (
                    <div className='flex items-center gap-2'>
                      <span className='text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl font-bold'>
                        ✓ Completed
                      </span>
                      {(item.prescription || item.diagnosisNotes) && (
                        <button
                          onClick={() => setViewDetailsAppointment(item)}
                          className='px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-primary rounded-lg text-xs font-bold border border-indigo-200'
                        >
                          Rx Card
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className='flex items-center gap-2'>
                      <button
                        onClick={() => cancelAppointment(item._id)}
                        title='Cancel Appointment & Auto Refund'
                        className='p-2 rounded-xl hover:bg-rose-50 text-rose-500 transition-colors border border-rose-200'
                      >
                        <img className='w-4 h-4' src={assets.cancel_icon} alt='Cancel' />
                      </button>
                      <button
                        onClick={() => openCompleteModal(item)}
                        title='Mark Complete & Write Prescription'
                        className='px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all'
                      >
                        <img className='w-3.5 h-3.5 invert' src={assets.tick_icon} alt='Complete' />
                        <span>Issue Rx</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Complete Consultation & Structured E-Prescription Modal */}
      {showPrescriptionModal && selectedAppointment && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto'>
          <div className='bg-white rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl border my-8'>
            <div className='flex justify-between items-center border-b pb-4 mb-4'>
              <div>
                <h3 className='text-xl font-black text-gray-900'>Complete Consultation & Issue E-Prescription</h3>
                <p className='text-xs text-gray-500 mt-0.5'>
                  Patient: <strong className='text-gray-900'>{selectedAppointment.userData.name}</strong> • Token #{selectedAppointment.tokenNumber || 1}
                </p>
              </div>
              <button
                onClick={() => setShowPrescriptionModal(false)}
                className='text-gray-400 hover:text-gray-600 text-xl font-bold'
              >
                ✕
              </button>
            </div>

            {/* Patient Allergy Warning Shield */}
            {selectedAppointment.userData?.allergies && selectedAppointment.userData.allergies.length > 0 && (
              <div className='mb-4 p-3.5 bg-red-50 border border-red-300 rounded-2xl flex items-start gap-3'>
                <span className='text-2xl'>🛡️</span>
                <div>
                  <h4 className='text-xs font-black text-red-950 uppercase tracking-wider'>
                    Critical Safety Alert: Patient Drug Allergies
                  </h4>
                  <p className='text-xs text-red-800 font-bold mt-0.5'>
                    Documented Allergies: {selectedAppointment.userData.allergies.join(', ')}
                  </p>
                  <p className='text-[11px] text-red-700 mt-0.5'>
                    Please avoid prescribing compounds or derivatives related to these allergens.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleCompleteSubmit} className='flex flex-col gap-4 text-xs'>
              {/* Diagnosis Notes */}
              <div>
                <label className='block font-bold text-gray-700 uppercase tracking-wider mb-1'>
                  Clinical Diagnosis & Observations:
                </label>
                <textarea
                  rows='2'
                  value={diagnosisNotes}
                  onChange={(e) => setDiagnosisNotes(e.target.value)}
                  placeholder='Clinical observations, symptoms, physical findings...'
                  className='w-full border border-gray-300 rounded-2xl p-3 text-xs outline-none focus:border-primary'
                />
              </div>

              {/* Structured Medication Builder */}
              <div>
                <div className='flex items-center justify-between mb-1.5'>
                  <label className='font-bold text-gray-700 uppercase tracking-wider'>
                    Medications (Auto-synced into patient's Medicine Routine & Alarms):
                  </label>
                  <button
                    type='button'
                    onClick={addStructuredMedicineRow}
                    className='text-[11px] font-bold text-primary hover:underline'
                  >
                    + Add Medication
                  </button>
                </div>

                <div className='space-y-2 max-h-48 overflow-y-auto pr-1'>
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
                  rows='3'
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  className='w-full border border-gray-300 rounded-2xl p-3 text-xs outline-none focus:border-primary font-sans'
                />
              </div>

              {/* Automatic Follow-up Schedule */}
              <div className='p-3.5 bg-blue-50/60 border border-blue-200 rounded-2xl flex items-center justify-between'>
                <div>
                  <label className='block font-bold text-blue-900'>Automatic Follow-Up Manager</label>
                  <p className='text-[11px] text-blue-700'>
                    Schedules a follow-up check-in and re-consultation reminder in patient's portal.
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
                  className='px-6 py-2.5 rounded-xl font-black bg-primary hover:bg-indigo-700 text-white shadow-lg transition-all'
                >
                  ✓ Complete Consultation & Dispatch Rx
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Record Modal */}
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
