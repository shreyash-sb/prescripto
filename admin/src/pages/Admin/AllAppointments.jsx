import { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import DoctorIdentity from '../../components/DoctorIdentity'
import UserIdentity from '../../components/UserIdentity'

const AllAppointments = () => {
  const { aToken, appointments, getAllAppointments, cancelAppointment, collectPayment } =
    useContext(AdminContext)
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext)

  const [selectedDetailsAppt, setSelectedDetailsAppt] = useState(null)

  useEffect(() => {
    if (aToken) {
      getAllAppointments()
    }
  }, [aToken])

  return (
    <div className='w-full max-w-6xl m-5'>
      <div className='flex justify-between items-center mb-4'>
        <div>
          <h1 className='text-xl font-bold text-gray-800'>Hospital Consultation Registry</h1>
          <p className='text-xs text-gray-500'>
            Overview of all patient bookings, clinical consultations, and payment settlements
          </p>
        </div>
        <span className='text-xs bg-indigo-50 text-[#5F65FF] px-3 py-1.5 rounded-full border border-indigo-200 font-bold'>
          {appointments.length} Total Records
        </span>
      </div>

      <div className='bg-white border rounded-2xl text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll shadow-sm'>
        <div className='hidden sm:grid grid-cols-[0.4fr_2.2fr_1.8fr_0.8fr_2fr_2.2fr_1fr_1.4fr] grid-flow-col py-3.5 px-6 border-b font-semibold text-xs text-gray-700 bg-gray-50 uppercase tracking-wider'>
          <p>#</p>
          <p>Patient</p>
          <p>Payment Status</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor Name</p>
          <p>Fee</p>
          <p className='text-center'>Action / Status</p>
        </div>
        {appointments.length === 0 ? (
          <div className='p-16 text-center text-gray-400'>
            <p className='text-3xl mb-2'>📋</p>
            <p className='font-bold text-gray-700'>No appointments booked</p>
            <p className='text-xs mt-1'>Patient bookings will appear in this administrative list.</p>
          </div>
        ) : (
          [...appointments].reverse().map((item, index) => (
            <div
              className='flex flex-wrap justify-between max-sm:gap-2 sm:grid grid-cols-[0.4fr_2.2fr_1.8fr_0.8fr_2fr_2.2fr_1fr_1.4fr] items-center text-gray-500 py-3.5 px-6 border-b hover:bg-gray-50/80 transition-colors'
              key={index}
            >
              <p className='max-sm:hidden font-mono text-xs text-gray-400'>{index + 1}</p>

              {/* Patient */}
              <div className='flex items-center gap-2'>
                <UserIdentity name={item.userData?.name || 'Patient'} />
                <div>
                  <p className='font-bold text-gray-900'>{item.userData?.name || 'Patient'}</p>
                  <p className='text-[10px] text-gray-400 max-sm:block hidden'>
                    {slotDateFormat(item.slotDate)} | {item.slotTime}
                  </p>
                </div>
              </div>

              {/* Payment Status & Action */}
              <div>
                {item.payment ? (
                  <span className='text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block'>
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
                            `Confirm verification of ${currency}${item.amount} payment for ${item.userData?.name || 'Patient'}?`
                          )
                        ) {
                          collectPayment(item._id, 'Verified by Admin')
                        }
                      }}
                      className='text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold px-2 py-0.5 rounded-md transition-colors shadow-xs'
                      title='Mark payment as verified/received'
                    >
                      Mark Paid
                    </button>
                  </div>
                )}
              </div>

              {/* Age */}
              <p className='max-sm:hidden text-xs text-gray-600'>{calculateAge(item.userData?.dob)}</p>

              {/* Date & Time */}
              <p className='text-xs text-gray-700 font-medium'>
                {slotDateFormat(item.slotDate)}, {item.slotTime}
              </p>

              {/* Doctor */}
              <div className='flex items-center gap-2'>
                <DoctorIdentity
                  name={item.docData?.name || 'Doctor'}
                  speciality={item.docData?.speciality}
                  docId={item.docData?._id}
                  mode='avatar'
                  className='w-7 h-7 text-[10px]'
                />
                <div>
                  <p className='font-semibold text-gray-900 text-xs'>{item.docData?.name || 'Doctor'}</p>
                  <p className='text-[10px] text-gray-400'>{item.docData?.speciality}</p>
                </div>
              </div>

              {/* Fee */}
              <p className='text-emerald-700 font-bold text-xs'>
                {currency}
                {item.amount}
              </p>

              {/* Action / Completion */}
              <div className='text-center flex items-center justify-center gap-1.5'>
                {item.cancelled ? (
                  <span className='text-rose-500 bg-rose-50 border border-rose-200 text-xs font-semibold px-2.5 py-0.5 rounded-full'>
                    Cancelled
                  </span>
                ) : item.isCompleted ? (
                  <div className='flex items-center gap-1'>
                    <span className='text-emerald-700 bg-emerald-50 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full'>
                      ✓ Completed
                    </span>
                    {(item.prescription || item.diagnosisNotes) && (
                      <button
                        onClick={() => setSelectedDetailsAppt(item)}
                        className='text-[11px] text-[#5F65FF] hover:underline font-semibold'
                        title='View Clinical Notes'
                      >
                        Notes
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => cancelAppointment(item._id)}
                    title='Cancel Appointment'
                    className='p-1 rounded-lg hover:bg-rose-50 text-rose-500 transition-colors border border-rose-100'
                  >
                    <img className='w-5 h-5 inline' src={assets.cancel_icon} alt='Cancel' />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Clinical Notes Modal */}
      {selectedDetailsAppt && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in'>
          <div className='bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border'>
            <div className='flex justify-between items-center border-b pb-3 mb-3'>
              <div>
                <h3 className='font-bold text-gray-900'>Consultation Clinical Record</h3>
                <p className='text-xs text-gray-400'>
                  Dr. {selectedDetailsAppt.docData?.name} → {selectedDetailsAppt.userData?.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedDetailsAppt(null)}
                className='text-gray-400 hover:text-gray-600 font-bold'
              >
                ✕
              </button>
            </div>
            <div className='text-xs text-gray-700 space-y-3'>
              {selectedDetailsAppt.diagnosisNotes && (
                <div>
                  <span className='text-gray-400 font-semibold block mb-0.5 uppercase text-[10px]'>
                    Clinical Diagnosis & Notes:
                  </span>
                  <p className='bg-gray-50 p-3 rounded-2xl border text-gray-800 leading-relaxed font-medium'>
                    {selectedDetailsAppt.diagnosisNotes}
                  </p>
                </div>
              )}
              {selectedDetailsAppt.prescription && (
                <div>
                  <span className='text-gray-400 font-semibold block mb-0.5 uppercase text-[10px]'>
                    ℞ Prescription Medication:
                  </span>
                  <pre className='bg-indigo-50/40 p-3.5 rounded-2xl border border-indigo-100 text-gray-800 font-sans whitespace-pre-wrap leading-relaxed'>
                    {selectedDetailsAppt.prescription}
                  </pre>
                </div>
              )}
            </div>
            <div className='mt-5 text-right'>
              <button
                onClick={() => setSelectedDetailsAppt(null)}
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

export default AllAppointments
