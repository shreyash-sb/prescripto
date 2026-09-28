import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import DoctorIdentity from '../components/DoctorIdentity'
import { useNavigate } from 'react-router-dom'
import { slotDateFormat } from '../utils/formatters'

const MyAppointments = () => {
  const { backendUrl, token, getDoctorData, currencySymbol, t } = useContext(AppContext)
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'upcoming' | 'completed' | 'refunded' | 'payment_due' | 'cancelled'

  // Modal States
  const [selectedPayAppointment, setSelectedPayAppointment] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('Card')
  const [isProcessingPay, setIsProcessingPay] = useState(false)

  const [prescriptionModalAppt, setPrescriptionModalAppt] = useState(null)
  const [receiptModalAppt, setReceiptModalAppt] = useState(null)
  const [ratingModalAppt, setRatingModalAppt] = useState(null)
  const [userRating, setUserRating] = useState(5)
  const [userReview, setUserReview] = useState('')

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/list-appointments', {
        headers: { token },
      })
      if (data.success) {
        setAppointments(data.appointments || [])
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
      console.log(error)
    }
  }

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this consultation? If paid, 100% of your fee will be refunded immediately into your Healthcare Wallet.')) return
    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/cancel-appointment',
        { appointmentId },
        { headers: { token } }
      )
      if (data.success) {
        toast.success(data.message)
        getUserAppointments()
        getDoctorData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
      console.log(error)
    }
  }

  const handleConvertRxToSchedule = async (appt) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/convert-prescription-to-schedule`,
        { appointmentId: appt._id },
        { headers: { token } }
      )
      if (data.success) {
        toast.success(data.message || 'Prescription converted into daily routine!')
        navigate('/medicine-schedule')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error('Failed to convert prescription into schedule')
    }
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    if (!selectedPayAppointment) return
    setIsProcessingPay(true)

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/pay-appointment`,
        {
          appointmentId: selectedPayAppointment._id,
          paymentMethod,
        },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(`Payment verified successfully! Ref: ${data.paymentId || 'TXN_SUCCESS'}`)
        const updatedAppt = {
          ...selectedPayAppointment,
          payment: true,
          paymentMethod: paymentMethod || 'Online Card',
          paymentId: data.paymentId || 'TXN_SUCCESS',
        }
        setSelectedPayAppointment(null)
        getUserAppointments()
        setReceiptModalAppt(updatedAppt)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || error.message || 'Payment simulation failed')
    } finally {
      setIsProcessingPay(false)
    }
  }

  const handleRatingSubmit = async (e) => {
    e.preventDefault()
    if (!ratingModalAppt) return

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/rate-appointment`,
        {
          appointmentId: ratingModalAppt._id,
          rating: userRating,
          review: userReview,
        },
        { headers: { token } }
      )

      if (data.success) {
        toast.success('Thank you! Your doctor rating and review were saved.')
        setRatingModalAppt(null)
        getUserAppointments()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || error.message || 'Failed to submit rating')
    }
  }

  useEffect(() => {
    if (token) {
      getUserAppointments()
    }
  }, [token])

  // Filter list according to tab
  const filteredAppointments = appointments.filter((item) => {
    if (activeTab === 'upcoming') return !item.cancelled && !item.isCompleted
    if (activeTab === 'completed') return item.isCompleted
    if (activeTab === 'refunded') return item.refundStatus === 'Refunded' || (item.cancelled && item.payment)
    if (activeTab === 'payment_due') return !item.cancelled && !item.payment
    if (activeTab === 'cancelled') return item.cancelled
    return true
  })

  return (
    <div className='py-6 max-w-6xl mx-auto'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight'>
            My Consultations & Appointments
          </h1>
          <p className='text-sm sm:text-base text-gray-500 mt-1'>
            Manage your doctor visits, digital prescriptions, and 100% instant refund records
          </p>
        </div>
        <button
          onClick={() => navigate('/doctors')}
          className='bg-primary text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-opacity-95 shadow-sm transition-all self-start sm:self-auto'
        >
          + Book New Consultation
        </button>
      </div>

      {/* Filter Tabs */}
      <div className='flex items-center gap-2 mt-6 pb-2 border-b border-gray-100 text-sm font-medium overflow-x-auto custom-scrollbar'>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'all'
              ? 'bg-primary text-white font-semibold shadow-xs'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          All ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'upcoming'
              ? 'bg-primary text-white font-semibold shadow-xs'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          Active Visits ({appointments.filter((a) => !a.cancelled && !a.isCompleted).length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'completed'
              ? 'bg-primary text-white font-semibold shadow-xs'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          Completed & Rx ({appointments.filter((a) => a.isCompleted).length})
        </button>
        <button
          onClick={() => setActiveTab('refunded')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'refunded'
              ? 'bg-emerald-600 text-white font-semibold shadow-xs'
              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
          }`}
        >
          <span>💰</span> Instant Refunds ({appointments.filter((a) => a.refundStatus === 'Refunded' || (a.cancelled && a.payment)).length})
        </button>
        <button
          onClick={() => setActiveTab('payment_due')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'payment_due'
              ? 'bg-amber-600 text-white font-semibold shadow-xs'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
          }`}
        >
          <span>💳</span> Payment Due ({appointments.filter((a) => !a.cancelled && !a.payment).length})
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'cancelled'
              ? 'bg-primary text-white font-semibold shadow-xs'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          Cancelled ({appointments.filter((a) => a.cancelled).length})
        </button>
      </div>

      {/* Appointments List */}
      <div className='mt-6 space-y-4'>
        {filteredAppointments.length === 0 ? (
          <div className='bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-xs'>
            <p className='text-4xl mb-3'>📅</p>
            <h3 className='text-base font-bold text-gray-800'>No Appointments in this section</h3>
            <p className='text-xs sm:text-sm text-gray-500 mt-1 max-w-sm mx-auto'>
              Need to see a doctor? Choose from our verified medical specialists and schedule a visit anytime.
            </p>
            <button
              onClick={() => navigate('/doctors')}
              className='mt-5 bg-primary text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-full shadow-sm hover:bg-opacity-95'
            >
              Browse Specialists →
            </button>
          </div>
        ) : (
          filteredAppointments.map((item, index) => {
            const isPendingReview = !item.cancelled && !item.isCompleted && item.appointmentStatus !== 'Accepted'
            const isAccepted = !item.cancelled && !item.isCompleted && item.appointmentStatus === 'Accepted'
            const isRejected = item.appointmentStatus === 'Rejected' || (item.cancelled && item.rejectionReason)

            return (
              <div
                key={index}
                className='bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6'
              >
                {/* Doctor & Appointment Summary */}
                <div className='flex items-start gap-4 flex-1'>
                  <div className='w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100 shadow-xs'>
                    <DoctorIdentity
                      name={item.docData.name}
                      speciality={item.docData.speciality}
                      docId={item.docData._id}
                      degree={item.docData.degree}
                      className='h-full'
                    />
                  </div>

                  <div className='flex-1 min-w-0 text-sm'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <h3 className='text-gray-900 font-bold text-base sm:text-lg truncate'>{item.docData.name}</h3>
                      
                      {item.tokenNumber && (
                        <span className='text-xs bg-indigo-50 text-primary border border-indigo-100 px-2.5 py-0.5 rounded-full font-bold'>
                          Queue Token #{item.tokenNumber}
                        </span>
                      )}

                      {/* Status Badges */}
                      {isPendingReview && (
                        <span className='text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1.5'>
                          <span className='w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse'></span>
                          Pending Review
                        </span>
                      )}
                      {isAccepted && (
                        <span className='text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1'>
                          <span>✓</span> Accepted by Doctor
                        </span>
                      )}
                      {isRejected && (
                        <span className='text-xs bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full font-semibold'>
                          ✕ Consultation Rejected
                        </span>
                      )}
                      {item.isCompleted && (
                        <span className='text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full font-semibold'>
                          ✓ Completed
                        </span>
                      )}
                      {item.payment ? (
                        <span className='text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium'>
                          Paid ({item.paymentMethod || 'Online'})
                        </span>
                      ) : !item.cancelled && (
                        <span className='text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-medium'>
                          Payment Due ({currencySymbol}{item.amount})
                        </span>
                      )}
                    </div>

                    <p className='text-primary font-semibold text-xs sm:text-sm mt-0.5'>{item.docData.speciality} • <span className='text-gray-500 font-normal'>{item.docData.degree}</span></p>

                    {/* Submitted Problem Note */}
                    <div className='mt-2.5 p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-gray-700'>
                      <span className='font-bold text-gray-500 block uppercase text-[10px] tracking-wider'>
                        🩺 Case / Symptoms:
                      </span>
                      <p className='text-gray-800 font-normal mt-0.5'>
                        {item.patientProblem || 'General Consultation & Routine Checkup'}
                      </p>
                    </div>

                    {/* Clinic & Schedule Row */}
                    <div className='mt-3 flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-semibold text-gray-700'>
                      <span className='bg-indigo-50 text-primary border border-indigo-100 px-2.5 py-1 rounded-lg'>
                        📅 {slotDateFormat(item.slotDate)}
                      </span>
                      <span className='bg-gray-100 px-2.5 py-1 rounded-lg'>⏰ {item.slotTime}</span>
                      <span className='text-gray-900 font-bold'>
                        Fee: {currencySymbol}{item.amount}
                      </span>
                      {item.docData.roomNumber && (
                        <span className='text-gray-500 font-normal'>
                          (Room {item.docData.roomNumber})
                        </span>
                      )}
                    </div>

                    {/* Rejection Notice if any */}
                    {isRejected && item.rejectionReason && (
                      <div className='mt-2.5 p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-800'>
                        <strong>Doctor's Reason:</strong> {item.rejectionReason}
                      </div>
                    )}

                    {/* Refund Notice Card for Cancelled/Refunded */}
                    {item.cancelled && (item.refundStatus === 'Refunded' || item.payment) && (
                      <div className='mt-3 p-3 bg-emerald-50/90 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-center justify-between gap-3'>
                        <div>
                          <p className='font-bold text-emerald-900 flex items-center gap-1'>
                            <span>💰</span> 100% Instant Refund Completed
                          </p>
                          <p className='text-[11px] text-emerald-800 mt-0.5'>
                            {currencySymbol}{item.amount} was refunded 100% directly to your Healthcare Wallet.
                          </p>
                        </div>
                        <span className='font-mono font-bold text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded'>
                          {item.refundId || 'REF_CREDITED'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Actions */}
                <div className='flex flex-col sm:flex-row md:flex-col gap-2 justify-center min-w-[200px] border-t md:border-t-0 pt-3 md:pt-0'>
                  {/* Pay Online */}
                  {!item.cancelled && !item.payment && (
                    <button
                      onClick={() => setSelectedPayAppointment(item)}
                      className='text-xs sm:text-sm font-bold py-2.5 px-4 rounded-xl bg-primary text-white hover:bg-opacity-95 shadow-sm transition-all text-center flex items-center justify-center gap-2'
                    >
                      💳 Pay Fee ({currencySymbol}{item.amount})
                    </button>
                  )}

                  {/* Tax Invoice View */}
                  {item.payment && (
                    <button
                      onClick={() => setReceiptModalAppt(item)}
                      className='text-xs font-semibold py-2 px-3.5 border border-emerald-300 rounded-xl text-emerald-700 bg-emerald-50/40 hover:bg-emerald-100 transition-all text-center flex items-center justify-center gap-1.5'
                    >
                      📄 Tax Invoice
                    </button>
                  )}

                  {/* Completed Actions */}
                  {item.isCompleted && (
                    <>
                      <button
                        onClick={() => setPrescriptionModalAppt(item)}
                        className='text-xs font-bold py-2 px-3.5 border border-indigo-200 bg-indigo-50 text-primary hover:bg-indigo-100 rounded-xl transition-all text-center flex items-center justify-center gap-1.5'
                      >
                        💊 View Prescription
                      </button>

                      <button
                        onClick={() => handleConvertRxToSchedule(item)}
                        className='text-xs font-bold py-2 px-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs transition-all text-center flex items-center justify-center gap-1.5'
                      >
                        <span>🔄</span> Sync to Daily Routine
                      </button>

                      <button
                        onClick={() => {
                          setRatingModalAppt(item)
                          setUserRating(item.rating || 5)
                          setUserReview(item.review || '')
                        }}
                        className='text-xs font-semibold py-1.5 px-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 text-center'
                      >
                        ⭐ {item.rating ? `Rated: ${item.rating}/5` : 'Rate Doctor'}
                      </button>
                    </>
                  )}

                  {/* Cancel Appointment */}
                  {!item.cancelled && !item.isCompleted && (
                    <button
                      onClick={() => handleCancelAppointment(item._id)}
                      className='text-xs font-medium py-2 px-3.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all text-center'
                    >
                      Cancel Consultation
                    </button>
                  )}

                  {/* Cancelled badge */}
                  {item.cancelled && (
                    <div className='py-2 px-3.5 border border-rose-200 rounded-xl text-rose-600 bg-rose-50 text-xs font-semibold text-center'>
                      {isRejected ? 'Consultation Rejected' : 'Consultation Cancelled'}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Payment Gateway Modal */}
      {selectedPayAppointment && (
        <div className='fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in'>
          <div className='bg-white rounded-2xl w-full max-w-md p-6 sm:p-7 shadow-xl border border-gray-100'>
            <div className='flex justify-between items-center border-b border-gray-100 pb-3 mb-4'>
              <div>
                <h3 className='font-bold text-base text-gray-900'>Consultation Payment</h3>
                <p className='text-xs text-gray-500'>100% Instant Refund Protected</p>
              </div>
              <button
                onClick={() => setSelectedPayAppointment(null)}
                className='text-gray-400 hover:text-gray-600 font-bold text-lg'
              >
                ✕
              </button>
            </div>

            <div className='bg-indigo-50/70 p-4 rounded-xl border border-indigo-100/80 text-xs space-y-1.5 text-gray-700 mb-4'>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Doctor:</span>
                <span className='font-bold text-gray-900'>{selectedPayAppointment.docData.name}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Slot:</span>
                <span className='font-semibold'>
                  {slotDateFormat(selectedPayAppointment.slotDate)} at {selectedPayAppointment.slotTime}
                </span>
              </div>
              <div className='flex justify-between font-bold text-sm text-gray-900 pt-2 border-t border-indigo-200/80'>
                <span>Total Amount:</span>
                <span className='text-primary font-black text-base'>
                  {currencySymbol}
                  {selectedPayAppointment.amount}
                </span>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className='space-y-3 text-xs sm:text-sm'>
              <p className='text-xs font-bold text-gray-700 uppercase tracking-wider'>Select Payment Option:</p>
              <div className='space-y-2'>
                <label
                  className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'Card'
                      ? 'border-primary bg-indigo-50/30 ring-1 ring-primary/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className='flex items-center gap-2.5'>
                    <input
                      type='radio'
                      name='paymentMethod'
                      value='Card'
                      checked={paymentMethod === 'Card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className='w-4 h-4 text-primary'
                    />
                    <div>
                      <span className='font-bold text-gray-900 block text-xs sm:text-sm'>💳 Credit / Debit Card</span>
                      <span className='text-gray-500 text-[11px]'>Instant confirmation</span>
                    </div>
                  </div>
                  <span className='text-emerald-700 text-[10px] font-bold bg-emerald-50 px-2 py-0.5 rounded-full'>
                    Instant
                  </span>
                </label>

                <label
                  className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'UPI'
                      ? 'border-primary bg-indigo-50/30 ring-1 ring-primary/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className='flex items-center gap-2.5'>
                    <input
                      type='radio'
                      name='paymentMethod'
                      value='UPI'
                      checked={paymentMethod === 'UPI'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className='w-4 h-4 text-primary'
                    />
                    <div>
                      <span className='font-bold text-gray-900 block text-xs sm:text-sm'>📱 UPI / QR Code</span>
                      <span className='text-gray-500 text-[11px]'>Google Pay, PhonePe, Paytm</span>
                    </div>
                  </div>
                  <span className='text-emerald-700 text-[10px] font-bold bg-emerald-50 px-2 py-0.5 rounded-full'>
                    Instant
                  </span>
                </label>

                <label
                  className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'Cash on Visit'
                      ? 'border-primary bg-indigo-50/30 ring-1 ring-primary/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className='flex items-center gap-2.5'>
                    <input
                      type='radio'
                      name='paymentMethod'
                      value='Cash on Visit'
                      checked={paymentMethod === 'Cash on Visit'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className='w-4 h-4 text-primary'
                    />
                    <div>
                      <span className='font-bold text-gray-900 block text-xs sm:text-sm'>💵 Cash on Visit</span>
                      <span className='text-gray-500 text-[11px]'>Pay at clinic desk before consultation</span>
                    </div>
                  </div>
                </label>
              </div>

              {/* Dynamic QR Code */}
              {paymentMethod === 'UPI' && (
                <div className='p-3 bg-gray-50 border rounded-xl text-center'>
                  <p className='text-xs font-bold text-gray-800 mb-1.5'>Scan QR with any UPI App</p>
                  <div className='w-24 h-24 mx-auto bg-white p-2 border rounded-lg shadow-2xs flex items-center justify-center'>
                    <svg viewBox='0 0 100 100' className='w-full h-full'>
                      <rect width='100' height='100' fill='white' />
                      <path
                        d='M10 10h25v25h-25z M65 10h25v25h-25z M10 65h25v25h-25z M15 15h15v15h-15z M70 15h15v15h-15z M15 70h15v15h-15z M45 10h10v10h-10z M10 45h10v10h-10z M45 45h10v10h-10z M75 45h15v10h-15z M45 75h10v15h-10z M65 65h10v10h-10z M80 80h10v10h-10z'
                        fill='#1e293b'
                      />
                    </svg>
                  </div>
                  <p className='text-[10px] text-gray-500 mt-1 font-mono'>UPI ID: prescripto.care@upi</p>
                </div>
              )}

              <div className='pt-3 border-t border-gray-100 flex gap-2.5'>
                <button
                  type='button'
                  onClick={() => setSelectedPayAppointment(null)}
                  className='w-1/2 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={isProcessingPay}
                  className='w-1/2 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-opacity-95 shadow-sm transition-all'
                >
                  {isProcessingPay ? 'Verifying...' : `Confirm & Pay ${currencySymbol}${selectedPayAppointment.amount}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Digital E-Prescription Modal */}
      {prescriptionModalAppt && (
        <div className='fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in'>
          <div className='bg-white rounded-2xl w-full max-w-2xl p-6 sm:p-8 shadow-xl border border-gray-100 print-container'>
            {/* Letterhead */}
            <div className='flex justify-between items-start border-b border-gray-100 pb-4 mb-4'>
              <div>
                <div className='flex items-center gap-2'>
                  <span className='text-2xl font-black text-primary tracking-tight'>PRESCRIPTO</span>
                  <span className='text-[10px] bg-indigo-50 text-primary border border-indigo-200 px-2 py-0.5 rounded font-bold uppercase'>
                    Digital Prescription
                  </span>
                </div>
                <h4 className='text-base font-bold text-gray-900 mt-1.5'>
                  {prescriptionModalAppt.docData.name} ({prescriptionModalAppt.docData.degree})
                </h4>
                <p className='text-xs text-primary font-semibold'>{prescriptionModalAppt.docData.speciality}</p>
              </div>
              <button
                onClick={() => setPrescriptionModalAppt(null)}
                className='text-gray-400 hover:text-gray-600 font-bold text-lg no-print'
              >
                ✕
              </button>
            </div>

            {/* Patient & Consultation Meta */}
            <div className='grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-xs mb-4'>
              <div>
                <span className='text-gray-400 block font-bold uppercase text-[10px]'>Patient</span>
                <span className='font-bold text-gray-900 text-sm'>{prescriptionModalAppt.userData?.name}</span>
                <span className='text-gray-500 block text-[11px]'>{prescriptionModalAppt.userData?.email}</span>
              </div>
              <div className='text-right'>
                <span className='text-gray-400 block font-bold uppercase text-[10px]'>Date & Time</span>
                <span className='font-bold text-gray-900 text-sm'>{slotDateFormat(prescriptionModalAppt.slotDate)}</span>
                <span className='text-gray-500 block text-[11px]'>{prescriptionModalAppt.slotTime}</span>
              </div>
            </div>

            {/* Diagnosis & Rx */}
            <div className='space-y-3.5 text-xs sm:text-sm'>
              {prescriptionModalAppt.diagnosisNotes && (
                <div>
                  <span className='font-bold text-gray-900 uppercase tracking-wider text-[11px] block mb-1'>
                    🩺 Clinical Notes:
                  </span>
                  <div className='bg-gray-50 border border-gray-100 p-3 rounded-xl text-gray-800 text-xs'>
                    {prescriptionModalAppt.diagnosisNotes}
                  </div>
                </div>
              )}

              <div>
                <span className='font-bold text-gray-900 uppercase tracking-wider text-[11px] flex items-center gap-1 mb-1'>
                  <span className='text-primary font-bold text-base'>℞</span> Prescribed Medications:
                </span>
                <pre className='bg-indigo-50/40 border border-indigo-100 p-3.5 rounded-xl font-sans text-gray-900 whitespace-pre-wrap leading-relaxed text-xs'>
                  {prescriptionModalAppt.prescription ||
                    '1. Multivitamin supplement - 1 tablet daily after food for 14 days\n2. Maintain adequate hydration.'}
                </pre>
              </div>
            </div>

            {/* Actions */}
            <div className='mt-6 pt-4 border-t border-gray-100 flex flex-wrap justify-between items-center gap-2.5 no-print'>
              <button
                onClick={() => handleConvertRxToSchedule(prescriptionModalAppt)}
                className='px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs'
              >
                🔄 Add to Medicine Routine
              </button>
              <div className='flex gap-2'>
                <button
                  onClick={() => window.print()}
                  className='px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50'
                >
                  🖨️ Print
                </button>
                <button
                  onClick={() => setPrescriptionModalAppt(null)}
                  className='px-5 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-xs'
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tax Invoice Modal */}
      {receiptModalAppt && (
        <div className='fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in'>
          <div className='bg-white rounded-2xl w-full max-w-md p-6 sm:p-7 shadow-xl border border-gray-100 print-container'>
            <div className='flex justify-between items-start border-b border-gray-100 pb-3 mb-3'>
              <div>
                <h3 className='font-bold text-base text-gray-900'>Consultation Tax Invoice</h3>
                <p className='text-xs text-gray-500'>Payment Confirmation Receipt</p>
              </div>
              <button
                onClick={() => setReceiptModalAppt(null)}
                className='text-gray-400 hover:text-gray-600 font-bold text-lg no-print'
              >
                ✕
              </button>
            </div>

            <div className='bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs space-y-2 text-gray-700'>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Transaction Ref:</span>
                <span className='font-mono font-bold text-gray-900'>{receiptModalAppt.paymentId || 'TXN_SUCCESS'}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Doctor:</span>
                <span className='font-bold text-gray-900'>{receiptModalAppt.docData.name}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Patient:</span>
                <span className='font-bold text-gray-900'>{receiptModalAppt.userData?.name}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Date:</span>
                <span className='font-bold text-gray-900'>
                  {slotDateFormat(receiptModalAppt.slotDate)} ({receiptModalAppt.slotTime})
                </span>
              </div>
              <div className='flex justify-between pt-2.5 border-t border-gray-200 font-bold text-sm text-gray-900'>
                <span>Total Paid:</span>
                <span className='text-emerald-700'>
                  {currencySymbol}
                  {receiptModalAppt.amount} (Paid ✓)
                </span>
              </div>
            </div>

            <div className='mt-5 pt-3 border-t border-gray-100 flex justify-end gap-2 no-print'>
              <button
                onClick={() => window.print()}
                className='px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50'
              >
                🖨️ Print
              </button>
              <button
                onClick={() => setReceiptModalAppt(null)}
                className='px-5 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-xs'
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Rating Modal */}
      {ratingModalAppt && (
        <div className='fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in'>
          <div className='bg-white rounded-2xl w-full max-w-md p-6 sm:p-7 shadow-xl border border-gray-100'>
            <div className='flex justify-between items-center border-b border-gray-100 pb-3 mb-3'>
              <h3 className='font-bold text-base text-gray-900'>Rate Consultation Experience</h3>
              <button
                onClick={() => setRatingModalAppt(null)}
                className='text-gray-400 hover:text-gray-600 font-bold text-lg'
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRatingSubmit} className='space-y-3.5 text-xs sm:text-sm'>
              <p className='text-gray-700'>
                How was your visit with <strong className='text-gray-900'>{ratingModalAppt.docData.name}</strong>?
              </p>

              <div className='flex justify-center gap-3 text-3xl py-2 bg-gray-50 rounded-xl border border-gray-100'>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type='button'
                    onClick={() => setUserRating(star)}
                    className={`hover:scale-120 transition-transform ${
                      star <= userRating ? 'text-amber-400' : 'text-gray-200'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <div>
                <label className='block font-semibold text-gray-700 text-xs mb-1'>Write a brief review (Optional):</label>
                <textarea
                  rows='3'
                  value={userReview}
                  onChange={(e) => setUserReview(e.target.value)}
                  placeholder='Share your consultation feedback...'
                  className='w-full border border-gray-200 rounded-xl p-2.5 text-xs outline-none focus:border-primary'
                />
              </div>

              <div className='pt-2 border-t border-gray-100 flex gap-2 justify-end'>
                <button
                  type='button'
                  onClick={() => setRatingModalAppt(null)}
                  className='px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-5 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-xs hover:bg-opacity-95'
                >
                  Submit Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyAppointments
