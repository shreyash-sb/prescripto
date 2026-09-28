import { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctor from '../components/RelatedDoctor'
import DoctorIdentity from '../components/DoctorIdentity'
import { toast } from 'react-toastify'
import axios from 'axios'

const Appointment = () => {
  const { docId } = useParams()
  const { doctors, currencySymbol, backendUrl, token, userData, getDoctorData, t } = useContext(AppContext)
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  const navigate = useNavigate()

  const [docInfo, setDocInfo] = useState(null)
  const [docSlots, setDocSlots] = useState([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [slotTime, setSlotTime] = useState('')
  const [isBooking, setIsBooking] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const fetchDocInfo = async () => {
    const foundDoc = doctors.find((doc) => doc._id === docId)
    setDocInfo(foundDoc)
  }

  const getAvailableSlot = async () => {
    setDocSlots([])

    if (!docInfo) {
      return
    }

    const slotsBooked = docInfo.slots_booked || {}
    const slotDuration = Number(docInfo.slotDuration) || 30
    const shifts = docInfo.shifts || {
      morning: { enabled: true, start: '09:00', end: '13:00' },
      evening: { enabled: true, start: '16:00', end: '20:00' },
    }
    const vacationDates = docInfo.vacationDates || []

    let today = new Date()
    let allDaySlots = []

    for (let i = 0; i < 7; i++) {
      let currDate = new Date(today)
      currDate.setDate(today.getDate() + i)

      let day = currDate.getDate()
      let month = currDate.getMonth() + 1
      let year = currDate.getFullYear()
      let slotDate = `${day}_${month}_${year}`
      let slotDateAlt = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

      const isVacation = vacationDates.includes(slotDate) || vacationDates.includes(slotDateAlt)

      let timeSlots = []
      timeSlots.isVacation = isVacation
      timeSlots.slotDate = slotDate

      if (!isVacation) {
        const activeShifts = []
        if (shifts.morning?.enabled !== false) {
          activeShifts.push(shifts.morning || { start: '09:00', end: '13:00' })
        }
        if (shifts.evening?.enabled !== false) {
          activeShifts.push(shifts.evening || { start: '16:00', end: '20:00' })
        }

        const now = new Date()

        for (const shift of activeShifts) {
          const [startHour, startMin] = (shift.start || '09:00').split(':').map(Number)
          const [endHour, endMin] = (shift.end || '17:00').split(':').map(Number)

          let slotTimeRunner = new Date(currDate)
          slotTimeRunner.setHours(startHour, startMin, 0, 0)

          let shiftEndTime = new Date(currDate)
          shiftEndTime.setHours(endHour, endMin, 0, 0)

          while (slotTimeRunner < shiftEndTime) {
            const isFutureTime =
              today.getDate() !== currDate.getDate() ||
              slotTimeRunner.getTime() > now.getTime() + 15 * 60000

            let formattedTime = slotTimeRunner.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })

            const isAvailable = !slotsBooked[slotDate]?.includes(formattedTime)

            if (isFutureTime && isAvailable) {
              timeSlots.push({
                datetime: new Date(slotTimeRunner),
                time: formattedTime,
                hour: slotTimeRunner.getHours(),
              })
            }

            slotTimeRunner.setMinutes(slotTimeRunner.getMinutes() + slotDuration)
          }
        }
      }

      allDaySlots.push(timeSlots)
    }

    setDocSlots(allDaySlots)
  }

  const [patientProblem, setPatientProblem] = useState('')

  const handleBookingClick = () => {
    if (!token) {
      toast.warn('Please sign in or register to book your consultation')
      return navigate('/login')
    }
    const selectedSlot = docSlots[slotIndex]?.find((item) => item.time === slotTime)
    if (!selectedSlot) {
      return toast.warn('Please select an available consultation time slot')
    }
    setShowConfirmModal(true)
  }

  const confirmAndBookAppointment = async () => {
    try {
      const selectedSlot = docSlots[slotIndex]?.find((item) => item.time === slotTime)
      if (!selectedSlot) return

      setIsBooking(true)
      const date = selectedSlot.datetime
      const day = date.getDate()
      const month = date.getMonth() + 1
      const year = date.getFullYear()

      const slotDate = `${day}_${month}_${year}`

      const { data } = await axios.post(
        `${backendUrl}/api/user/book-appointment`,
        {
          docId,
          slotDate,
          slotTime,
          patientProblem: patientProblem.trim() || 'General Medical Consultation & Routine Checkup',
        },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message || 'Appointment booked successfully!')
        setShowConfirmModal(false)
        setPatientProblem('')
        await getDoctorData()
        navigate('/my-appointments')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Booking failed')
      console.log(error)
    } finally {
      setIsBooking(false)
    }
  }

  useEffect(() => {
    fetchDocInfo()
  }, [doctors, docId])

  useEffect(() => {
    if (docInfo) {
      getAvailableSlot()
    }
  }, [docInfo])

  const currentSlots = docSlots[slotIndex] || []
  const morningSlots = currentSlots.filter((s) => s.hour < 12)
  const afternoonSlots = currentSlots.filter((s) => s.hour >= 12 && s.hour < 17)
  const eveningSlots = currentSlots.filter((s) => s.hour >= 17)

  const crowd = docInfo?.liveQueue?.crowdStatus || 'Moderate'
  const inQueue = docInfo?.liveQueue?.totalInQueue || 4
  const estWait = inQueue * (docInfo?.liveQueue?.avgConsultMinutes || 10)

  return (
    docInfo && (
      <div className='py-6 max-w-6xl mx-auto'>
        {/* Breadcrumb Navigation */}
        <div className='flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-5 font-medium'>
          <span onClick={() => navigate('/')} className='cursor-pointer hover:text-primary'>
            {t('home')}
          </span>
          <span>›</span>
          <span onClick={() => navigate('/doctors')} className='cursor-pointer hover:text-primary'>
            {t('findDoctors')}
          </span>
          <span>›</span>
          <span className='text-gray-900 font-bold'>{docInfo.name}</span>
        </div>

        {/* Pre-Consultation Safety & Allergy Warning Banner if patient has documented allergies */}
        {userData?.allergies?.length > 0 && (
          <div className='mb-5 p-4 bg-amber-50/90 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 shadow-2xs'>
            <div className='flex items-center gap-2.5'>
              <span className='text-xl flex-shrink-0'>🛡️</span>
              <div>
                <p className='font-bold text-amber-950 text-xs sm:text-sm'>
                  Allergy Safety Shield Active
                </p>
                <p className='text-[11px] sm:text-xs text-amber-800 mt-0.5'>
                  Your documented allergies ({userData.allergies.join(', ')}) will be automatically flagged for Dr. {docInfo.name} to avoid adverse drug interactions.
                </p>
              </div>
            </div>
            <span className='text-[10px] font-bold bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full flex-shrink-0'>
              Shield Active ✓
            </span>
          </div>
        )}

        {/* Doctor Profile Card with Live Crowd & Queue Info */}
        <div className='flex flex-col sm:flex-row gap-6 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-xs'>
          <div className='sm:max-w-72 w-full relative'>
            <DoctorIdentity
              name={docInfo.name}
              speciality={docInfo.speciality}
              docId={docInfo._id}
              degree={docInfo.degree}
              mode='header'
            />
          </div>

          <div className='flex-1 flex flex-col justify-between'>
            <div>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <h1 className='flex items-center gap-2 text-2xl font-bold text-gray-900'>
                  {docInfo.name}
                  <img src={assets.verified_icon} className='w-5' alt='Verified Doctor' />
                </h1>
                <div className='bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1'>
                  <span>⭐</span> {docInfo.rating || '4.9'} ({docInfo.ratingsCount || 20}+ Verified Reviews)
                </div>
              </div>

              <div className='flex flex-wrap items-center gap-2.5 text-sm mt-2 text-gray-600'>
                <span className='font-semibold text-primary px-3 py-0.5 bg-indigo-50 border border-indigo-100 rounded-full text-xs'>
                  {docInfo.speciality}
                </span>
                <span>•</span>
                <span className='text-gray-700 font-medium text-xs sm:text-sm'>{docInfo.degree}</span>
                <span>•</span>
                <span className='text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full'>
                  {docInfo.experience} Experience
                </span>
              </div>

              {/* Live Crowd & Clinic Queue Status Bar */}
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 my-4 p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-xs'>
                <div className='flex items-center gap-2'>
                  <span className='text-xl'>👥</span>
                  <div>
                    <span className='text-[10px] uppercase font-bold text-gray-400 block'>Crowd Level</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        crowd === 'Low'
                          ? 'bg-emerald-100 text-emerald-800'
                          : crowd === 'Busy'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      ● {crowd}
                    </span>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <span className='text-xl'>⏱️</span>
                  <div>
                    <span className='text-[10px] uppercase font-bold text-gray-400 block'>Est. Wait Time</span>
                    <span className='font-bold text-xs sm:text-sm text-gray-900'>~{estWait} Mins</span>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <span className='text-xl'>🚪</span>
                  <div>
                    <span className='text-[10px] uppercase font-bold text-gray-400 block'>OPD Desk</span>
                    <span className='font-bold text-xs sm:text-sm text-gray-900'>{docInfo.roomNumber || 'OPD-102'}</span>
                  </div>
                </div>
              </div>

              {/* Doctor About */}
              <div>
                <p className='text-[10px] font-bold uppercase tracking-wider text-gray-400'>
                  About Doctor
                </p>
                <p className='text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed'>{docInfo.about}</p>
              </div>

              {/* Clinic Location */}
              {docInfo.address && (
                <div className='mt-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-600 flex items-start gap-2'>
                  <span className='text-sm'>📍</span>
                  <div>
                    <span className='font-semibold text-gray-800'>Clinic Location: </span>
                    <span>{docInfo.address.line1}, {docInfo.address.line2}</span>
                  </div>
                </div>
              )}
            </div>

            <div className='pt-4 mt-4 border-t border-gray-100 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <span className='text-xs text-gray-500 font-medium'>Consultation Fee:</span>
                <span className='text-primary font-bold text-2xl'>
                  {currencySymbol}
                  {docInfo.fees}
                </span>
              </div>
              <div
                className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  docInfo.available
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {docInfo.available ? '● Accepting Patients' : '● Currently Unavailable'}
              </div>
            </div>
          </div>
        </div>

        {/* 7-Day Slot Booking Section */}
        <div className='mt-6 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-xs'>
          <div className='flex flex-wrap items-center justify-between gap-3 mb-4'>
            <div>
              <h2 className='text-lg sm:text-xl font-bold text-gray-900'>Select Consultation Date & Time</h2>
              <p className='text-xs sm:text-sm text-gray-500 mt-0.5'>Choose an available 30-minute consultation slot</p>
            </div>
            <span className='text-xs bg-indigo-50 text-primary border border-indigo-100 px-3 py-1 rounded-full font-bold'>
              7-Day Calendar
            </span>
          </div>

          {/* Date Selector Carousel */}
          <div className='flex gap-3 items-center w-full overflow-x-auto pb-3 custom-scrollbar'>
            {docSlots.length > 0 &&
              docSlots.map((item, index) => {
                const dateObj = new Date()
                dateObj.setDate(dateObj.getDate() + index)
                const dayName = daysOfWeek[dateObj.getDay()]
                const dayNum = dateObj.getDate()
                const isToday = index === 0

                return (
                  <div
                    onClick={() => {
                      setSlotIndex(index)
                      setSlotTime('')
                    }}
                    key={index}
                    className={`text-center py-4 px-4 min-w-[85px] rounded-xl cursor-pointer transition-all ${
                      slotIndex === index
                        ? 'bg-primary text-white shadow-xs font-bold'
                        : 'border border-gray-200 hover:border-primary text-gray-700 bg-gray-50/70 hover:bg-white'
                    }`}
                  >
                    <p className='text-[11px] uppercase font-bold opacity-80'>
                      {isToday ? 'Today' : dayName}
                    </p>
                    <p className='text-xl font-bold mt-0.5'>{dayNum}</p>
                    <span className={`text-[10px] block mt-0.5 font-medium ${
                      item.isVacation ? 'text-amber-500' : 'opacity-80'
                    }`}>
                      {item.isVacation ? '🏖️ Leave' : item.length > 0 ? `${item.length} slots` : 'Closed'}
                    </span>
                  </div>
                )
              })}
          </div>

          {/* Categorized Time Slots */}
          <div className='mt-6 space-y-4'>
            {currentSlots.isVacation ? (
              <div className='p-8 bg-amber-50/80 border border-amber-200 rounded-xl text-center text-xs text-amber-900'>
                <p className='text-3xl mb-2'>🏖️</p>
                <p className='font-bold text-sm text-amber-900'>Doctor on Scheduled Leave</p>
                <p className='mt-1 text-amber-700 text-xs max-w-sm mx-auto'>
                  Dr. {docInfo.name} is unavailable on this date. Please choose another day from the 7-day calendar.
                </p>
              </div>
            ) : currentSlots.length === 0 ? (
              <div className='p-8 bg-gray-50 border border-dashed rounded-xl text-center text-xs text-gray-500'>
                <p className='text-2xl mb-1'>⏳</p>
                <p className='font-bold text-sm text-gray-700'>No slots available for this date</p>
                <p className='mt-0.5 text-xs'>Please select another day from the calendar above.</p>
              </div>
            ) : (
              <>
                {morningSlots.length > 0 && (
                  <div>
                    <p className='text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5'>
                      <span>🌅</span> Morning (09:00 AM – 12:00 PM)
                    </p>
                    <div className='flex flex-wrap gap-2'>
                      {morningSlots.map((item, index) => (
                        <button
                          type='button'
                          onClick={() => setSlotTime(item.time)}
                          className={`text-xs sm:text-sm px-4 py-2 rounded-xl transition-all font-semibold ${
                            item.time === slotTime
                              ? 'bg-primary text-white shadow-2xs font-bold'
                              : 'border border-gray-200 text-gray-700 hover:border-primary bg-white'
                          }`}
                          key={index}
                        >
                          {item.time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {afternoonSlots.length > 0 && (
                  <div className='pt-1'>
                    <p className='text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5'>
                      <span>☀️</span> Afternoon (12:00 PM – 05:00 PM)
                    </p>
                    <div className='flex flex-wrap gap-2'>
                      {afternoonSlots.map((item, index) => (
                        <button
                          type='button'
                          onClick={() => setSlotTime(item.time)}
                          className={`text-xs sm:text-sm px-4 py-2 rounded-xl transition-all font-semibold ${
                            item.time === slotTime
                              ? 'bg-primary text-white shadow-2xs font-bold'
                              : 'border border-gray-200 text-gray-700 hover:border-primary bg-white'
                          }`}
                          key={index}
                        >
                          {item.time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {eveningSlots.length > 0 && (
                  <div className='pt-1'>
                    <p className='text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5'>
                      <span>🌙</span> Evening (05:00 PM – 09:00 PM)
                    </p>
                    <div className='flex flex-wrap gap-2'>
                      {eveningSlots.map((item, index) => (
                        <button
                          type='button'
                          onClick={() => setSlotTime(item.time)}
                          className={`text-xs sm:text-sm px-4 py-2 rounded-xl transition-all font-semibold ${
                            item.time === slotTime
                              ? 'bg-primary text-white shadow-2xs font-bold'
                              : 'border border-gray-200 text-gray-700 hover:border-primary bg-white'
                          }`}
                          key={index}
                        >
                          {item.time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Footer */}
          <div className='mt-8 pt-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4'>
            <div className='text-xs sm:text-sm text-gray-600'>
              {slotTime ? (
                <div className='flex items-center gap-2'>
                  <span className='w-2.5 h-2.5 rounded-full bg-emerald-500' />
                  <span>
                    Selected Slot: <strong className='text-primary text-base font-bold'>{slotTime}</strong>
                  </span>
                </div>
              ) : (
                <p className='text-gray-500 text-xs sm:text-sm'>Select an available time slot above to proceed</p>
              )}
            </div>

            <button
              disabled={!slotTime || !docInfo.available}
              onClick={handleBookingClick}
              className={`w-full sm:w-auto text-xs sm:text-sm font-bold px-8 py-3 rounded-full transition-all shadow-xs active:scale-95 ${
                !slotTime || !docInfo.available
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-opacity-95'
              }`}
            >
              Book Appointment Now →
            </button>
          </div>
        </div>

        {/* Confirmation & Medical Case Submission Modal */}
        {showConfirmModal && (
          <div className='fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto'>
            <div className='bg-white rounded-2xl w-full max-w-lg p-6 sm:p-7 shadow-xl border border-gray-100 my-4'>
              <div className='flex justify-between items-center pb-3 border-b border-gray-100'>
                <div>
                  <h3 className='font-bold text-base text-gray-900'>Confirm Consultation Booking</h3>
                  <p className='text-xs text-gray-500'>Dr. {docInfo.name} ({docInfo.speciality})</p>
                </div>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className='w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold flex items-center justify-center text-xs'
                >
                  ✕
                </button>
              </div>

              <div className='my-4 space-y-3.5 text-xs sm:text-sm'>
                {/* Appointment Summary Box */}
                <div className='bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-100 grid grid-cols-2 gap-2 text-xs'>
                  <div>
                    <span className='text-gray-500 block text-[10px] uppercase font-bold'>Doctor</span>
                    <span className='font-bold text-gray-900'>{docInfo.name}</span>
                    <span className='text-primary block text-[11px] font-semibold'>{docInfo.speciality}</span>
                  </div>
                  <div>
                    <span className='text-gray-500 block text-[10px] uppercase font-bold'>Slot</span>
                    <span className='font-bold text-gray-900'>{slotTime}</span>
                    <span className='text-gray-500 block text-[11px]'>Room {docInfo.roomNumber || 'OPD-102'}</span>
                  </div>
                  <div className='col-span-2 flex justify-between border-t border-indigo-200/80 pt-2 font-bold text-gray-900'>
                    <span>Consultation Fee:</span>
                    <span className='text-primary font-bold text-sm'>
                      {currencySymbol}{docInfo.fees}
                    </span>
                  </div>
                </div>

                {/* Patient Current Problem / Symptoms Input */}
                <div>
                  <label className='block font-bold text-gray-800 mb-1 text-xs'>
                    🩺 Describe Your Current Symptoms / Case <span className='text-rose-500'>*</span>
                  </label>
                  <p className='text-[11px] text-gray-500 mb-1.5'>
                    The attending doctor will review this prior to your consultation.
                  </p>
                  <textarea
                    rows='3'
                    required
                    value={patientProblem}
                    onChange={(e) => setPatientProblem(e.target.value)}
                    placeholder='e.g., Fever and mild cough since yesterday. Feeling fatigued...'
                    className='w-full border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-primary font-sans'
                  />
                </div>

                {/* Auto-attached medical summary */}
                <div className='p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5 text-xs'>
                  <div className='flex items-center justify-between'>
                    <span className='font-bold text-gray-800 text-[11px] flex items-center gap-1'>
                      <span>📋</span> Profile Health Shield Attached
                    </span>
                    <span className='text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded'>
                      Verified ✓
                    </span>
                  </div>

                  <div className='grid grid-cols-2 gap-2 text-xs pt-1'>
                    <div className='bg-white p-2 rounded-lg border border-gray-100'>
                      <span className='text-[10px] text-gray-400 font-bold block uppercase'>Blood Group</span>
                      <span className='font-bold text-rose-600'>{userData?.bloodGroup || 'O+'}</span>
                    </div>
                    <div className='bg-white p-2 rounded-lg border border-gray-100'>
                      <span className='text-[10px] text-gray-400 font-bold block uppercase'>Drug Allergies</span>
                      <span className='font-medium text-gray-800'>
                        {userData?.allergies?.length > 0 ? userData.allergies.join(', ') : 'None recorded'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className='flex gap-2.5 pt-3 border-t border-gray-100'>
                <button
                  type='button'
                  onClick={() => setShowConfirmModal(false)}
                  className='w-1/3 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50'
                >
                  Back
                </button>
                <button
                  type='button'
                  disabled={isBooking}
                  onClick={confirmAndBookAppointment}
                  className='w-2/3 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5'
                >
                  {isBooking ? 'Submitting...' : 'Submit & Book Slot →'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Related Doctors */}
        <RelatedDoctor docId={docId} speciality={docInfo.speciality} />
      </div>
    )
  )
}

export default Appointment
