import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import DoctorIdentity from '../components/DoctorIdentity'
import { useNavigate } from 'react-router-dom'
import { slotDateFormat } from '../utils/formatters'

const MyAppointments = () => {
  const { backendUrl, token, getDoctorData, currencySymbol } = useContext(AppContext)
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'upcoming' | 'completed' | 'cancelled'

  // Modal States
  const [selectedPayAppointment, setSelectedPayAppointment] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('Card (Demo)')
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
        setAppointments(data.appointments)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
      console.log(error)
    }
  }

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return
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
        // Automatically open receipt modal so patient gets their tax invoice immediately
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
    if (activeTab === 'payment_due') return !item.cancelled && !item.payment
    if (activeTab === 'cancelled') return item.cancelled
    return true
  })

  return (
    <div className='py-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-extrabold text-gray-900'>My Appointments & Health Records</h1>
          <p className='text-sm sm:text-base text-gray-500 mt-1'>
            Track medical consultations, digital prescriptions, payment receipts, and doctor reviews
          </p>
        </div>
        <button
          onClick={() => navigate('/doctors')}
          className='bg-primary/10 hover:bg-primary hover:text-white text-primary text-sm font-bold px-6 py-3 rounded-full transition-all self-start sm:self-auto shadow-sm'
        >
          + Book New Consultation
        </button>
      </div>

      {/* Filter Tabs */}
      <div className='flex items-center gap-2.5 mt-6 pb-2 border-b border-gray-100 text-sm font-semibold overflow-x-auto custom-scrollbar'>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2.5 rounded-2xl transition-all ${
            activeTab === 'all'
              ? 'bg-primary text-white shadow-md'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          All Appointments ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2.5 rounded-2xl transition-all ${
            activeTab === 'upcoming'
              ? 'bg-primary text-white shadow-md'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          Active / Upcoming ({appointments.filter((a) => !a.cancelled && !a.isCompleted).length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2.5 rounded-2xl transition-all ${
            activeTab === 'completed'
              ? 'bg-primary text-white shadow-md'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          Completed & Prescriptions ({appointments.filter((a) => a.isCompleted).length})
        </button>
        <button
          onClick={() => setActiveTab('payment_due')}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-1.5 ${
            activeTab === 'payment_due'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
          }`}
        >
          <span>💳</span> Payment Due ({appointments.filter((a) => !a.cancelled && !a.payment).length})
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`px-4 py-2.5 rounded-2xl transition-all ${
            activeTab === 'cancelled'
              ? 'bg-primary text-white shadow-md'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          Cancelled ({appointments.filter((a) => a.cancelled).length})
        </button>
      </div>

      {/* Appointments List */}
      <div className='mt-6 space-y-4'>
        {filteredAppointments.length === 0 ? (
          <div className='bg-white rounded-3xl border border-gray-200/90 p-12 text-center'>
            <p className='text-5xl mb-3'>📅</p>
            <p className='text-lg font-bold text-gray-800'>No Appointments in this category</p>
            <p className='text-sm text-gray-500 mt-1 max-w-sm mx-auto'>
              Looking for a specialist? Browse our verified doctor network and book a 30-minute slot anytime.
            </p>
            <button
              onClick={() => navigate('/doctors')}
              className='mt-6 bg-primary text-white text-sm font-bold px-7 py-3 rounded-full shadow-md hover:bg-opacity-95'
            >
              Explore Specialists →
            </button>
          </div>
        ) : (
          filteredAppointments.map((item, index) => (
            <div
              key={index}
              className='bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-all'
            >
              {/* Doctor Details */}
              <div className='flex items-start gap-5'>
                <div className='w-22 h-22 sm:w-26 sm:h-26 rounded-2xl overflow-hidden flex-shrink-0 border shadow-sm'>
                  <DoctorIdentity
                    name={item.docData.name}
                    speciality={item.docData.speciality}
                    docId={item.docData._id}
                    degree={item.docData.degree}
                    className='h-full'
                  />
                </div>
                <div className='text-base text-zinc-600'>
                  <div className='flex flex-wrap items-center gap-2.5'>
                    <p className='text-neutral-900 font-extrabold text-lg sm:text-xl'>{item.docData.name}</p>
                    {item.payment ? (
                      <span className='text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-0.5 rounded-full font-bold'>
                        ✓ Paid ({item.paymentMethod || 'Online'})
                      </span>
                    ) : (
                      <span className='text-xs bg-amber-50 text-amber-800 border border-amber-200 px-3 py-0.5 rounded-full font-bold flex items-center gap-1.5'>
                        <span className='w-2 h-2 rounded-full bg-amber-500 animate-ping'></span> Payment Due ({currencySymbol}{item.amount})
                      </span>
                    )}
                    {item.isCompleted && (
                      <span className='text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-0.5 rounded-full font-bold'>
                        ✓ Consultation Completed
                      </span>
                    )}
                  </div>
                  <p className='text-primary font-bold text-sm mt-1'>{item.docData.speciality}</p>

                  <div className='mt-2.5 text-sm text-gray-600'>
                    <p className='font-bold text-gray-800'>Clinic Address:</p>
                    <p className='mt-0.5'>
                      {item.docData.address?.line1}, {item.docData.address?.line2}
                    </p>
                  </div>

                  <div className='mt-3 flex flex-wrap items-center gap-3 text-sm font-bold text-neutral-800'>
                    <span className='bg-indigo-50 border border-indigo-100 text-primary px-3 py-1.5 rounded-xl'>
                      📅 {slotDateFormat(item.slotDate)}
                    </span>
                    <span className='bg-gray-100 px-3 py-1.5 rounded-xl'>⏰ {item.slotTime}</span>
                    <span className='text-primary font-extrabold text-base'>
                      Fee: {currencySymbol}
                      {item.amount}
                    </span>
                  </div>

                  {/* Context notice if consultation is completed but unpaid */}
                  {item.isCompleted && !item.payment && (
                    <div className='mt-3.5 p-3 bg-amber-50/90 border border-amber-200 rounded-2xl text-xs sm:text-sm text-amber-900 flex items-center gap-2 font-medium'>
                      <span className='text-base'>ℹ️</span> Doctor completed your consultation. Please pay the consultation fee below to view and download your official receipt.
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex flex-col sm:flex-row md:flex-col gap-2.5 justify-center min-w-[220px] border-t md:border-t-0 pt-4 md:pt-0'>
                {/* Outstanding Payment: Available anytime for active or completed consultation */}
                {!item.cancelled && !item.payment && (
                  <button
                    onClick={() => setSelectedPayAppointment(item)}
                    className='text-sm font-bold py-3 px-5 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 text-white hover:opacity-95 shadow-md transition-all active:scale-95 text-center flex items-center justify-center gap-2'
                  >
                    💳 {item.isCompleted ? 'Pay Consultation Fee' : 'Pay Online'} ({currencySymbol}
                    {item.amount})
                  </button>
                )}

                {/* Paid Receipt View */}
                {item.payment && (
                  <button
                    onClick={() => setReceiptModalAppt(item)}
                    className='text-sm font-bold py-2.5 px-4 border-2 border-emerald-500 rounded-2xl text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100 transition-all text-center flex items-center justify-center gap-1.5'
                  >
                    📄 View Receipt ({item.paymentMethod || 'Paid'})
                  </button>
                )}

                {/* Completed State Actions: E-Prescription & Rating */}
                {item.isCompleted && (
                  <>
                    <button
                      onClick={() => setPrescriptionModalAppt(item)}
                      className='text-sm font-extrabold py-3 px-5 border border-indigo-300 bg-indigo-50 text-primary hover:bg-indigo-100 rounded-2xl transition-all text-center shadow-sm flex items-center justify-center gap-2'
                    >
                      💊 View Official Prescription
                    </button>
                    <button
                      onClick={() => {
                        setRatingModalAppt(item)
                        setUserRating(item.rating || 5)
                        setUserReview(item.review || '')
                      }}
                      className='text-sm font-bold py-2.5 px-4 border border-gray-300 rounded-2xl text-gray-700 hover:bg-gray-50 text-center'
                    >
                      ⭐ {item.rating ? `Your Rating: ${item.rating}/5` : 'Rate & Review Doctor'}
                    </button>
                  </>
                )}

                {/* Cancel Appointment (only if not completed and not cancelled) */}
                {!item.cancelled && !item.isCompleted && (
                  <button
                    onClick={() => handleCancelAppointment(item._id)}
                    className='text-sm font-semibold py-2.5 px-4 border border-gray-200 rounded-2xl text-gray-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all text-center'
                  >
                    Cancel Appointment
                  </button>
                )}

                {/* Status Badges */}
                {item.cancelled && (
                  <div className='py-2.5 px-4 border border-rose-200 rounded-2xl text-rose-600 bg-rose-50 text-sm font-bold text-center'>
                    Appointment Cancelled
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Payment Gateway Modal with Interactive SVG QR Code & Card Checkout */}
      {selectedPayAppointment && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in'>
          <div className='bg-white rounded-3xl w-full max-w-lg p-7 sm:p-8 shadow-2xl border'>
            <div className='flex justify-between items-center border-b pb-4 mb-4'>
              <div>
                <h3 className='font-bold text-lg text-gray-900'>Consultation Payment Gateway</h3>
                <p className='text-xs text-gray-500'>Secure Simulated Payment Sandbox</p>
              </div>
              <button
                onClick={() => setSelectedPayAppointment(null)}
                className='text-gray-400 hover:text-gray-600 font-bold text-xl'
              >
                ✕
              </button>
            </div>

            <div className='bg-indigo-50/70 p-5 rounded-2xl border border-indigo-100 text-sm mb-5 space-y-2 text-gray-700'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Doctor:</span>
                <span className='font-bold text-gray-900'>{selectedPayAppointment.docData.name}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Speciality:</span>
                <span className='font-semibold text-primary'>{selectedPayAppointment.docData.speciality}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Slot:</span>
                <span className='font-semibold'>
                  {slotDateFormat(selectedPayAppointment.slotDate)} | {selectedPayAppointment.slotTime}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Consultation Status:</span>
                <span className={`font-bold ${selectedPayAppointment.isCompleted ? 'text-blue-700' : 'text-emerald-700'}`}>
                  {selectedPayAppointment.isCompleted ? '✓ Completed (Fee Settlement)' : 'Scheduled / Active'}
                </span>
              </div>
              <div className='flex justify-between font-extrabold text-base text-gray-900 pt-2 border-t border-indigo-200'>
                <span>Payable Amount:</span>
                <span className='text-primary text-xl'>
                  {currencySymbol}
                  {selectedPayAppointment.amount}
                </span>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className='space-y-4'>
              <p className='text-xs font-bold text-gray-800 uppercase tracking-wider'>Choose Payment Method:</p>
              <div className='space-y-2.5 text-sm'>
                <label
                  className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${
                    paymentMethod === 'Card (Demo)'
                      ? 'border-primary bg-indigo-50/40 shadow-sm ring-1 ring-primary/30'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className='flex items-center gap-3'>
                    <input
                      type='radio'
                      name='paymentMethod'
                      value='Card (Demo)'
                      checked={paymentMethod === 'Card (Demo)'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className='w-4 h-4 text-primary'
                    />
                    <div>
                      <span className='font-bold text-gray-900 block text-sm sm:text-base'>💳 Credit / Debit Card (Instant)</span>
                      <span className='text-gray-500 text-xs'>Visa, Mastercard, Amex sandbox simulation</span>
                    </div>
                  </div>
                  <span className='text-emerald-600 text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-full'>
                    Instant
                  </span>
                </label>

                <label
                  className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${
                    paymentMethod === 'UPI (Demo)'
                      ? 'border-primary bg-indigo-50/40 shadow-sm ring-1 ring-primary/30'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className='flex items-center gap-3'>
                    <input
                      type='radio'
                      name='paymentMethod'
                      value='UPI (Demo)'
                      checked={paymentMethod === 'UPI (Demo)'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className='w-4 h-4 text-primary'
                    />
                    <div>
                      <span className='font-bold text-gray-900 block text-sm sm:text-base'>📱 Dynamic UPI / QR Code</span>
                      <span className='text-gray-500 text-xs'>Google Pay, PhonePe, Paytm QR simulation</span>
                    </div>
                  </div>
                  <span className='text-emerald-600 text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-full'>
                    Instant
                  </span>
                </label>

                <label
                  className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${
                    paymentMethod === 'NetBanking (Demo)'
                      ? 'border-primary bg-indigo-50/40 shadow-sm ring-1 ring-primary/30'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className='flex items-center gap-3'>
                    <input
                      type='radio'
                      name='paymentMethod'
                      value='NetBanking (Demo)'
                      checked={paymentMethod === 'NetBanking (Demo)'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className='w-4 h-4 text-primary'
                    />
                    <div>
                      <span className='font-bold text-gray-900 block text-sm sm:text-base'>🏦 NetBanking / Instant Transfer</span>
                      <span className='text-gray-500 text-xs'>All major banks simulated gateway</span>
                    </div>
                  </div>
                  <span className='text-emerald-600 text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-full'>
                    Instant
                  </span>
                </label>

                <label
                  className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${
                    paymentMethod === 'Cash on Visit'
                      ? 'border-primary bg-indigo-50/40 shadow-sm ring-1 ring-primary/30'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className='flex items-center gap-3'>
                    <input
                      type='radio'
                      name='paymentMethod'
                      value='Cash on Visit'
                      checked={paymentMethod === 'Cash on Visit'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className='w-4 h-4 text-primary'
                    />
                    <div>
                      <span className='font-bold text-gray-900 block text-sm sm:text-base'>💵 Cash at Clinic Counter</span>
                      <span className='text-gray-500 text-xs'>Direct offline settlement at clinic front desk</span>
                    </div>
                  </div>
                </label>
              </div>

              {/* Dynamic QR Code Visualization if UPI is selected */}
              {paymentMethod === 'UPI (Demo)' && (
                <div className='p-5 bg-gray-50 border rounded-2xl text-center animate-fade-in'>
                  <p className='text-sm font-bold text-gray-800 mb-2'>Scan QR to Pay via Any UPI App</p>
                  <div className='w-32 h-32 mx-auto bg-white p-2.5 border rounded-2xl shadow-sm flex items-center justify-center'>
                    {/* Simulated SVG QR Code Matrix */}
                    <svg viewBox='0 0 100 100' className='w-full h-full'>
                      <rect width='100' height='100' fill='white' />
                      <path
                        d='M10 10h25v25h-25z M65 10h25v25h-25z M10 65h25v25h-25z M15 15h15v15h-15z M70 15h15v15h-15z M15 70h15v15h-15z M45 10h10v10h-10z M10 45h10v10h-10z M45 45h10v10h-10z M75 45h15v10h-15z M45 75h10v15h-10z M65 65h10v10h-10z M80 80h10v10h-10z'
                        fill='#1e293b'
                      />
                    </svg>
                  </div>
                  <p className='text-xs text-gray-500 mt-2 font-mono'>UPI ID: prescripto.clinic@demo</p>
                </div>
              )}

              <div className='pt-4 border-t flex gap-3'>
                <button
                  type='button'
                  onClick={() => setSelectedPayAppointment(null)}
                  className='w-1/2 py-3 rounded-2xl border text-sm font-bold text-gray-600 hover:bg-gray-50'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={isProcessingPay}
                  className='w-1/2 py-3 rounded-2xl bg-primary text-white text-sm font-bold hover:bg-opacity-95 shadow-md transition-all active:scale-95'
                >
                  {isProcessingPay ? 'Verifying...' : `Confirm & Pay ${currencySymbol}${selectedPayAppointment.amount}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Digital E-Prescription Modal (Printable) */}
      {prescriptionModalAppt && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in'>
          <div className='bg-white rounded-3xl w-full max-w-2xl p-7 sm:p-9 shadow-2xl border print-container'>
            {/* Hospital Letterhead Header */}
            <div className='flex justify-between items-start border-b pb-5 mb-5'>
              <div>
                <div className='flex items-center gap-2.5'>
                  <span className='text-3xl font-black text-primary tracking-tight'>PRESCRIPTO</span>
                  <span className='text-xs bg-indigo-50 text-primary border border-indigo-200 px-2.5 py-1 rounded-md font-extrabold'>
                    CLINICAL Rx
                  </span>
                </div>
                <p className='text-xs text-gray-500 mt-1'>Enterprise Digital Healthcare Consultation Record</p>
                <p className='text-base font-bold text-gray-900 mt-2.5'>
                  {prescriptionModalAppt.docData.name} ({prescriptionModalAppt.docData.degree})
                </p>
                <p className='text-sm text-primary font-semibold'>{prescriptionModalAppt.docData.speciality}</p>
              </div>
              <button
                onClick={() => setPrescriptionModalAppt(null)}
                className='text-gray-400 hover:text-gray-600 font-bold text-xl no-print'
              >
                ✕
              </button>
            </div>

            {/* Patient & Date Meta */}
            <div className='grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200 text-sm mb-5'>
              <div>
                <span className='text-gray-500 block text-xs font-bold uppercase'>Patient Name</span>
                <span className='font-bold text-gray-900 text-base'>{prescriptionModalAppt.userData.name}</span>
                <span className='text-gray-500 block text-xs mt-0.5'>{prescriptionModalAppt.userData.email}</span>
              </div>
              <div className='text-right'>
                <span className='text-gray-500 block text-xs font-bold uppercase'>Consultation Date</span>
                <span className='font-bold text-gray-900 text-base'>{slotDateFormat(prescriptionModalAppt.slotDate)}</span>
                <span className='text-gray-500 block text-xs mt-0.5'>{prescriptionModalAppt.slotTime}</span>
              </div>
            </div>

            {/* Diagnosis Notes */}
            <div className='space-y-5 text-sm'>
              {prescriptionModalAppt.diagnosisNotes && (
                <div>
                  <span className='font-bold text-gray-900 uppercase tracking-wider text-xs block mb-1.5'>
                    🩺 Clinical Diagnosis & Notes:
                  </span>
                  <div className='bg-gray-50 border border-gray-200 p-4 rounded-2xl text-gray-800 leading-relaxed font-medium text-sm sm:text-base'>
                    {prescriptionModalAppt.diagnosisNotes}
                  </div>
                </div>
              )}

              {/* Rx Prescription Box */}
              <div>
                <div className='flex items-center justify-between mb-1.5'>
                  <span className='font-bold text-gray-900 uppercase tracking-wider text-xs flex items-center gap-1.5'>
                    <span className='text-primary text-xl font-black'>℞</span> Prescribed Medication & Treatment:
                  </span>
                </div>
                <pre className='bg-indigo-50/40 border border-indigo-100 p-5 rounded-2xl font-sans text-gray-900 whitespace-pre-wrap leading-relaxed text-sm sm:text-base font-normal'>
                  {prescriptionModalAppt.prescription ||
                    '1. Multivitamin supplement - 1 tablet daily after food for 14 days\n2. Maintain adequate hydration and follow up if symptoms persist.'}
                </pre>
              </div>

              {/* Digital Doctor Signature */}
              <div className='pt-5 border-t flex items-center justify-between text-sm text-gray-500'>
                <div>
                  <p className='text-xs text-gray-400 font-mono'>
                    Doc ID: {prescriptionModalAppt.docData._id?.slice(-8).toUpperCase()}
                  </p>
                  <p className='text-xs text-emerald-600 font-bold'>✓ Electronically Signed & Verified</p>
                </div>
                <div className='text-right'>
                  <div className='font-serif italic font-bold text-gray-800 text-base'>
                    {prescriptionModalAppt.docData.name}
                  </div>
                  <span className='text-xs text-gray-500 block'>Authorized Medical Practitioner</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className='mt-7 pt-4 border-t flex justify-end gap-3 no-print'>
              <button
                onClick={() => window.print()}
                className='px-6 py-3 border border-gray-300 rounded-2xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors'
              >
                🖨️ Print Prescription
              </button>
              <button
                onClick={() => setPrescriptionModalAppt(null)}
                className='px-7 py-3 bg-primary text-white rounded-2xl text-sm font-bold shadow-md hover:bg-opacity-95'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Tax Invoice / Receipt Modal (Printable) */}
      {receiptModalAppt && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in'>
          <div className='bg-white rounded-3xl w-full max-w-lg p-7 sm:p-8 shadow-2xl border print-container'>
            <div className='flex justify-between items-start border-b pb-4 mb-4'>
              <div>
                <h3 className='font-bold text-lg text-gray-900'>Consultation Tax Invoice</h3>
                <p className='text-xs text-gray-500'>Official Healthcare Billing Receipt</p>
              </div>
              <button
                onClick={() => setReceiptModalAppt(null)}
                className='text-gray-400 hover:text-gray-600 font-bold text-xl no-print'
              >
                ✕
              </button>
            </div>

            <div className='bg-gray-50 border rounded-2xl p-5 text-sm space-y-3 text-gray-700'>
              <div className='flex justify-between'>
                <span className='text-gray-500 font-medium'>Transaction Ref:</span>
                <span className='font-mono font-bold text-gray-900'>
                  {receiptModalAppt.paymentId || 'TXN_SIMULATED_2026'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500 font-medium'>Consulting Specialist:</span>
                <span className='font-bold text-gray-900'>{receiptModalAppt.docData.name}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500 font-medium'>Patient:</span>
                <span className='font-bold text-gray-900'>{receiptModalAppt.userData.name}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500 font-medium'>Payment Method:</span>
                <span className='font-bold text-gray-900'>{receiptModalAppt.paymentMethod || 'Online'}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500 font-medium'>Date of Service:</span>
                <span className='font-bold text-gray-900'>
                  {slotDateFormat(receiptModalAppt.slotDate)} ({receiptModalAppt.slotTime})
                </span>
              </div>
              <div className='flex justify-between pt-3.5 border-t border-gray-200 font-extrabold text-base text-gray-900'>
                <span>Total Paid:</span>
                <span className='text-emerald-600 text-lg'>
                  {currencySymbol}
                  {receiptModalAppt.amount} (Paid ✓)
                </span>
              </div>
            </div>

            <div className='mt-7 pt-4 border-t flex justify-end gap-3 no-print'>
              <button
                onClick={() => window.print()}
                className='px-6 py-3 border border-gray-300 rounded-2xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors'
              >
                🖨️ Print Receipt
              </button>
              <button
                onClick={() => setReceiptModalAppt(null)}
                className='px-7 py-3 bg-primary text-white rounded-2xl text-sm font-bold shadow-md hover:bg-opacity-95'
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Rating & Review Modal */}
      {ratingModalAppt && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in'>
          <div className='bg-white rounded-3xl w-full max-w-lg p-7 sm:p-8 shadow-2xl border'>
            <div className='flex justify-between items-center border-b pb-4 mb-4'>
              <h3 className='font-bold text-lg text-gray-900'>Rate Consultation Experience</h3>
              <button
                onClick={() => setRatingModalAppt(null)}
                className='text-gray-400 hover:text-gray-600 font-bold text-xl'
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRatingSubmit} className='space-y-5 text-sm'>
              <p className='text-gray-700 text-base'>
                How was your consultation with <strong className='text-gray-900'>{ratingModalAppt.docData.name}</strong>?
              </p>

              {/* Star Rating Picker */}
              <div className='flex justify-center gap-4 text-4xl py-3 bg-gray-50 rounded-2xl border border-gray-100'>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type='button'
                    onClick={() => setUserRating(star)}
                    className={`transition-transform hover:scale-125 focus:outline-none ${
                      star <= userRating ? 'text-amber-400' : 'text-gray-200'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <div>
                <label className='block font-bold text-gray-800 mb-2'>Doctor Review & Feedback:</label>
                <textarea
                  rows='3'
                  value={userReview}
                  onChange={(e) => setUserReview(e.target.value)}
                  placeholder='Share how the doctor helped with your condition, diagnosis accuracy, clinic behavior...'
                  className='w-full border border-gray-300 rounded-2xl p-3.5 outline-none focus:border-primary text-sm'
                />
              </div>

              <div className='pt-4 border-t flex justify-end gap-3'>
                <button
                  type='button'
                  onClick={() => setRatingModalAppt(null)}
                  className='px-6 py-3 border border-gray-300 rounded-2xl text-gray-700 hover:bg-gray-50 font-bold text-sm'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-7 py-3 bg-primary text-white rounded-2xl font-bold shadow-md hover:bg-opacity-95 text-sm'
                >
                  Submit Review
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
