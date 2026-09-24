import { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import DoctorIdentity from '../../components/DoctorIdentity'

const DoctorProfile = () => {
  const { dToken, profileData, getProfileData, backendUrl } =
    useContext(DoctorContext)
  const { currency } = useContext(AppContext)

  const [isEdit, setIsEdit] = useState(false)
  const [newVacationDate, setNewVacationDate] = useState('')
  const [formData, setFormData] = useState({
    fees: '',
    address: { line1: '', line2: '' },
    available: true,
    slotDuration: 30,
    shifts: {
      morning: { enabled: true, start: '09:00', end: '13:00' },
      evening: { enabled: true, start: '16:00', end: '20:00' },
    },
    vacationDates: [],
  })

  useEffect(() => {
    if (dToken) {
      getProfileData()
    }
  }, [dToken])

  useEffect(() => {
    if (profileData) {
      setFormData({
        fees: profileData.fees || 50,
        address: profileData.address || { line1: '', line2: '' },
        available: profileData.available ?? true,
        slotDuration: profileData.slotDuration || 30,
        shifts: profileData.shifts || {
          morning: { enabled: true, start: '09:00', end: '13:00' },
          evening: { enabled: true, start: '16:00', end: '20:00' },
        },
        vacationDates: profileData.vacationDates || [],
      })
    }
  }, [profileData])

  const updateProfile = async () => {
    try {
      const updateData = {
        address: formData.address,
        fees: formData.fees,
        available: formData.available,
        slotDuration: formData.slotDuration,
        shifts: formData.shifts,
        vacationDates: formData.vacationDates,
      }
      const { data } = await axios.post(
        backendUrl + '/api/doctor/update-profile',
        updateData,
        { headers: { dToken } }
      )
      if (data.success) {
        toast.success(data.message)
        setIsEdit(false)
        getProfileData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const handleCancelEdit = () => {
    if (profileData) {
      setFormData({
        fees: profileData.fees || 50,
        address: profileData.address || { line1: '', line2: '' },
        available: profileData.available ?? true,
        slotDuration: profileData.slotDuration || 30,
        shifts: profileData.shifts || {
          morning: { enabled: true, start: '09:00', end: '13:00' },
          evening: { enabled: true, start: '16:00', end: '20:00' },
        },
        vacationDates: profileData.vacationDates || [],
      })
    }
    setIsEdit(false)
  }

  const handleAddVacationDate = () => {
    if (!newVacationDate) return
    // Format YYYY-MM-DD to D_M_YYYY or keep standardized
    const [year, month, day] = newVacationDate.split('-').map(Number)
    const formatted = `${day}_${month}_${year}`
    if (formData.vacationDates.includes(formatted)) {
      return toast.warn('This vacation date is already scheduled')
    }
    setFormData((prev) => ({
      ...prev,
      vacationDates: [...prev.vacationDates, formatted],
    }))
    setNewVacationDate('')
  }

  const handleRemoveVacationDate = (dateToRemove) => {
    setFormData((prev) => ({
      ...prev,
      vacationDates: prev.vacationDates.filter((d) => d !== dateToRemove),
    }))
  }

  if (!profileData) {
    return (
      <div className='m-6 p-12 text-center bg-white rounded-2xl border shadow-sm'>
        <div className='inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent'></div>
        <p className='mt-3 text-sm text-gray-500 font-medium'>Loading doctor profile...</p>
      </div>
    )
  }

  return (
    <div className='w-full max-w-6xl m-4 sm:m-6 space-y-6'>
      {/* Page Title & Controls */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
        <div>
          <h1 className='text-xl sm:text-2xl font-bold text-gray-900'>Doctor Practice Profile & Schedule</h1>
          <p className='text-xs sm:text-sm text-gray-500'>
            Manage clinical credentials, custom consultation shifts, appointment slot lengths, and vacation dates.
          </p>
        </div>
        <div>
          {isEdit ? (
            <div className='flex items-center gap-2'>
              <button
                onClick={handleCancelEdit}
                className='px-4 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-100 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={updateProfile}
                className='px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow transition-colors'
              >
                Save All Changes
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEdit(true)}
              className='px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow transition-colors flex items-center gap-1.5'
            >
              <span>✏️</span>
              <span>Edit Practice & Schedule</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Profile Avatar & Details */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* Left Column: Identity & Status Card (4/12) */}
        <div className='lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col items-center text-center'>
          <div className='w-full flex justify-center mb-4'>
            <DoctorIdentity
              name={profileData.name}
              speciality={profileData.speciality}
              docId={profileData._id}
              degree={profileData.degree}
              mode='header'
            />
          </div>

          <div className='flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mt-2'>
            <span>✓</span>
            <span>Verified Medical Specialist</span>
          </div>

          <div className='w-full mt-6 pt-5 border-t border-gray-100 space-y-3 text-left'>
            <div className='flex items-center justify-between text-xs'>
              <span className='text-gray-500'>Speciality:</span>
              <span className='font-bold text-gray-800'>{profileData.speciality}</span>
            </div>
            <div className='flex items-center justify-between text-xs'>
              <span className='text-gray-500'>Medical Degree:</span>
              <span className='font-bold text-gray-800'>{profileData.degree}</span>
            </div>
            <div className='flex items-center justify-between text-xs'>
              <span className='text-gray-500'>Clinical Experience:</span>
              <span className='font-bold text-gray-800'>{profileData.experience}</span>
            </div>
          </div>

          {/* Availability Status Box */}
          <div className={`w-full mt-6 p-4 rounded-xl border text-left transition-all ${
            (isEdit ? formData.available : profileData.available)
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : 'bg-rose-50/70 border-rose-200 text-rose-900'
          }`}>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <span className={`w-2.5 h-2.5 rounded-full ${
                  (isEdit ? formData.available : profileData.available) ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}></span>
                <span className='text-xs font-bold'>
                  {(isEdit ? formData.available : profileData.available) ? 'Accepting Patients' : 'Schedule Paused'}
                </span>
              </div>
              {isEdit && (
                <input
                  type='checkbox'
                  checked={formData.available}
                  onChange={(e) => setFormData((prev) => ({ ...prev, available: e.target.checked }))}
                  className='w-4 h-4 accent-indigo-600 cursor-pointer'
                />
              )}
            </div>
            <p className='text-[11px] mt-1.5 opacity-80 leading-relaxed'>
              {(isEdit ? formData.available : profileData.available)
                ? 'Your profile is active on the patient portal for booking appointments.'
                : 'Patients cannot book new appointments with you at this time.'}
            </p>
          </div>
        </div>

        {/* Right Column: Bio, Schedule & Vacation Management (8/12) */}
        <div className='lg:col-span-8 space-y-6'>
          {/* 1. Shift & Working Hours Configuration */}
          <div className='bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm'>
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-2'>
                <span className='text-base'>⏰</span>
                <h2 className='text-sm font-bold text-gray-900 uppercase tracking-wider'>
                  Consultation Shifts & Slot Duration
                </h2>
              </div>
              <span className='text-[10px] font-bold px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200'>
                {formData.slotDuration || 30} mins / slot
              </span>
            </div>

            {isEdit ? (
              <div className='space-y-4'>
                {/* Slot Duration Selector */}
                <div>
                  <label className='block text-xs font-semibold text-gray-700 mb-1.5'>
                    Consultation Slot Duration:
                  </label>
                  <div className='flex flex-wrap gap-2'>
                    {[15, 20, 30, 45, 60].map((dur) => (
                      <button
                        key={dur}
                        type='button'
                        onClick={() => setFormData((prev) => ({ ...prev, slotDuration: dur }))}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                          formData.slotDuration === dur
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {dur} Minutes
                      </button>
                    ))}
                  </div>
                </div>

                {/* Morning Shift */}
                <div className='p-3.5 bg-gray-50 rounded-xl border border-gray-100'>
                  <div className='flex items-center justify-between mb-2'>
                    <label className='text-xs font-bold text-gray-800 flex items-center gap-1.5'>
                      <span>🌅</span> Morning Consultation Shift
                    </label>
                    <input
                      type='checkbox'
                      checked={formData.shifts?.morning?.enabled ?? true}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          shifts: {
                            ...prev.shifts,
                            morning: { ...prev.shifts.morning, enabled: e.target.checked },
                          },
                        }))
                      }
                      className='accent-indigo-600 cursor-pointer'
                    />
                  </div>
                  <div className='grid grid-cols-2 gap-3 text-xs'>
                    <div>
                      <span className='text-gray-500 block mb-1'>Start Time</span>
                      <input
                        type='time'
                        value={formData.shifts?.morning?.start || '09:00'}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            shifts: {
                              ...prev.shifts,
                              morning: { ...prev.shifts.morning, start: e.target.value },
                            },
                          }))
                        }
                        className='w-full px-2.5 py-1.5 border rounded-lg bg-white'
                      />
                    </div>
                    <div>
                      <span className='text-gray-500 block mb-1'>End Time</span>
                      <input
                        type='time'
                        value={formData.shifts?.morning?.end || '13:00'}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            shifts: {
                              ...prev.shifts,
                              morning: { ...prev.shifts.morning, end: e.target.value },
                            },
                          }))
                        }
                        className='w-full px-2.5 py-1.5 border rounded-lg bg-white'
                      />
                    </div>
                  </div>
                </div>

                {/* Evening Shift */}
                <div className='p-3.5 bg-gray-50 rounded-xl border border-gray-100'>
                  <div className='flex items-center justify-between mb-2'>
                    <label className='text-xs font-bold text-gray-800 flex items-center gap-1.5'>
                      <span>🌆</span> Evening Consultation Shift
                    </label>
                    <input
                      type='checkbox'
                      checked={formData.shifts?.evening?.enabled ?? true}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          shifts: {
                            ...prev.shifts,
                            evening: { ...prev.shifts.evening, enabled: e.target.checked },
                          },
                        }))
                      }
                      className='accent-indigo-600 cursor-pointer'
                    />
                  </div>
                  <div className='grid grid-cols-2 gap-3 text-xs'>
                    <div>
                      <span className='text-gray-500 block mb-1'>Start Time</span>
                      <input
                        type='time'
                        value={formData.shifts?.evening?.start || '16:00'}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            shifts: {
                              ...prev.shifts,
                              evening: { ...prev.shifts.evening, start: e.target.value },
                            },
                          }))
                        }
                        className='w-full px-2.5 py-1.5 border rounded-lg bg-white'
                      />
                    </div>
                    <div>
                      <span className='text-gray-500 block mb-1'>End Time</span>
                      <input
                        type='time'
                        value={formData.shifts?.evening?.end || '20:00'}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            shifts: {
                              ...prev.shifts,
                              evening: { ...prev.shifts.evening, end: e.target.value },
                            },
                          }))
                        }
                        className='w-full px-2.5 py-1.5 border rounded-lg bg-white'
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='p-4 bg-indigo-50/50 rounded-xl border border-indigo-100'>
                  <div className='flex items-center justify-between'>
                    <span className='text-xs font-bold text-gray-800'>🌅 Morning Shift</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      formData.shifts?.morning?.enabled !== false
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {formData.shifts?.morning?.enabled !== false ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <p className='text-sm font-bold text-indigo-700 mt-2'>
                    {formData.shifts?.morning?.start || '09:00'} — {formData.shifts?.morning?.end || '13:00'}
                  </p>
                </div>

                <div className='p-4 bg-indigo-50/50 rounded-xl border border-indigo-100'>
                  <div className='flex items-center justify-between'>
                    <span className='text-xs font-bold text-gray-800'>🌆 Evening Shift</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      formData.shifts?.evening?.enabled !== false
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {formData.shifts?.evening?.enabled !== false ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <p className='text-sm font-bold text-indigo-700 mt-2'>
                    {formData.shifts?.evening?.start || '16:00'} — {formData.shifts?.evening?.end || '20:00'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 2. Vacation & Scheduled Leave Dates */}
          <div className='bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm'>
            <div className='flex items-center justify-between mb-3'>
              <div className='flex items-center gap-2'>
                <span className='text-base'>🏖️</span>
                <h2 className='text-sm font-bold text-gray-900 uppercase tracking-wider'>
                  Vacation & Scheduled Leaves
                </h2>
              </div>
              <span className='text-xs text-gray-400'>
                {formData.vacationDates?.length || 0} Dates Blocked
              </span>
            </div>

            <p className='text-xs text-gray-500 mb-4'>
              Mark dates when you are away on conference or holiday. The patient booking calendar will automatically block slots for these dates.
            </p>

            {isEdit && (
              <div className='flex items-center gap-2 mb-4'>
                <input
                  type='date'
                  value={newVacationDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setNewVacationDate(e.target.value)}
                  className='text-xs px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'
                />
                <button
                  type='button'
                  onClick={handleAddVacationDate}
                  className='px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors'
                >
                  + Add Vacation Date
                </button>
              </div>
            )}

            {formData.vacationDates?.length === 0 ? (
              <div className='p-4 bg-gray-50 rounded-xl text-center text-xs text-gray-400 border border-gray-100'>
                No scheduled leaves or vacation dates active. You are fully available on your regular shift schedule.
              </div>
            ) : (
              <div className='flex flex-wrap gap-2'>
                {formData.vacationDates.map((dateStr, idx) => (
                  <span
                    key={idx}
                    className='inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold'
                  >
                    <span>📅 {dateStr.replace(/_/g, '/')}</span>
                    {isEdit && (
                      <button
                        type='button'
                        onClick={() => handleRemoveVacationDate(dateStr)}
                        className='text-amber-600 hover:text-amber-900 font-bold ml-1'
                        title='Remove leave date'
                      >
                        ✕
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 3. Consultation Fee & Billing Policy */}
          <div className='bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm'>
            <div className='flex items-center gap-2 mb-3'>
              <span className='text-base'>💳</span>
              <h2 className='text-sm font-bold text-gray-900 uppercase tracking-wider'>Consultation Fee & Billing</h2>
            </div>

            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-indigo-50/40 rounded-xl border border-indigo-100/80'>
              <div>
                <p className='text-xs font-semibold text-gray-700'>Standard Consultation Fee (per appointment)</p>
                <p className='text-[11px] text-gray-500 mt-0.5'>Patients can pay online via Gateway Sandbox or in-clinic cash collection.</p>
              </div>

              <div className='flex items-center gap-2'>
                <span className='text-lg font-bold text-indigo-700'>{currency}</span>
                {isEdit ? (
                  <input
                    type='number'
                    min='0'
                    value={formData.fees}
                    onChange={(e) => setFormData((prev) => ({ ...prev, fees: Number(e.target.value) }))}
                    className='w-28 px-3 py-1.5 text-sm font-bold border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white'
                  />
                ) : (
                  <span className='text-2xl font-bold text-gray-900'>{profileData.fees}</span>
                )}
              </div>
            </div>
          </div>

          {/* 4. Clinic Address & Location */}
          <div className='bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm'>
            <div className='flex items-center gap-2 mb-3'>
              <span className='text-base'>📍</span>
              <h2 className='text-sm font-bold text-gray-900 uppercase tracking-wider'>Clinic Location & Address</h2>
            </div>

            {isEdit ? (
              <div className='space-y-3'>
                <div>
                  <label className='block text-xs font-semibold text-gray-700 mb-1'>Address Line 1</label>
                  <input
                    type='text'
                    value={formData.address?.line1 || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: { ...prev.address, line1: e.target.value },
                      }))
                    }
                    placeholder='e.g. 57th Cross, Richmond Circle'
                    className='w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'
                  />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-700 mb-1'>Address Line 2</label>
                  <input
                    type='text'
                    value={formData.address?.line2 || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: { ...prev.address, line2: e.target.value },
                      }))
                    }
                    placeholder='e.g. Medical Plaza, Floor 3'
                    className='w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'
                  />
                </div>
              </div>
            ) : (
              <div className='flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100'>
                <div className='p-2 bg-indigo-100 text-indigo-700 rounded-lg text-xs'>🏢</div>
                <div>
                  <p className='text-xs font-bold text-gray-800'>{profileData.address?.line1 || 'Clinic Address Line 1'}</p>
                  <p className='text-xs text-gray-500 mt-0.5'>{profileData.address?.line2 || 'Clinic Address Line 2'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorProfile
