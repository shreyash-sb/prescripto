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
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [viewDetailsAppointment, setViewDetailsAppointment] = useState(null)

  useEffect(() => {
    if (dToken) {
      getAppointments()
    }
  }, [dToken])

  const openCompleteModal = (appointment) => {
    setSelectedAppointment(appointment)
    setDiagnosisNotes('Routine clinical checkup completed. Vital signs stable and within normal limits.')
    setPrescription(
      '1. Multivitamin supplement - 1 tablet daily after breakfast for 14 days\n2. Paracetamol 500mg (if needed for fever/pain) - 1 tab every 8 hrs\n3. Maintain adequate hydration & rest'
    )
    setShowPrescriptionModal(true)
  }

  // Quick Prescription Preset helper
  const addPrescriptionPreset = (text) => {
    setPrescription((prev) => (prev ? `${prev}\n${text}` : text))
  }

  const handleCompleteSubmit = async (e) => {
    e.preventDefault()
    if (!selectedAppointment) return
    const success = await completeAppointment(selectedAppointment._id, prescription, diagnosisNotes)
    if (success) {
      setShowPrescriptionModal(false)
      setSelectedAppointment(null)
    }
  }

  return (
    <div className='w-full max-w-6xl m-5'>
      <div className='flex justify-between items-center mb-4'>
        <div>
          <h1 className='text-xl font-bold text-gray-800'>Doctor Consultation Schedule</h1>
          <p className='text-xs text-gray-500'>Manage assigned patient appointments, consultations, and medical prescriptions</p>
        </div>
        <span className='text-xs bg-indigo-50 text-primary px-3 py-1.5 rounded-full border border-indigo-200 font-bold'>
          {appointments.length} Total Patients
        </span>
      </div>

      <div className='bg-white border rounded-2xl text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll shadow-sm'>
        <div className='hidden sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_2.5fr_1fr_1.5fr] grid-flow-col py-4 px-6 border-b bg-gray-50/80 text-gray-700 font-semibold text-xs uppercase tracking-wider'>
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p className='text-center'>Action</p>
        </div>

        {appointments.length === 0 ? (
          <div className='p-16 text-center text-gray-400'>
            <p className='text-3xl mb-2'>📋</p>
            <p className='font-bold text-gray-700'>No appointments scheduled yet</p>
            <p className='text-xs mt-1'>Upcoming consultations booked by patients will appear in this queue.</p>
          </div>
        ) : (
          [...appointments].reverse().map((item, index) => (
            <div
              key={index}
              className='flex flex-wrap justify-between max-sm:gap-3 max-sm:text-sm sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_2.5fr_1fr_1.5fr] items-center text-gray-600 py-4 px-6 border-b hover:bg-gray-50/70 transition-colors'
            >
              <p className='max-sm:hidden font-mono text-xs text-gray-400'>{index + 1}</p>

              <div className='flex items-center gap-3'>
                <UserIdentity name={item.userData.name} className='w-9 h-9' />
                <div>
                  <p className='font-bold text-gray-900'>{item.userData.name}</p>
                  <p className='text-xs text-gray-400 max-sm:block hidden'>
                    {slotDateFormat(item.slotDate)} | {item.slotTime}
                  </p>
                </div>
              </div>

              <div>
                {item.payment ? (
                  <span className='text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200'>
                    ✓ Paid ({item.paymentMethod || 'Online'})
                  </span>
                ) : item.cancelled ? (
                  <span className='text-xs px-2 py-0.5 rounded-full text-gray-400 bg-gray-50 border'>
                    Cancelled
                  </span>
                ) : (
                  <div className='flex items-center gap-1.5'>
                    <span className='text-xs px-2 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-800 border border-amber-200'>
                      ⚠ Pending
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
                      className='text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold px-2 py-0.5 rounded-md shadow-xs transition-colors'
                      title='Record in-clinic cash payment'
                    >
                      Collect Cash
                    </button>
                  </div>
                )}
              </div>

              <p className='max-sm:hidden text-xs font-semibold text-gray-700'>{calculateAge(item.userData.dob)}</p>

              <p className='max-sm:hidden text-xs font-medium text-gray-800'>
                {slotDateFormat(item.slotDate)}, {item.slotTime}
              </p>

              <p className='font-bold text-gray-900 text-xs'>
                {currency}
                {item.amount}
              </p>

              <div className='flex items-center justify-center gap-2'>
                {item.cancelled ? (
                  <span className='text-xs text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full font-semibold'>
                    Cancelled
                  </span>
                ) : item.isCompleted ? (
                  <div className='flex items-center gap-1.5'>
                    <span className='text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-bold'>
                      ✓ Completed
                    </span>
                    {(item.prescription || item.diagnosisNotes) && (
                      <button
                        onClick={() => setViewDetailsAppointment(item)}
                        className='text-[11px] text-primary hover:underline font-semibold'
                        title='View Notes'
                      >
                        Notes
                      </button>
                    )}
                  </div>
                ) : (
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() => cancelAppointment(item._id)}
                      title='Cancel Appointment'
                      className='p-1.5 rounded-xl hover:bg-rose-50 text-rose-500 transition-colors border border-rose-100'
                    >
                      <img className='w-5 h-5' src={assets.cancel_icon} alt='Cancel' />
                    </button>
                    <button
                      onClick={() => openCompleteModal(item)}
                      title='Mark Complete & Write Prescription'
                      className='p-1.5 rounded-xl hover:bg-emerald-50 text-emerald-600 transition-colors border border-emerald-100'
                    >
                      <img className='w-5 h-5' src={assets.tick_icon} alt='Complete' />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Structured Prescription & Clinical Notes Modal */}
      {showPrescriptionModal && selectedAppointment && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in'>
          <div className='bg-white rounded-3xl w-full max-w-xl p-6 sm:p-7 shadow-2xl border'>
            <div className='flex justify-between items-center border-b pb-3 mb-4'>
              <div>
                <h3 className='text-lg font-bold text-gray-900'>Complete Consultation & Issue Rx</h3>
                <p className='text-xs text-gray-500'>
                  Patient: <strong className='text-gray-800'>{selectedAppointment.userData.name}</strong> ({calculateAge(selectedAppointment.userData.dob)} yrs)
                </p>
              </div>
              <button
                onClick={() => setShowPrescriptionModal(false)}
                className='text-gray-400 hover:text-gray-600 text-lg font-bold'
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className='flex flex-col gap-4'>
              <div>
                <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>
                  Clinical Diagnosis & Observations:
                </label>
                <textarea
                  rows='2'
                  value={diagnosisNotes}
                  onChange={(e) => setDiagnosisNotes(e.target.value)}
                  placeholder='Clinical observation, symptoms, test recommendations...'
                  className='w-full border border-gray-300 rounded-2xl p-3 text-xs outline-none focus:border-primary'
                />
              </div>

              <div>
                <div className='flex justify-between items-center mb-1'>
                  <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider'>
                    ℞ Prescription Medication & Instructions:
                  </label>
                  <span className='text-[10px] text-gray-400'>Click below to insert presets</span>
                </div>

                {/* Quick Presets for Doctor */}
                <div className='flex flex-wrap gap-1.5 mb-2'>
                  <button
                    type='button'
                    onClick={() => addPrescriptionPreset('• Paracetamol 500mg - 1 tab every 8h after meals for 3 days')}
                    className='text-[10px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-0.5 rounded-lg border'
                  >
                    + Paracetamol
                  </button>
                  <button
                    type='button'
                    onClick={() => addPrescriptionPreset('• Amoxicillin 500mg - 1 capsule twice daily for 5 days')}
                    className='text-[10px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-0.5 rounded-lg border'
                  >
                    + Amoxicillin
                  </button>
                  <button
                    type='button'
                    onClick={() => addPrescriptionPreset('• Cetirizine 10mg - 1 tablet at bedtime for 5 days')}
                    className='text-[10px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-0.5 rounded-lg border'
                  >
                    + Cetirizine
                  </button>
                  <button
                    type='button'
                    onClick={() => addPrescriptionPreset('• Multivitamin & Zinc - 1 tablet daily after lunch for 15 days')}
                    className='text-[10px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-0.5 rounded-lg border'
                  >
                    + Multivitamin
                  </button>
                </div>

                <textarea
                  rows='4'
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  placeholder='Enter dosage, frequency, and instructions...'
                  className='w-full border border-gray-300 rounded-2xl p-3 text-xs outline-none focus:border-primary font-sans'
                />
              </div>

              <div className='flex justify-end gap-2 pt-3 border-t'>
                <button
                  type='button'
                  onClick={() => setShowPrescriptionModal(false)}
                  className='px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-6 py-2.5 rounded-xl text-xs font-bold bg-[#5F65FF] hover:bg-indigo-600 text-white shadow-md active:scale-95'
                >
                  ✓ Complete & Save E-Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details / Prescription Modal */}
      {viewDetailsAppointment && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in'>
          <div className='bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border'>
            <div className='flex justify-between items-center border-b pb-3 mb-3'>
              <h3 className='font-bold text-gray-900'>Consultation Record</h3>
              <button
                onClick={() => setViewDetailsAppointment(null)}
                className='text-gray-400 hover:text-gray-600 font-bold'
              >
                ✕
              </button>
            </div>
            <div className='text-xs text-gray-700 space-y-3'>
              <div>
                <span className='text-gray-400 font-semibold block mb-0.5 uppercase text-[10px]'>Patient</span>
                <p className='font-bold text-sm text-gray-900'>{viewDetailsAppointment.userData.name}</p>
              </div>
              {viewDetailsAppointment.diagnosisNotes && (
                <div>
                  <span className='text-gray-400 font-semibold block mb-0.5 uppercase text-[10px]'>Clinical Diagnosis</span>
                  <p className='bg-gray-50 p-3 rounded-2xl border text-gray-800 leading-relaxed'>
                    {viewDetailsAppointment.diagnosisNotes}
                  </p>
                </div>
              )}
              {viewDetailsAppointment.prescription && (
                <div>
                  <span className='text-gray-400 font-semibold block mb-0.5 uppercase text-[10px]'>℞ Prescription</span>
                  <pre className='bg-indigo-50/40 p-3.5 rounded-2xl border border-indigo-100 text-gray-800 font-sans whitespace-pre-wrap leading-relaxed'>
                    {viewDetailsAppointment.prescription}
                  </pre>
                </div>
              )}
            </div>
            <div className='mt-5 text-right'>
              <button
                onClick={() => setViewDetailsAppointment(null)}
                className='px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold'
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
