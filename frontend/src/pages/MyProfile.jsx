import { useContext, useState, useEffect } from 'react'
import { assets } from '../assets/assets.js'
import { AppContext } from '../context/AppContext.jsx'
import axios from 'axios'
import { toast } from 'react-toastify'
import UserIdentity from '../components/UserIdentity.jsx'

const COMMON_ALLERGIES = [
  'Penicillin',
  'Sulfa Drugs',
  'Aspirin',
  'Ibuprofen',
  'Amoxicillin',
  'Peanuts',
  'Latex',
  'Contrast Dye',
]

const COMMON_CONDITIONS = [
  'Hypertension (High BP)',
  'Type-2 Diabetes',
  'Asthma',
  'Thyroid Disorder',
  'Heart Condition',
]

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const MyProfile = () => {
  const { userData, backendUrl, token, loadUserProfileData, currencySymbol } =
    useContext(AppContext)

  const [isEdit, setIsEdit] = useState(false)
  const [image, setImage] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    dob: '',
    gender: 'Not selected',
    bloodGroup: 'O+',
    address: { line1: '', line2: '' },
    allergies: [],
    chronicConditions: [],
    emergencyContact: { name: '', relationship: '', phone: '' },
  })

  const [customAllergy, setCustomAllergy] = useState('')
  const [customCondition, setCustomCondition] = useState('')

  useEffect(() => {
    if (userData) {
      setEditForm({
        name: userData.name || '',
        phone: userData.phone || '',
        dob: userData.dob || '',
        gender: userData.gender || 'Not selected',
        bloodGroup: userData.bloodGroup || 'O+',
        address: {
          line1: userData.address?.line1 || '',
          line2: userData.address?.line2 || '',
        },
        allergies: userData.allergies || [],
        chronicConditions: userData.chronicConditions || [],
        emergencyContact: {
          name: userData.emergencyContact?.name || '',
          relationship: userData.emergencyContact?.relationship || '',
          phone: userData.emergencyContact?.phone || '',
        },
      })
    }
  }, [userData])

  const toggleAllergy = (item) => {
    setEditForm((prev) => {
      const exists = prev.allergies.includes(item)
      return {
        ...prev,
        allergies: exists ? prev.allergies.filter((a) => a !== item) : [...prev.allergies, item],
      }
    })
  }

  const addCustomAllergy = () => {
    if (!customAllergy.trim()) return
    if (!editForm.allergies.includes(customAllergy.trim())) {
      setEditForm((prev) => ({
        ...prev,
        allergies: [...prev.allergies, customAllergy.trim()],
      }))
    }
    setCustomAllergy('')
  }

  const toggleCondition = (item) => {
    setEditForm((prev) => {
      const exists = prev.chronicConditions.includes(item)
      return {
        ...prev,
        chronicConditions: exists
          ? prev.chronicConditions.filter((c) => c !== item)
          : [...prev.chronicConditions, item],
      }
    })
  }

  const addCustomCondition = () => {
    if (!customCondition.trim()) return
    if (!editForm.chronicConditions.includes(customCondition.trim())) {
      setEditForm((prev) => ({
        ...prev,
        chronicConditions: [...prev.chronicConditions, customCondition.trim()],
      }))
    }
    setCustomCondition('')
  }

  const updateUserProfileData = async () => {
    try {
      setIsSaving(true)
      const formData = new FormData()
      formData.append('name', editForm.name)
      formData.append('phone', editForm.phone)
      formData.append('address', JSON.stringify(editForm.address))
      formData.append('gender', editForm.gender)
      formData.append('dob', editForm.dob)
      formData.append('bloodGroup', editForm.bloodGroup)
      formData.append('allergies', JSON.stringify(editForm.allergies))
      formData.append('chronicConditions', JSON.stringify(editForm.chronicConditions))
      formData.append('emergencyContact', JSON.stringify(editForm.emergencyContact))

      if (image) {
        formData.append('image', image)
      }

      const { data } = await axios.post(backendUrl + '/api/user/update-profile', formData, {
        headers: { token },
      })

      if (data.success) {
        toast.success(data.message || 'Profile updated successfully!')
        await loadUserProfileData()
        setIsEdit(false)
        setImage(false)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (!userData) {
    return (
      <div className='py-20 text-center'>
        <div className='inline-block animate-spin rounded-full h-8 w-8 border-3 border-primary border-t-transparent'></div>
        <p className='mt-3 text-gray-500 text-sm'>Loading your profile...</p>
      </div>
    )
  }

  return (
    <div className='py-6 max-w-3xl mx-auto'>
      <div className='bg-white rounded-2xl border border-gray-100 p-6 sm:p-9 shadow-xs space-y-7'>
        {/* Header & Avatar */}
        <div className='flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-gray-100'>
          <div className='relative'>
            {isEdit ? (
              <label htmlFor='avatar-upload' className='cursor-pointer group block'>
                <div className='w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-primary/40 relative shadow-2xs'>
                  <img
                    src={image ? URL.createObjectURL(image) : userData.image || assets.upload_icon}
                    className='w-full h-full object-cover group-hover:opacity-75 transition-opacity'
                    alt='Avatar'
                  />
                  <div className='absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[11px] font-bold'>
                    Change Photo
                  </div>
                </div>
                <input
                  type='file'
                  id='avatar-upload'
                  hidden
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </label>
            ) : (
              <div className='w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-gray-100 shadow-2xs'>
                {userData.image ? (
                  <img src={userData.image} className='w-full h-full object-cover' alt={userData.name} />
                ) : (
                  <UserIdentity name={userData.name} className='w-full h-full text-3xl' />
                )}
              </div>
            )}
          </div>

          <div className='flex-1 text-center sm:text-left'>
            {isEdit ? (
              <div className='space-y-1 max-w-sm'>
                <label className='block text-xs font-bold text-gray-500 uppercase tracking-wider'>Your Name</label>
                <input
                  type='text'
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className='w-full font-bold text-lg text-gray-900 border border-gray-200 rounded-xl p-2.5 focus:border-primary outline-none'
                />
              </div>
            ) : (
              <>
                <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight'>{userData.name}</h1>
                <p className='text-xs text-primary font-semibold mt-0.5'>Verified Patient Profile</p>
                <p className='text-xs text-gray-500 mt-1'>{userData.email}</p>
              </>
            )}

            {/* Wallet Balance Strip */}
            <div className='mt-3 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-900'>
              <span>💰 Healthcare Wallet: {currencySymbol}{userData.walletBalance || 0}</span>
              <span className='text-[11px] text-emerald-700 font-normal'>• 100% Refund Balance</span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className='space-y-3.5'>
          <h2 className='text-xs font-bold text-gray-400 uppercase tracking-wider'>Contact Information</h2>
          <div className='grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-3 text-xs sm:text-sm items-center'>
            <span className='font-semibold text-gray-500'>Email:</span>
            <span className='text-gray-900 font-medium'>{userData.email}</span>

            <span className='font-semibold text-gray-500'>Phone:</span>
            {isEdit ? (
              <input
                type='text'
                value={editForm.phone}
                placeholder='+1 (555) 000-0000'
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className='border border-gray-200 rounded-xl p-2 text-xs sm:text-sm focus:border-primary outline-none max-w-sm'
              />
            ) : (
              <span className='text-gray-800 font-medium'>{userData.phone || 'Not provided'}</span>
            )}

            <span className='font-semibold text-gray-500'>Address:</span>
            {isEdit ? (
              <div className='space-y-1.5 max-w-sm'>
                <input
                  type='text'
                  value={editForm.address.line1}
                  placeholder='Address Line 1'
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      address: { ...editForm.address, line1: e.target.value },
                    })
                  }
                  className='w-full border border-gray-200 rounded-xl p-2 text-xs sm:text-sm focus:border-primary outline-none'
                />
                <input
                  type='text'
                  value={editForm.address.line2}
                  placeholder='City, State, Zip Line 2'
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      address: { ...editForm.address, line2: e.target.value },
                    })
                  }
                  className='w-full border border-gray-200 rounded-xl p-2 text-xs sm:text-sm focus:border-primary outline-none'
                />
              </div>
            ) : (
              <span className='text-gray-800 font-medium'>
                {userData.address?.line1 || 'No address set'}
                {userData.address?.line2 && `, ${userData.address.line2}`}
              </span>
            )}
          </div>
        </div>

        <hr className='border-gray-100' />

        {/* Medical Safety Shield */}
        <div className='space-y-3.5'>
          <h2 className='text-xs font-bold text-gray-400 uppercase tracking-wider'>
            Medical Profile & Safety Shield (Auto-Transmitted to Doctors)
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-3 text-xs sm:text-sm items-center'>
            <span className='font-semibold text-gray-500'>Blood Group:</span>
            {isEdit ? (
              <select
                value={editForm.bloodGroup}
                onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                className='border border-gray-200 rounded-xl p-2 text-xs sm:text-sm focus:border-primary outline-none max-w-xs font-bold text-rose-600'
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            ) : (
              <span className='text-rose-600 font-bold'>{userData.bloodGroup || 'O+'}</span>
            )}

            <span className='font-semibold text-gray-500'>Gender:</span>
            {isEdit ? (
              <select
                value={editForm.gender}
                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                className='border border-gray-200 rounded-xl p-2 text-xs sm:text-sm focus:border-primary outline-none max-w-xs'
              >
                <option value='Not selected'>Not selected</option>
                <option value='Male'>Male</option>
                <option value='Female'>Female</option>
                <option value='Other'>Other</option>
              </select>
            ) : (
              <span className='text-gray-800 font-medium'>{userData.gender || 'Not specified'}</span>
            )}

            <span className='font-semibold text-gray-500'>Date of Birth:</span>
            {isEdit ? (
              <input
                type='date'
                value={editForm.dob}
                onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                className='border border-gray-200 rounded-xl p-2 text-xs sm:text-sm focus:border-primary outline-none max-w-xs'
              />
            ) : (
              <span className='text-gray-800 font-medium'>{userData.dob || 'Not specified'}</span>
            )}
          </div>

          {/* Allergies Selection */}
          <div className='pt-2'>
            <label className='block font-semibold text-gray-700 text-xs mb-1.5'>
              Documented Drug Allergies (Alerts attending doctor prior to prescribing):
            </label>
            {isEdit ? (
              <div className='space-y-2.5'>
                <div className='flex flex-wrap gap-1.5'>
                  {COMMON_ALLERGIES.map((allergy) => {
                    const isSelected = editForm.allergies.includes(allergy)
                    return (
                      <button
                        key={allergy}
                        type='button'
                        onClick={() => toggleAllergy(allergy)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-rose-600 text-white shadow-2xs'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {isSelected ? '✓' : '+'} {allergy}
                      </button>
                    )
                  })}
                </div>
                <div className='flex items-center gap-2 max-w-sm'>
                  <input
                    type='text'
                    value={customAllergy}
                    onChange={(e) => setCustomAllergy(e.target.value)}
                    placeholder='Add another drug allergy...'
                    className='border border-gray-200 rounded-lg p-2 text-xs flex-1 outline-none focus:border-primary'
                  />
                  <button
                    type='button'
                    onClick={addCustomAllergy}
                    className='px-3 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg'
                  >
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <div className='flex flex-wrap gap-1.5'>
                {userData.allergies && userData.allergies.length > 0 ? (
                  userData.allergies.map((item, idx) => (
                    <span
                      key={idx}
                      className='px-2.5 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-md text-xs font-semibold'
                    >
                      ⚠️ {item}
                    </span>
                  ))
                ) : (
                  <span className='text-xs text-gray-500 font-normal'>No allergies recorded. Click Edit to document.</span>
                )}
              </div>
            )}
          </div>

          {/* Chronic Conditions */}
          <div className='pt-2'>
            <label className='block font-semibold text-gray-700 text-xs mb-1.5'>
              Chronic Health Conditions:
            </label>
            {isEdit ? (
              <div className='space-y-2.5'>
                <div className='flex flex-wrap gap-1.5'>
                  {COMMON_CONDITIONS.map((cond) => {
                    const isSelected = editForm.chronicConditions.includes(cond)
                    return (
                      <button
                        key={cond}
                        type='button'
                        onClick={() => toggleCondition(cond)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {isSelected ? '✓' : '+'} {cond}
                      </button>
                    )
                  })}
                </div>
                <div className='flex items-center gap-2 max-w-sm'>
                  <input
                    type='text'
                    value={customCondition}
                    onChange={(e) => setCustomCondition(e.target.value)}
                    placeholder='Add other condition (e.g. Thyroid)...'
                    className='border border-gray-200 rounded-lg p-2 text-xs flex-1 outline-none focus:border-primary'
                  />
                  <button
                    type='button'
                    onClick={addCustomCondition}
                    className='px-3 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg'
                  >
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <div className='flex flex-wrap gap-1.5'>
                {userData.chronicConditions && userData.chronicConditions.length > 0 ? (
                  userData.chronicConditions.map((item, idx) => (
                    <span
                      key={idx}
                      className='px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-md text-xs font-semibold'
                    >
                      🏥 {item}
                    </span>
                  ))
                ) : (
                  <span className='text-xs text-gray-500 font-normal'>No chronic conditions listed.</span>
                )}
              </div>
            )}
          </div>
        </div>

        <hr className='border-gray-100' />

        {/* Emergency Contact */}
        <div className='space-y-3.5'>
          <h2 className='text-xs font-bold text-gray-400 uppercase tracking-wider'>Emergency Contact</h2>
          <div className='grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-3 text-xs sm:text-sm items-center'>
            <span className='font-semibold text-gray-500'>Contact Name:</span>
            {isEdit ? (
              <input
                type='text'
                value={editForm.emergencyContact.name}
                placeholder='e.g. Sarah (Spouse)'
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    emergencyContact: { ...editForm.emergencyContact, name: e.target.value },
                  })
                }
                className='border border-gray-200 rounded-xl p-2 text-xs sm:text-sm focus:border-primary outline-none max-w-sm'
              />
            ) : (
              <span className='text-gray-800 font-medium'>{userData.emergencyContact?.name || 'Not provided'}</span>
            )}

            <span className='font-semibold text-gray-500'>Emergency Phone:</span>
            {isEdit ? (
              <input
                type='text'
                value={editForm.emergencyContact.phone}
                placeholder='+1 (555) 000-0000'
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    emergencyContact: { ...editForm.emergencyContact, phone: e.target.value },
                  })
                }
                className='border border-gray-200 rounded-xl p-2 text-xs sm:text-sm focus:border-primary outline-none max-w-sm'
              />
            ) : (
              <span className='text-gray-800 font-semibold'>
                {userData.emergencyContact?.phone || 'Not provided'}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className='pt-5 flex justify-end gap-2.5 border-t border-gray-100'>
          {isEdit ? (
            <>
              <button
                type='button'
                onClick={() => setIsEdit(false)}
                className='px-5 py-2 border border-gray-200 rounded-full text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                type='button'
                disabled={isSaving}
                onClick={updateUserProfileData}
                className='px-7 py-2 bg-primary text-white rounded-full text-xs sm:text-sm font-bold shadow-xs hover:bg-opacity-95'
              >
                {isSaving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </>
          ) : (
            <button
              type='button'
              onClick={() => setIsEdit(true)}
              className='px-7 py-2.5 bg-primary text-white rounded-full text-xs sm:text-sm font-semibold shadow-xs hover:bg-opacity-95 transition-all'
            >
              ✏️ Edit Profile Information
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyProfile
