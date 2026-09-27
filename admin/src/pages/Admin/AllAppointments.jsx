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
    <div className='w-full max-w-7xl space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-black text-gray-900'>Hospital Consultation Registry</h1>
          <p className='text-xs sm:text-sm text-gray-500'>
            Overview of all patient bookings, clinic tokens, automated refunds, and payment settlements
          </p>
        </div>
        <span className='px-4 py-2 bg-indigo-50 text-[#5F65FF] rounded-2xl border border-indigo-200 font-black text-xs self-start sm:self-auto'>
          {appointments.length} Total Records
        </span>
      </div>

      <div className='bg-white border rounded-3xl text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll shadow-sm'>
        <div className='hidden lg:grid grid-cols-[0.5fr_2fr_1.8fr_0.8fr_1.8fr_2fr_1fr_1.4fr] py-4 px-6 border-b font-bold text-xs text-gray-700 bg-gray-50 uppercase tracking-wider'>
          <p># Token</p>
          <p>Patient</p>
          <p>Payment / Refund</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor Name</p>
          <p>Fee</p>
          <p className='text-center'>Status / Action</p>
        </div>
        {appointments.length === 0 ? (
          <div className='p-20 text-center text-gray-400'>
            <p className='text-4xl mb-3'>📋</p>
            <p className='font-bold text-gray-700 text-base'>No appointments booked</p>
            <p className='text-xs mt-1'>Patient bookings will appear in this administrative list.</p>
          </div>
        ) : (
          [...appointments].reverse().map((item, index) => (
            <div
              className='flex flex-col lg:grid lg:grid-cols-[0.5fr_2fr_1.8fr_0.8fr_1.8fr_2fr_1fr_1.4fr] items-start lg:items-center text-gray-500 py-4 px-6 border-b hover:bg-gray-50/80 transition-colors gap-3 lg:gap-0'
              key={index}
            >
              {/* Token */}
              <div className='flex items-center gap-2'>
                <span className='w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-primary font-black text-xs flex items-center justify-center font-mono'>
                  #{item.tokenNumber || index + 1}
                </span>
              </div>

              {/* Patient */}
              <div className='flex items-center gap-2.5'>
                <UserIdentity name={item.userData?.name || 'Patient'} className='w-9 h-9' />
                <div>
                  <p className='font-bold text-gray-900'>{item.userData?.name || 'Patient'}</p>
                  <p className='text-[10px] text-gray-400 lg:hidden'>
                    {slotDateFormat(item.slotDate)} | {item.slotTime}
                  </p>
                </div>
              </div>

              {/* Payment Status & Refund */}
              <div>
                {item.refundStatus === 'Refunded' ? (
                  <span className='text-[11px] px-2.5 py-1 rounded-full font-black bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1'>
                    <span>🛡️ 100% Refunded</span>
                    <span className='font-mono'>({currency}{item.refundAmount || item.amount})</span>
                  </span>
                ) : item.payment ? (
                  <span className='text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block'>
                    ✓ Paid ({item.paymentMethod || 'Online'})
                  </span>
                ) : item.cancelled ? (
                  <span className='text-xs px-2.5 py-1 rounded-full text-gray-400 bg-gray-50 border'>
                    Cancelled (Unpaid)
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
              <p className='text-xs text-gray-600 font-semibold'>{calculateAge(item.userData?.dob)} yrs</p>

              {/* Date & Time */}
              <p className='text-xs text-gray-700 font-medium'>
                {slotDateFormat(item.slotDate)}, <span className='font-bold text-indigo-600'>{item.slotTime}</span>
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
                  <p className='font-bold text-gray-900 text-xs'>{item.docData?.name || 'Doctor'}</p>
                  <p className='text-[10px] text-gray-400'>{item.docData?.speciality}</p>
                </div>
              </div>

              {/* Fee */}
              <p className='text-gray-900 font-black text-xs'>
                {currency}
                {item.amount}
              </p>

              {/* Action / Completion */}
              <div className='text-center flex items-center justify-start lg:justify-center gap-2'>
                {item.cancelled ? (
                  <span className='text-rose-500 bg-rose-50 border border-rose-200 text-xs font-bold px-3 py-1 rounded-xl'>
                    Cancelled
                  </span>
                ) : item.isCompleted ? (
                  <div className='flex items-center gap-1.5'>
                    <span className='text-emerald-700 bg-emerald-50 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-xl'>
                      ✓ Completed
                    </span>
                    {(item.prescription || item.diagnosisNotes) && (
                      <button
                        onClick={() => setSelectedDetailsAppt(item)}
                        className='text-[11px] text-[#5F65FF] hover:underline font-bold'
                        title='View Clinical Notes'
                      >
                        Notes
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => cancelAppointment(item._id)}
                    title='Cancel Appointment & Process Auto Refund'
                    className='p-1.5 rounded-xl hover:bg-rose-50 text-rose-500 transition-colors border border-rose-200'
                  >
                    <img className='w-4 h-4 inline' src={assets.cancel_icon} alt='Cancel' />
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
                <h3 className='font-black text-gray-900'>Consultation Clinical Record</h3>
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
                  <span className='text-gray-400 font-bold block mb-0.5 uppercase text-[10px]'>
                    Clinical Diagnosis & Notes:
                  </span>
                  <p className='bg-gray-50 p-3 rounded-2xl border text-gray-800 leading-relaxed font-medium'>
                    {selectedDetailsAppt.diagnosisNotes}
                  </p>
                </div>
              )}
              {selectedDetailsAppt.prescription && (
                <div>
                  <span className='text-gray-400 font-bold block mb-0.5 uppercase text-[10px]'>
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
