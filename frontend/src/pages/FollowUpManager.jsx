import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { slotDateFormat } from '../utils/formatters'

const FollowUpManager = () => {
  const { backendUrl, token, t } = useContext(AppContext)
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState([])
  const [selectedApptForCheckin, setSelectedApptForCheckin] = useState(null)
  const [symptomRating, setSymptomRating] = useState(5)
  const [symptomsState, setSymptomsState] = useState('Significantly Improved')
  const [checkinNotes, setCheckinNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/list-appointments`, {
        headers: { token },
      })
      if (data.success) {
        setAppointments(data.appointments)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (token) {
      fetchAppointments()
    }
  }, [token])

  const handleCheckinSubmit = async (e) => {
    e.preventDefault()
    if (!selectedApptForCheckin) return

    try {
      setIsSubmitting(true)
      const { data } = await axios.post(
        `${backendUrl}/api/user/follow-up-checkin`,
        {
          appointmentId: selectedApptForCheckin._id,
          rating: symptomRating,
          symptomsState,
          notes: checkinNotes,
        },
        { headers: { token } }
      )

      if (data.success) {
        toast.success('Follow-up check-in submitted! Your doctor has been notified.')
        setSelectedApptForCheckin(null)
        fetchAppointments()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error('Failed to submit check-in')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter completed consultations eligible for follow-up
  const followUpEligible = appointments.filter((a) => a.isCompleted && !a.cancelled)

  return (
    <div className='py-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2.5'>
            <span>🔄</span> {t('followUpTitle')}
          </h1>
          <p className='text-sm sm:text-base text-gray-500 mt-1'>{t('followUpSubtitle')}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 my-6'>
        <div className='bg-indigo-50 border border-indigo-100 p-5 rounded-3xl'>
          <p className='text-xs font-bold text-primary uppercase tracking-wider'>Follow-ups Monitored</p>
          <h3 className='text-3xl font-black text-gray-900 mt-1'>{followUpEligible.length}</h3>
          <p className='text-xs text-gray-600 mt-1.5'>Completed consultations in recovery tracking</p>
        </div>

        <div className='bg-emerald-50 border border-emerald-100 p-5 rounded-3xl'>
          <p className='text-xs font-bold text-emerald-700 uppercase tracking-wider'>Check-Ins Completed</p>
          <h3 className='text-3xl font-black text-emerald-900 mt-1'>
            {followUpEligible.filter((a) => a.followUp?.status === 'Completed').length}
          </h3>
          <p className='text-xs text-emerald-700 mt-1.5'>Recovery progress shared with doctor</p>
        </div>

        <div className='bg-amber-50 border border-amber-100 p-5 rounded-3xl'>
          <p className='text-xs font-bold text-amber-800 uppercase tracking-wider'>Pending Follow-Up</p>
          <h3 className='text-3xl font-black text-amber-900 mt-1'>
            {followUpEligible.filter((a) => a.followUp?.status !== 'Completed').length}
          </h3>
          <p className='text-xs text-amber-800 mt-1.5'>Action recommended for full wellness</p>
        </div>
      </div>

      {/* Consultation Follow-Up List */}
      <div className='space-y-4'>
        {followUpEligible.length === 0 ? (
          <div className='bg-white rounded-3xl border p-12 text-center'>
            <p className='text-5xl mb-3'>🩺</p>
            <h3 className='text-lg font-bold text-gray-800'>No Active Consultations in Follow-Up</h3>
            <p className='text-sm text-gray-500 mt-2 max-w-sm mx-auto'>
              When you complete a consultation with any of our verified doctors, your follow-up timeline and recovery tracker will appear here.
            </p>
            <button
              onClick={() => navigate('/doctors')}
              className='mt-5 bg-primary text-white text-sm font-bold px-7 py-3 rounded-full shadow-md'
            >
              Book a Consultation →
            </button>
          </div>
        ) : (
          followUpEligible.map((item) => {
            const hasCheckin = item.followUp?.patientFeedback

            return (
              <div
                key={item._id}
                className='bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6'
              >
                <div className='flex items-start gap-4'>
                  <img
                    src={item.docData.image}
                    alt=''
                    className='w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border'
                  />
                  <div>
                    <div className='flex items-center gap-2'>
                      <h3 className='text-xl font-extrabold text-gray-900'>{item.docData.name}</h3>
                      <span className='text-xs bg-indigo-50 text-primary border border-indigo-200 px-2.5 py-0.5 rounded-full font-bold'>
                        {item.docData.speciality}
                      </span>
                    </div>

                    <p className='text-xs text-gray-500 mt-1'>
                      Consultation Date: <strong>{slotDateFormat(item.slotDate)}</strong> ({item.slotTime})
                    </p>

                    {item.followUp?.dueDate && (
                      <div className='mt-2 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg'>
                        <span>📅</span> Follow-up Target: {item.followUp.dueDate} (~{item.followUp.recommendedDays || 7} Days Interval)
                      </div>
                    )}

                    {hasCheckin && (
                      <div className='mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900'>
                        <span className='font-bold block'>✓ Your Recovery Check-In: {hasCheckin.symptomsState}</span>
                        <span className='text-emerald-700 italic'>"{hasCheckin.notes}"</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className='flex flex-col sm:flex-row md:flex-col gap-2.5 min-w-[200px]'>
                  <button
                    onClick={() => {
                      setSelectedApptForCheckin(item)
                      setSymptomRating(item.followUp?.patientFeedback?.rating || 5)
                      setSymptomsState(item.followUp?.patientFeedback?.symptomsState || 'Significantly Improved')
                      setCheckinNotes(item.followUp?.patientFeedback?.notes || '')
                    }}
                    className='py-3 px-5 bg-indigo-50 hover:bg-indigo-100 text-primary border border-indigo-200 font-extrabold text-sm rounded-2xl transition-all text-center flex items-center justify-center gap-2'
                  >
                    <span>📋</span> {hasCheckin ? 'Update Recovery Log' : 'Submit Recovery Check-In'}
                  </button>

                  <button
                    onClick={() => navigate(`/appointment/${item.docId}`)}
                    className='py-3 px-5 bg-primary text-white font-extrabold text-sm rounded-2xl shadow-md hover:bg-opacity-95 transition-all active:scale-95 text-center flex items-center justify-center gap-2'
                  >
                    <span>🩺</span> {t('bookFollowUpBtn')}
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Recovery Check-In Modal */}
      {selectedApptForCheckin && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in'>
          <div className='bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl border'>
            <div className='flex justify-between items-center pb-4 border-b'>
              <div>
                <h3 className='font-black text-xl text-gray-900'>Recovery Progress Check-In</h3>
                <p className='text-xs text-gray-500'>Dr. {selectedApptForCheckin.docData.name}</p>
              </div>
              <button
                onClick={() => setSelectedApptForCheckin(null)}
                className='text-gray-400 hover:text-gray-600 font-bold'
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCheckinSubmit} className='space-y-4 mt-4 text-sm'>
              <div>
                <label className='block font-bold text-gray-800 mb-2'>
                  {t('checkinPrompt')}
                </label>
                <div className='grid grid-cols-2 gap-2'>
                  {[
                    { val: 'Resolved', label: 'Fully Resolved 😊' },
                    { val: 'Significantly Improved', label: 'Much Better 👍' },
                    { val: 'Same', label: 'Same / Mild 😐' },
                    { val: 'Worse', label: 'Worse / Need Visit 🚨' },
                  ].map((st) => (
                    <button
                      key={st.val}
                      type='button'
                      onClick={() => setSymptomsState(st.val)}
                      className={`p-3 rounded-2xl border text-xs font-bold transition-all text-center ${
                        symptomsState === st.val
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className='block font-bold text-gray-800 mb-1'>Overall Recovery Rating (1 to 5):</label>
                <div className='flex justify-center gap-4 py-2 bg-gray-50 rounded-2xl border text-2xl'>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type='button'
                      onClick={() => setSymptomRating(star)}
                      className={`hover:scale-125 transition-transform ${
                        star <= symptomRating ? 'text-amber-400' : 'text-gray-200'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className='block font-bold text-gray-800 mb-1'>Detailed Recovery Notes for Doctor:</label>
                <textarea
                  rows='3'
                  value={checkinNotes}
                  onChange={(e) => setCheckinNotes(e.target.value)}
                  placeholder='Describe if fever is gone, any remaining symptoms, medication tolerance...'
                  className='w-full border border-gray-300 rounded-2xl p-3.5 outline-none focus:border-primary text-sm'
                />
              </div>

              <div className='pt-3 border-t flex justify-end gap-3'>
                <button
                  type='button'
                  onClick={() => setSelectedApptForCheckin(null)}
                  className='px-5 py-2.5 border rounded-2xl font-bold text-gray-600'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='px-7 py-2.5 bg-primary text-white font-bold rounded-2xl shadow-md hover:bg-opacity-95'
                >
                  {isSubmitting ? 'Submitting...' : 'Save Recovery Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default FollowUpManager
