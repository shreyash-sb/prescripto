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
  const { doctors, currencySymbol, backendUrl, token, getDoctorData } = useContext(AppContext)
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
        // Generate slots across configured shifts
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
        { docId, slotDate, slotTime },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message || 'Appointment booked successfully!')
        setShowConfirmModal(false)
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

  // Split current day's slots into Morning, Afternoon, Evening
  const currentSlots = docSlots[slotIndex] || []
  const morningSlots = currentSlots.filter((s) => s.hour < 12)
  const afternoonSlots = currentSlots.filter((s) => s.hour >= 12 && s.hour < 17)
  const eveningSlots = currentSlots.filter((s) => s.hour >= 17)

  return (
    docInfo && (
      <div className='py-6'>
        {/* Breadcrumb Navigation */}
        <div className='flex items-center gap-2 text-sm text-gray-500 mb-5 font-medium'>
          <span onClick={() => navigate('/')} className='cursor-pointer hover:text-primary'>
            Home
          </span>
          <span>›</span>
          <span onClick={() => navigate('/doctors')} className='cursor-pointer hover:text-primary'>
            Doctors
          </span>
          <span>›</span>
          <span className='text-gray-900 font-bold'>{docInfo.name}</span>
        </div>

        {/* Doctor Profile Card */}
        <div className='flex flex-col sm:flex-row gap-8 bg-white p-6 sm:p-10 rounded-3xl border border-gray-200/90 shadow-sm'>
          <div className='sm:max-w-80 w-full'>
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
                <p className='flex items-center gap-2.5 text-2xl sm:text-3xl font-extrabold text-gray-900'>
                  {docInfo.name}
                  <img src={assets.verified_icon} className='w-6' alt='Verified Doctor' />
                </p>
                <div className='bg-amber-50 text-amber-900 border border-amber-200 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-sm'>
                  <span>⭐</span> {docInfo.rating || '4.9'} ({docInfo.ratingsCount || 20}+ Verified Reviews)
                </div>
              </div>

              <div className='flex flex-wrap items-center gap-3 text-base mt-2.5 text-gray-600'>
                <span className='font-bold text-primary px-3.5 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-sm sm:text-base'>
                  {docInfo.speciality}
                </span>
                <span>•</span>
                <p className='font-semibold text-gray-800'>{docInfo.degree}</p>
                <span className='py-1 px-3.5 bg-gray-100 text-gray-800 text-xs sm:text-sm rounded-full font-bold'>
                  {docInfo.experience} Experience
                </span>
              </div>

              {/* Doctor About */}
              <div className='mt-6'>
                <p className='flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400'>
                  Professional Background <img src={assets.info_icon} className='w-4' alt='' />
                </p>
                <p className='text-base text-gray-700 mt-2 leading-relaxed max-w-3xl font-normal'>{docInfo.about}</p>
              </div>

              {/* Clinic Location */}
              {docInfo.address && (
                <div className='mt-5 p-4 bg-gray-50 rounded-2xl border border-gray-200 text-sm text-gray-700 flex items-start gap-3'>
                  <span className='text-xl'>📍</span>
                  <div>
                    <p className='font-bold text-gray-900 text-base'>Consultation Clinic Location:</p>
                    <p className='text-gray-600 mt-0.5'>
                      {docInfo.address.line1}, {docInfo.address.line2}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className='pt-6 mt-6 border-t border-gray-100 flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <p className='text-gray-500 font-medium text-sm sm:text-base'>Consultation Fee:</p>
                <span className='text-primary font-black text-3xl'>
                  {currencySymbol}
                  {docInfo.fees}
                </span>
              </div>
              <div
                className={`text-sm px-4 py-2 rounded-full font-bold shadow-sm ${
                  docInfo.available
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {docInfo.available ? '● Accepting Bookings' : '● Currently Unavailable'}
              </div>
            </div>
          </div>
        </div>

        {/* 7-Day Slot Booking Section */}
        <div className='mt-8 bg-white p-6 sm:p-10 rounded-3xl border border-gray-200/90 shadow-sm'>
          <div className='flex flex-wrap items-center justify-between gap-3 mb-5'>
            <div>
              <h2 className='text-xl sm:text-2xl font-bold text-gray-900'>Select Consultation Date & Time</h2>
              <p className='text-sm text-gray-500 mt-1'>Choose a preferred 30-minute consultation session</p>
            </div>
            <span className='text-sm bg-indigo-50 text-primary border border-indigo-200 px-4 py-1.5 rounded-full font-bold'>
              7-Day Live Calendar
            </span>
          </div>

          {/* Date Selector Carousel */}
          <div className='flex gap-4 items-center w-full overflow-x-auto pb-4 custom-scrollbar'>
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
                    className={`text-center py-5 px-5 min-w-[95px] rounded-2xl cursor-pointer transition-all ${
                      slotIndex === index
                        ? 'bg-primary text-white shadow-xl scale-105 font-bold'
                        : 'border border-gray-200 hover:border-primary text-gray-700 bg-gray-50/80 hover:bg-white'
                    }`}
                  >
                    <p className='text-xs uppercase font-bold opacity-80'>
                      {isToday ? 'Today' : dayName}
                    </p>
                    <p className='text-2xl font-black mt-1'>{dayNum}</p>
                    <span className={`text-xs block mt-1 font-semibold ${
                      item.isVacation ? 'text-amber-500' : 'opacity-80'
                    }`}>
                      {item.isVacation ? '🏖️ Leave' : item.length > 0 ? `${item.length} slots` : 'Closed'}
                    </span>
                  </div>
                )
              })}
          </div>

          {/* Categorized Time Slots */}
          <div className='mt-8 space-y-5'>
            {currentSlots.isVacation ? (
              <div className='p-10 bg-amber-50/80 border border-amber-200 rounded-3xl text-center text-sm text-amber-900'>
                <p className='text-4xl mb-3'>🏖️</p>
                <p className='font-bold text-base text-amber-900'>Doctor on Scheduled Leave / Vacation</p>
                <p className='mt-2 text-amber-700 text-sm max-w-md mx-auto'>
                  Dr. {docInfo.name} is unavailable on this date. Please choose another day from the 7-day calendar above.
                </p>
              </div>
            ) : currentSlots.length === 0 ? (
              <div className='p-10 bg-gray-50 border border-dashed rounded-3xl text-center text-sm text-gray-500'>
                <p className='text-3xl mb-2'>⏳</p>
                <p className='font-bold text-base text-gray-800'>No slots available for this date</p>
                <p className='mt-1 text-sm'>Please select another day from the 7-day calendar above.</p>
              </div>
            ) : (
              <>
                {/* Morning Slots */}
                {morningSlots.length > 0 && (
                  <div>
                    <p className='text-sm font-bold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-2'>
                      <span>🌅</span> Morning Slots (10:00 AM – 12:00 PM)
                    </p>
                    <div className='flex flex-wrap gap-3'>
                      {morningSlots.map((item, index) => (
                        <button
                          type='button'
                          onClick={() => setSlotTime(item.time)}
                          className={`text-sm sm:text-base px-5 py-3 rounded-2xl transition-all font-bold ${
                            item.time === slotTime
                              ? 'bg-primary text-white shadow-lg scale-105'
                              : 'border border-gray-300 text-gray-700 hover:border-primary bg-white'
                          }`}
                          key={index}
                        >
                          {item.time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Afternoon Slots */}
                {afternoonSlots.length > 0 && (
                  <div className='pt-2'>
                    <p className='text-sm font-bold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-2'>
                      <span>☀️</span> Afternoon Slots (12:00 PM – 05:00 PM)
                    </p>
                    <div className='flex flex-wrap gap-3'>
                      {afternoonSlots.map((item, index) => (
                        <button
                          type='button'
                          onClick={() => setSlotTime(item.time)}
                          className={`text-sm sm:text-base px-5 py-3 rounded-2xl transition-all font-bold ${
                            item.time === slotTime
                              ? 'bg-primary text-white shadow-lg scale-105'
                              : 'border border-gray-300 text-gray-700 hover:border-primary bg-white'
                          }`}
                          key={index}
                        >
                          {item.time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Evening Slots */}
                {eveningSlots.length > 0 && (
                  <div className='pt-2'>
                    <p className='text-sm font-bold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-2'>
                      <span>🌙</span> Evening Slots (05:00 PM – 09:00 PM)
                    </p>
                    <div className='flex flex-wrap gap-3'>
                      {eveningSlots.map((item, index) => (
                        <button
                          type='button'
                          onClick={() => setSlotTime(item.time)}
                          className={`text-sm sm:text-base px-5 py-3 rounded-2xl transition-all font-bold ${
                            item.time === slotTime
                              ? 'bg-primary text-white shadow-lg scale-105'
                              : 'border border-gray-300 text-gray-700 hover:border-primary bg-white'
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
          <div className='mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-5'>
            <div className='text-sm text-gray-600'>
              {slotTime ? (
                <div className='flex items-center gap-2.5'>
                  <span className='w-3 h-3 rounded-full bg-emerald-500' />
                  <span className='text-base'>
                    Selected Slot: <strong className='text-primary text-lg font-extrabold'>{slotTime}</strong>
                  </span>
                </div>
              ) : (
                <p className='text-gray-500 text-base'>Click on any available time slot above to schedule</p>
              )}
            </div>

            <button
              disabled={!slotTime || !docInfo.available}
              onClick={handleBookingClick}
              className={`w-full sm:w-auto text-base font-extrabold px-10 py-4 rounded-full transition-all shadow-lg active:scale-95 ${
                !slotTime || !docInfo.available
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-opacity-95'
              }`}
            >
              Book Appointment Now →
            </button>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in'>
            <div className='bg-white rounded-3xl w-full max-w-lg p-7 sm:p-8 shadow-2xl border'>
              <div className='flex justify-between items-center pb-4 border-b border-gray-100'>
                <h3 className='font-bold text-lg text-gray-900'>Confirm Appointment</h3>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className='text-gray-400 hover:text-gray-600 font-bold text-lg'
                >
                  ✕
                </button>
              </div>

              <div className='my-5 space-y-4 text-sm'>
                <div className='bg-indigo-50/70 p-5 rounded-2xl border border-indigo-100/80 space-y-2.5'>
                  <div className='flex justify-between text-base'>
                    <span className='text-gray-600 font-medium'>Doctor:</span>
                    <span className='font-bold text-gray-900'>{docInfo.name}</span>
                  </div>
                  <div className='flex justify-between text-base'>
                    <span className='text-gray-600 font-medium'>Speciality:</span>
                    <span className='text-primary font-bold'>{docInfo.speciality}</span>
                  </div>
                  <div className='flex justify-between text-base'>
                    <span className='text-gray-600 font-medium'>Time Slot:</span>
                    <span className='font-bold text-gray-900'>{slotTime}</span>
                  </div>
                  <div className='flex justify-between border-t border-indigo-200/80 pt-2.5 font-bold text-lg text-gray-900'>
                    <span>Consultation Fee:</span>
                    <span className='text-primary font-extrabold text-xl'>
                      {currencySymbol}
                      {docInfo.fees}
                    </span>
                  </div>
                </div>
                <p className='text-xs text-gray-500 text-center leading-relaxed'>
                  You can pay online via Card/UPI or choose Cash on arrival in the appointments portal.
                </p>
              </div>

              <div className='flex gap-3 pt-3 border-t border-gray-100'>
                <button
                  type='button'
                  onClick={() => setShowConfirmModal(false)}
                  className='w-1/2 py-3 rounded-2xl border border-gray-300 text-sm font-bold text-gray-600 hover:bg-gray-50'
                >
                  Cancel
                </button>
                <button
                  type='button'
                  disabled={isBooking}
                  onClick={confirmAndBookAppointment}
                  className='w-1/2 py-3 rounded-2xl bg-primary text-white text-sm font-bold shadow-md hover:bg-opacity-95'
                >
                  {isBooking ? 'Booking...' : 'Confirm Booking'}
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
