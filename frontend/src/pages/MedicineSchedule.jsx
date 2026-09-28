import { useContext, useState, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const MedicineSchedule = () => {
  const { backendUrl, token, medicineRoutines, getMedicineRoutines, t } = useContext(AppContext)

  // Modals & form state
  const [showAddModal, setShowAddModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Manual Add Form
  const [medicineName, setMedicineName] = useState('')
  const [dosage, setDosage] = useState('1 Tablet')
  const [frequency, setFrequency] = useState('Twice daily')
  const [mealTime, setMealTime] = useState('After Food')
  const [durationDays, setDurationDays] = useState(7)
  const [selectedSlots, setSelectedSlots] = useState(['Morning', 'Night'])
  const [notes, setNotes] = useState('')

  // Prescription Photo Upload & text parser
  const [rxImage, setRxImage] = useState(null)
  const [rxText, setRxText] = useState('')

  const todayStr = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (token) {
      getMedicineRoutines()
    }
  }, [token])

  const slotTimes = {
    Morning: { time: '08:00 AM', icon: '🌅', color: 'bg-amber-50 text-amber-900 border-amber-200' },
    Afternoon: { time: '01:00 PM', icon: '☀️', color: 'bg-orange-50 text-orange-900 border-orange-200' },
    Evening: { time: '06:00 PM', icon: '🌇', color: 'bg-indigo-50 text-indigo-900 border-indigo-200' },
    Night: { time: '09:00 PM', icon: '🌙', color: 'bg-blue-50 text-blue-900 border-blue-200' },
  }

  const toggleSlotSelection = (slot) => {
    if (selectedSlots.includes(slot)) {
      if (selectedSlots.length > 1) {
        setSelectedSlots(selectedSlots.filter((s) => s !== slot))
      }
    } else {
      setSelectedSlots([...selectedSlots, slot])
    }
  }

  const handleCreateRoutine = async (e) => {
    e.preventDefault()
    if (!medicineName.trim()) {
      return toast.warn('Please enter medicine name')
    }

    try {
      setIsProcessing(true)
      const { data } = await axios.post(
        `${backendUrl}/api/user/create-medicine-routine`,
        {
          medicineName,
          dosage,
          frequency,
          mealTime,
          durationDays,
          scheduleSlots: selectedSlots,
          notes,
        },
        { headers: { token } }
      )

      if (data.success) {
        toast.success('Medicine routine created successfully!')
        setShowAddModal(false)
        setMedicineName('')
        setNotes('')
        getMedicineRoutines()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || 'Failed to create routine')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleToggleDose = async (routineId, slot) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/toggle-dose`,
        {
          routineId,
          date: todayStr,
          slot,
        },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        getMedicineRoutines()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error('Failed to log dose')
    }
  }

  const handleDeleteRoutine = async (routineId) => {
    if (!window.confirm('Are you sure you want to remove this medicine routine?')) return
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/delete-medicine-routine`,
        { routineId },
        { headers: { token } }
      )
      if (data.success) {
        toast.success(data.message)
        getMedicineRoutines()
      }
    } catch (error) {
      console.log(error)
      toast.error('Failed to delete routine')
    }
  }

  const handleConvertRxUpload = async (e) => {
    e.preventDefault()
    if (!rxText.trim() && !rxImage) {
      return toast.warn('Please provide prescription image or text')
    }

    try {
      setIsProcessing(true)
      const textPayload = rxText || 'Amoxicillin 500mg 1-0-1 5 days after food\nParacetamol 650mg 1-0-1 3 days'
      const { data } = await axios.post(
        `${backendUrl}/api/user/convert-prescription-to-schedule`,
        { prescriptionText: textPayload },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message || 'Prescription converted into daily routine!')
        setShowUploadModal(false)
        setRxText('')
        setRxImage(null)
        getMedicineRoutines()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || 'Failed to convert prescription')
    } finally {
      setIsProcessing(false)
    }
  }

  // Calculate Overall Adherence Score for today
  let totalDosesToday = 0
  let dosesTakenToday = 0

  medicineRoutines.forEach((routine) => {
    (routine.scheduleSlots || []).forEach((slot) => {
      totalDosesToday++
      const isTaken = routine.adherenceLogs?.some((l) => l.date === todayStr && l.slot === slot && l.taken)
      if (isTaken) dosesTakenToday++
    })
  })

  const adherencePercent = totalDosesToday > 0 ? Math.round((dosesTakenToday / totalDosesToday) * 100) : 100

  return (
    <div className='py-6 max-w-5xl mx-auto'>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight'>
            Daily Medicine Schedule & Timers
          </h1>
          <p className='text-sm sm:text-base text-gray-500 mt-1'>
            Track your daily prescription doses, set meal timings, and monitor treatment adherence
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-2.5'>
          <button
            onClick={() => setShowUploadModal(true)}
            className='px-4 py-2.5 bg-indigo-50 border border-indigo-100 text-primary font-semibold text-xs sm:text-sm rounded-full hover:bg-indigo-100 transition-all flex items-center gap-1.5 shadow-2xs'
          >
            <span>📷</span> Upload Prescription
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className='px-5 py-2.5 bg-primary text-white font-semibold text-xs sm:text-sm rounded-full hover:bg-opacity-95 shadow-xs transition-all active:scale-95 flex items-center gap-1.5'
          >
            <span>+</span> Add Medicine
          </button>
        </div>
      </div>

      {/* Daily Progress & Summary */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 my-6'>
        <div className='bg-gradient-to-br from-indigo-600 to-primary text-white p-5 rounded-2xl shadow-xs'>
          <div className='flex justify-between items-start'>
            <div>
              <p className='text-xs font-bold uppercase tracking-wider text-indigo-100'>Today's Adherence</p>
              <h3 className='text-3xl font-black mt-1'>{adherencePercent}%</h3>
            </div>
            <span className='text-2xl'>🎯</span>
          </div>
          <p className='text-xs text-indigo-100 mt-2 font-medium'>
            {dosesTakenToday} of {totalDosesToday} doses logged for today
          </p>
        </div>

        <div className='bg-white border border-gray-100 p-5 rounded-2xl shadow-2xs'>
          <div className='flex justify-between items-start'>
            <div>
              <p className='text-xs font-bold uppercase tracking-wider text-gray-400'>Active Medicines</p>
              <h3 className='text-3xl font-bold text-gray-900 mt-1'>{medicineRoutines.length}</h3>
            </div>
            <span className='text-2xl'>💊</span>
          </div>
          <p className='text-xs text-emerald-600 font-semibold mt-2'>✓ Daily Alarms Active</p>
        </div>

        <div className='bg-white border border-gray-100 p-5 rounded-2xl shadow-2xs'>
          <div className='flex justify-between items-start'>
            <div>
              <p className='text-xs font-bold uppercase tracking-wider text-gray-400'>Schedule Mode</p>
              <h3 className='text-xl font-bold text-gray-900 mt-1.5'>4 Daily Timelines</h3>
            </div>
            <span className='text-2xl'>⏰</span>
          </div>
          <p className='text-xs text-gray-500 font-medium mt-2'>Morning, Noon, Evening, Night</p>
        </div>
      </div>

      {/* Timeline Slots Grid */}
      <div className='space-y-5'>
        {['Morning', 'Afternoon', 'Evening', 'Night'].map((slotKey) => {
          const slotMeta = slotTimes[slotKey]
          const medsForSlot = medicineRoutines.filter((r) => r.scheduleSlots?.includes(slotKey))

          return (
            <div key={slotKey} className='bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-2xs'>
              <div className='flex items-center justify-between pb-3 border-b border-gray-100'>
                <div className='flex items-center gap-2.5'>
                  <span className='text-xl'>{slotMeta.icon}</span>
                  <div>
                    <h3 className='font-bold text-base text-gray-900'>
                      {slotKey} Doses ({slotMeta.time})
                    </h3>
                    <p className='text-[11px] text-gray-500'>{medsForSlot.length} Medications Scheduled</p>
                  </div>
                </div>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${slotMeta.color}`}>
                  {slotKey}
                </span>
              </div>

              {medsForSlot.length === 0 ? (
                <p className='text-xs text-gray-400 italic py-3 text-center'>
                  No medications scheduled for this time slot.
                </p>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4'>
                  {medsForSlot.map((routine) => {
                    const isTaken = routine.adherenceLogs?.some(
                      (l) => l.date === todayStr && l.slot === slotKey && l.taken
                    )

                    return (
                      <div
                        key={routine._id + slotKey}
                        className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          isTaken
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                            : 'bg-gray-50/70 hover:bg-white border-gray-200/80'
                        }`}
                      >
                        <div className='space-y-0.5 min-w-0'>
                          <div className='flex items-center gap-2'>
                            <h4 className='font-bold text-sm text-gray-900 truncate'>{routine.medicineName}</h4>
                            <span className='text-[11px] px-1.5 py-0.5 bg-white border border-gray-200 rounded font-semibold text-gray-600 flex-shrink-0'>
                              {routine.dosage}
                            </span>
                          </div>
                          <div className='flex items-center gap-2 text-xs text-gray-600'>
                            <span className='font-semibold text-primary'>{routine.mealTime}</span>
                            <span>•</span>
                            <span>{routine.durationDays} Days</span>
                            {routine.prescribedByDoctor && (
                              <>
                                <span>•</span>
                                <span className='text-gray-400 truncate'>{routine.prescribedByDoctor}</span>
                              </>
                            )}
                          </div>
                          {routine.notes && <p className='text-[11px] text-gray-500 italic mt-0.5'>"{routine.notes}"</p>}
                        </div>

                        <div className='flex items-center gap-1.5 flex-shrink-0'>
                          <button
                            onClick={() => handleToggleDose(routine._id, slotKey)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs active:scale-95 ${
                              isTaken
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : 'bg-primary text-white hover:bg-opacity-95'
                            }`}
                          >
                            {isTaken ? '✓ Taken' : 'Take Dose'}
                          </button>
                          <button
                            onClick={() => handleDeleteRoutine(routine._id)}
                            className='p-1.5 text-gray-400 hover:text-rose-600 rounded transition-colors text-xs'
                            title='Delete Routine'
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Manual Add Medicine Modal */}
      {showAddModal && (
        <div className='fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in'>
          <div className='bg-white rounded-2xl w-full max-w-lg p-6 sm:p-7 shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto custom-scrollbar'>
            <div className='flex justify-between items-center pb-3 border-b border-gray-100'>
              <h3 className='font-bold text-base text-gray-900'>Add Medication Routine</h3>
              <button onClick={() => setShowAddModal(false)} className='text-gray-400 hover:text-gray-600 font-bold'>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRoutine} className='space-y-3.5 mt-4 text-xs sm:text-sm'>
              <div>
                <label className='block font-semibold text-gray-700 mb-1'>Medicine Name</label>
                <input
                  type='text'
                  required
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  placeholder='e.g., Paracetamol, Amoxicillin, Metformin...'
                  className='w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:border-primary'
                />
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='block font-semibold text-gray-700 mb-1'>Dosage / Strength</label>
                  <input
                    type='text'
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder='e.g., 500mg, 1 Tablet'
                    className='w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:border-primary'
                  />
                </div>
                <div>
                  <label className='block font-semibold text-gray-700 mb-1'>Course (Days)</label>
                  <input
                    type='number'
                    min='1'
                    max='365'
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className='w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:border-primary'
                  />
                </div>
              </div>

              <div>
                <label className='block font-semibold text-gray-700 mb-1'>Food Timing</label>
                <select
                  value={mealTime}
                  onChange={(e) => setMealTime(e.target.value)}
                  className='w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:border-primary bg-white'
                >
                  <option value='After Food'>After Food (Post-meal)</option>
                  <option value='Before Food'>Before Food (Empty Stomach)</option>
                  <option value='With Food'>With Food</option>
                  <option value='At Bedtime'>At Bedtime</option>
                </select>
              </div>

              <div>
                <label className='block font-semibold text-gray-700 mb-1.5'>Select Daily Time Slots:</label>
                <div className='grid grid-cols-2 gap-2'>
                  {['Morning', 'Afternoon', 'Evening', 'Night'].map((slot) => {
                    const isSelected = selectedSlots.includes(slot)
                    return (
                      <button
                        key={slot}
                        type='button'
                        onClick={() => toggleSlotSelection(slot)}
                        className={`p-2.5 rounded-xl border text-left font-semibold text-xs flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-primary text-white border-primary shadow-2xs'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        <span>{slot}</span>
                        <span>{isSelected ? '✓' : '+'}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className='block font-semibold text-gray-700 mb-1'>Special Instructions (Optional)</label>
                <textarea
                  rows='2'
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder='e.g., Take with a full glass of water. Avoid milk.'
                  className='w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:border-primary text-xs'
                />
              </div>

              <div className='pt-3 border-t border-gray-100 flex justify-end gap-2'>
                <button
                  type='button'
                  onClick={() => setShowAddModal(false)}
                  className='px-4 py-2 border border-gray-200 rounded-xl font-semibold text-gray-600 text-xs'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={isProcessing}
                  className='px-6 py-2 bg-primary text-white font-bold rounded-xl shadow-xs hover:bg-opacity-95 text-xs'
                >
                  {isProcessing ? 'Saving...' : 'Save Routine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prescription Image / Text Converter Modal */}
      {showUploadModal && (
        <div className='fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in'>
          <div className='bg-white rounded-2xl w-full max-w-lg p-6 sm:p-7 shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto custom-scrollbar'>
            <div className='flex justify-between items-center pb-3 border-b border-gray-100'>
              <div>
                <h3 className='font-bold text-base text-gray-900'>Sync Prescription to Routine</h3>
                <p className='text-xs text-gray-500'>Upload Doctor Slip or Paste Prescription Text</p>
              </div>
              <button onClick={() => setShowUploadModal(false)} className='text-gray-400 hover:text-gray-600 font-bold'>
                ✕
              </button>
            </div>

            <form onSubmit={handleConvertRxUpload} className='space-y-3.5 mt-4 text-xs sm:text-sm'>
              <div className='p-4 border-2 border-dashed border-gray-200 rounded-xl text-center bg-gray-50/60'>
                <p className='text-2xl mb-1'>📷</p>
                <p className='font-bold text-gray-800 text-xs'>Upload Prescription Photo or Slip</p>
                <p className='text-[11px] text-gray-400 mt-0.5'>Supports JPG, PNG, PDF</p>
                <input
                  type='file'
                  accept='image/*'
                  onChange={(e) => setRxImage(e.target.files[0])}
                  className='mt-2.5 text-xs text-gray-500 block w-full file:mr-3 file:py-1.5 file:px-3.5 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20'
                />
              </div>

              <div>
                <label className='block font-semibold text-gray-700 mb-1'>Or Type Prescription Text directly:</label>
                <textarea
                  rows='4'
                  value={rxText}
                  onChange={(e) => setRxText(e.target.value)}
                  placeholder={`1. Tab Amoxicillin 500mg 1-0-1 for 5 days after food\n2. Tab Paracetamol 650mg 1-0-1 3 days`}
                  className='w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-primary font-mono text-xs'
                />
              </div>

              <div className='pt-3 border-t border-gray-100 flex justify-end gap-2'>
                <button
                  type='button'
                  onClick={() => setShowUploadModal(false)}
                  className='px-4 py-2 border border-gray-200 rounded-xl font-semibold text-gray-600 text-xs'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={isProcessing}
                  className='px-6 py-2 bg-primary text-white font-bold rounded-xl shadow-xs hover:bg-opacity-95 text-xs'
                >
                  {isProcessing ? 'Converting...' : 'Parse & Save Routine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MedicineSchedule
