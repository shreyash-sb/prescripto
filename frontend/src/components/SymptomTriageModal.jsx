import { useState, useContext } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const SymptomTriageModal = ({ isOpen, onClose }) => {
  const { backendUrl, currencySymbol, t } = useContext(AppContext)
  const navigate = useNavigate()

  const [symptomsInput, setSymptomsInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [triageResult, setTriageResult] = useState(null)

  if (!isOpen) return null

  const quickSymptoms = [
    'Fever, sore throat & fatigue',
    'Skin rash, redness & itching',
    'Severe migraine headache & dizziness',
    'Acid reflux, stomach pain & bloating',
    'Child developmental check & fever',
    'Pregnancy & prenatal checkup',
  ]

  const handleAnalyze = async (textToUse) => {
    const query = textToUse || symptomsInput
    if (!query.trim()) {
      return toast.warn('Please describe your symptoms')
    }

    try {
      setIsAnalyzing(true)
      const { data } = await axios.post(`${backendUrl}/api/user/symptom-triage`, {
        symptoms: query,
      })

      if (data.success) {
        setTriageResult(data.triage)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || 'Symptom analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleBookSpecialist = (docId) => {
    onClose()
    if (docId) {
      navigate(`/appointment/${docId}`)
    } else if (triageResult?.matchedSpeciality) {
      navigate(`/doctors/${triageResult.matchedSpeciality}`)
    }
  }

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in'>
      <div className='bg-white rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl border max-h-[90vh] overflow-y-auto custom-scrollbar'>
        {/* Header */}
        <div className='flex items-center justify-between pb-4 border-b'>
          <div className='flex items-center gap-3'>
            <div className='w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl'>
              🩺
            </div>
            <div>
              <h3 className='font-black text-xl text-gray-900'>AI Clinical Symptom Triage</h3>
              <p className='text-xs text-gray-500'>Instant Specialist Recommender & Pre-Consultation Advisory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold'
          >
            ✕
          </button>
        </div>

        {/* Input Form */}
        <div className='mt-5 space-y-4'>
          <div>
            <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2'>
              Describe what you are experiencing in plain language:
            </label>
            <textarea
              rows='3'
              value={symptomsInput}
              onChange={(e) => setSymptomsInput(e.target.value)}
              placeholder='E.g., I have had a red itchy rash on my arm for 3 days and slight fever...'
              className='w-full border border-gray-300 rounded-2xl p-3.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm sm:text-base'
            />
          </div>

          {/* Quick Symptom Chips */}
          <div>
            <p className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-2'>Quick Symptom Presets:</p>
            <div className='flex flex-wrap gap-2'>
              {quickSymptoms.map((symp, idx) => (
                <button
                  key={idx}
                  type='button'
                  onClick={() => {
                    setSymptomsInput(symp)
                    handleAnalyze(symp)
                  }}
                  className='text-xs bg-gray-50 hover:bg-indigo-50 hover:text-primary hover:border-indigo-200 border border-gray-200 px-3 py-1.5 rounded-full font-medium transition-all text-gray-700'
                >
                  {symp}
                </button>
              ))}
            </div>
          </div>

          <div className='pt-2 flex justify-end'>
            <button
              onClick={() => handleAnalyze()}
              disabled={isAnalyzing || !symptomsInput.trim()}
              className='w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-full font-bold shadow-md hover:opacity-95 transition-all active:scale-95 disabled:opacity-50'
            >
              {isAnalyzing ? 'Analyzing Clinical Signals...' : '🔍 Analyze Symptoms & Find Doctor'}
            </button>
          </div>
        </div>

        {/* Triage Output */}
        {triageResult && (
          <div className='mt-6 pt-6 border-t space-y-5 animate-fade-in'>
            <div className='p-5 bg-indigo-50/70 border border-indigo-100 rounded-3xl space-y-3'>
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <div>
                  <span className='text-xs font-bold uppercase tracking-wider text-primary'>Recommended Medical Speciality:</span>
                  <h4 className='text-2xl font-black text-gray-900 mt-0.5'>{triageResult.matchedSpeciality}</h4>
                </div>
                <div className='bg-emerald-100 text-emerald-800 font-bold px-3.5 py-1.5 rounded-full text-xs'>
                  Confidence: {triageResult.confidence}%
                </div>
              </div>

              <p className='text-sm text-gray-700 leading-relaxed font-medium'>{triageResult.triageSummary}</p>

              <div className='pt-3 border-t border-indigo-200/70'>
                <p className='text-xs font-bold text-gray-700 uppercase tracking-wider mb-2'>
                  🩺 Pre-Consultation Precautions & Home Care:
                </p>
                <ul className='space-y-1.5 text-xs sm:text-sm text-gray-700 list-disc pl-5'>
                  {triageResult.precautions?.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommended Available Doctors */}
            {triageResult.recommendedDoctors?.length > 0 && (
              <div>
                <p className='text-xs font-bold text-gray-800 uppercase tracking-wider mb-3'>
                  Top Available Specialists for your Symptoms:
                </p>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  {triageResult.recommendedDoctors.map((doc) => (
                    <div
                      key={doc._id}
                      onClick={() => handleBookSpecialist(doc._id)}
                      className='p-4 bg-white border border-gray-200 hover:border-primary rounded-2xl cursor-pointer hover:shadow-md transition-all flex items-center justify-between gap-3'
                    >
                      <div className='flex items-center gap-3'>
                        <img src={doc.image} className='w-12 h-12 rounded-xl object-cover border' alt='' />
                        <div>
                          <p className='font-bold text-gray-900 text-sm'>{doc.name}</p>
                          <p className='text-xs text-primary font-semibold'>{doc.speciality}</p>
                          <span className='text-[10px] text-gray-500 font-mono'>
                            ⭐ {doc.rating || 4.9} • {currencySymbol}
                            {doc.fees}
                          </span>
                        </div>
                      </div>
                      <button className='px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-xl hover:bg-primary hover:text-white transition-colors'>
                        Book →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className='pt-2 flex justify-end gap-3'>
              <button
                onClick={() => handleBookSpecialist()}
                className='w-full py-3.5 bg-primary text-white rounded-full font-bold shadow-md hover:bg-opacity-95 text-sm'
              >
                Browse All {triageResult.matchedSpeciality} Specialists →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SymptomTriageModal
