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
  const { userData, setUserData, backendUrl, token, loadUserProfileData, t, currencySymbol } =
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
        <div className='inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent'></div>
        <p className='mt-3 text-gray-500 font-medium'>Loading profile...</p>
      </div>
    )
  }

  return (
    <div className='py-6 max-w-3xl mx-auto'>
      <div className='bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-10 shadow-sm space-y-8'>
        {/* Header & Avatar */}
        <div className='flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-gray-100'>
          <div className='relative'>
            {isEdit ? (
              <label htmlFor='avatar-upload' className='cursor-pointer group block'>
                <div className='w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-primary/40 relative shadow-sm'>
                  <img
                    src={image ? URL.createObjectURL(image) : userData.image || assets.upload_icon}
                    className='w-full h-full object-cover group-hover:opacity-75 transition-opacity'
                    alt='Avatar'
                  />
                  <div className='absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold'>
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
              <div className='w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm'>
                {userData.image ? (
                  <img src={userData.image} className='w-full h-full object-cover' alt={userData.name} />
                ) : (
                  <UserIdentity name={userData.name} className='w-full h-full text-4xl' />
                )}
              </div>
            )}
          </div>

          <div className='flex-1 text-center sm:text-left'>
            {isEdit ? (
              <div className='space-y-1'>
                <label className='block text-xs font-bold text-gray-600 uppercase tracking-wider'>Full Name</label>
                <input
                  type='text'
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className='w-full font-bold text-xl sm:text-2xl text-gray-900 border border-gray-300 rounded-xl p-2.5 focus:border-primary outline-none'
                />
              </div>
            ) : (
              <>
                <h1 className='text-2xl sm:text-3xl font-extrabold text-gray-900'>{userData.name}</h1>
                <p className='text-xs text-primary font-bold mt-1 uppercase tracking-wider'>Verified Patient Account</p>
                <p className='text-xs text-gray-500 mt-1 font-mono'>{userData.email}</p>
              </>
            )}

            {/* Wallet Balance Strip */}
            <div className='mt-3 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-800'>
              <span>💰 Healthcare Wallet: {currencySymbol}{userData.walletBalance || 0}</span>
              <span className='text-[10px] text-emerald-600'>(100% Refund Protected)</span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className='space-y-4'>
          <h2 className='text-xs font-bold text-gray-500 uppercase tracking-wider'>Contact Information</h2>
          <div className='grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4 text-sm items-center'>
            <span className='font-bold text-gray-600'>Email Address:</span>
            <span className='text-gray-900 font-mono'>{userData.email}</span>

            <span className='font-bold text-gray-600'>Phone Number:</span>
            {isEdit ? (
              <input
                type='text'
                value={editForm.phone}
                placeholder='+1 (555) 000-0000'
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className='border border-gray-300 rounded-xl p-2.5 text-sm focus:border-primary outline-none max-w-sm'
              />
            ) : (
              <span className='text-gray-800 font-medium'>{userData.phone || 'Not provided'}</span>
            )}

            <span className='font-bold text-gray-600'>Address:</span>
            {isEdit ? (
              <div className='space-y-2 max-w-sm'>
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
                  className='w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:border-primary outline-none'
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
                  className='w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:border-primary outline-none'
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

        {/* Basic Health & Medical History Analyzer */}
        <div className='space-y-4'>
          <h2 className='text-xs font-bold text-gray-500 uppercase tracking-wider'>
            Medical History & Allergy Analyzer (Safety Shield)
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4 text-sm items-center'>
            <span className='font-bold text-gray-600'>Blood Group:</span>
            {isEdit ? (
              <select
                value={editForm.bloodGroup}
                onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                className='border border-gray-300 rounded-xl p-2.5 text-sm focus:border-primary outline-none max-w-xs font-bold text-red-600'
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            ) : (
              <span className='text-red-600 font-bold'>{userData.bloodGroup || 'O+'}</span>
            )}

            <span className='font-bold text-gray-600'>Gender:</span>
            {isEdit ? (
              <select
                value={editForm.gender}
                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                className='border border-gray-300 rounded-xl p-2.5 text-sm focus:border-primary outline-none max-w-xs'
              >
                <option value='Not selected'>Not selected</option>
                <option value='Male'>Male</option>
                <option value='Female'>Female</option>
                <option value='Other'>Other</option>
              </select>
            ) : (
              <span className='text-gray-800 font-medium'>{userData.gender || 'Not specified'}</span>
            )}

            <span className='font-bold text-gray-600'>Date of Birth:</span>
            {isEdit ? (
              <input
                type='date'
                value={editForm.dob}
                onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                className='border border-gray-300 rounded-xl p-2.5 text-sm focus:border-primary outline-none max-w-xs'
              />
            ) : (
              <span className='text-gray-800 font-medium'>{userData.dob || 'Not specified'}</span>
            )}
          </div>

          {/* Allergies Selection */}
          <div className='pt-2'>
            <label className='block font-bold text-gray-700 text-xs uppercase tracking-wider mb-2'>
              Known Drug & Food Allergies (Flags warnings to doctors):
            </label>
            {isEdit ? (
              <div className='space-y-3'>
                <div className='flex flex-wrap gap-2'>
                  {COMMON_ALLERGIES.map((allergy) => {
                    const isSelected = editForm.allergies.includes(allergy)
                    return (
                      <button
                        key={allergy}
                        type='button'
                        onClick={() => toggleAllergy(allergy)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-red-600 text-white shadow-xs'
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
                    placeholder='Add other allergy (e.g. Sulfa)'
                    className='border border-gray-300 rounded-xl p-2 text-xs flex-1 outline-none focus:border-primary'
                  />
                  <button
                    type='button'
                    onClick={addCustomAllergy}
                    className='px-3 py-2 bg-red-600 text-white text-xs font-bold rounded-xl'
                  >
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <div className='flex flex-wrap gap-2'>
                {userData.allergies && userData.allergies.length > 0 ? (
                  userData.allergies.map((item, idx) => (
                    <span
                      key={idx}
                      className='px-3 py-1 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-bold'
                    >
                      ⚠️ {item}
                    </span>
                  ))
                ) : (
                  <span className='text-xs text-gray-500 font-medium'>No allergies documented. Click edit to add.</span>
                )}
              </div>
            )}
          </div>

          {/* Chronic Conditions */}
          <div className='pt-2'>
            <label className='block font-bold text-gray-700 text-xs uppercase tracking-wider mb-2'>
              Chronic Health Conditions:
            </label>
            {isEdit ? (
              <div className='space-y-3'>
                <div className='flex flex-wrap gap-2'>
                  {COMMON_CONDITIONS.map((cond) => {
                    const isSelected = editForm.chronicConditions.includes(cond)
                    return (
                      <button
                        key={cond}
                        type='button'
                        onClick={() => toggleCondition(cond)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
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
                    placeholder='Add other condition (e.g. Thyroid)'
                    className='border border-gray-300 rounded-xl p-2 text-xs flex-1 outline-none focus:border-primary'
                  />
                  <button
                    type='button'
                    onClick={addCustomCondition}
                    className='px-3 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl'
                  >
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <div className='flex flex-wrap gap-2'>
                {userData.chronicConditions && userData.chronicConditions.length > 0 ? (
                  userData.chronicConditions.map((item, idx) => (
                    <span
                      key={idx}
                      className='px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold'
                    >
                      🏥 {item}
                    </span>
                  ))
                ) : (
                  <span className='text-xs text-gray-500 font-medium'>No chronic conditions listed.</span>
                )}
              </div>
            )}
          </div>
        </div>

        <hr className='border-gray-100' />

        {/* Emergency Contact */}
        <div className='space-y-4'>
          <h2 className='text-xs font-bold text-gray-500 uppercase tracking-wider'>Emergency Contact</h2>
          <div className='grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4 text-sm items-center'>
            <span className='font-bold text-gray-600'>Contact Name:</span>
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
                className='border border-gray-300 rounded-xl p-2.5 text-sm focus:border-primary outline-none max-w-sm'
              />
            ) : (
              <span className='text-gray-800 font-medium'>{userData.emergencyContact?.name || 'Not provided'}</span>
            )}

            <span className='font-bold text-gray-600'>Emergency Phone:</span>
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
                className='border border-gray-300 rounded-xl p-2.5 text-sm focus:border-primary outline-none max-w-sm'
              />
            ) : (
              <span className='text-gray-800 font-mono font-bold'>
                {userData.emergencyContact?.phone || 'Not provided'}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className='pt-6 flex justify-end gap-3 border-t border-gray-100'>
          {isEdit ? (
            <>
              <button
                type='button'
                onClick={() => setIsEdit(false)}
                className='px-6 py-2.5 border border-gray-300 rounded-full text-sm font-bold text-gray-700 hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                type='button'
                disabled={isSaving}
                onClick={updateUserProfileData}
                className='px-8 py-2.5 bg-primary text-white rounded-full text-sm font-bold shadow-md hover:bg-opacity-95'
              >
                {isSaving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </>
          ) : (
            <button
              type='button'
              onClick={() => setIsEdit(true)}
              className='px-8 py-2.5 bg-primary/10 hover:bg-primary hover:text-white text-primary rounded-full text-sm font-bold transition-all shadow-sm'
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
