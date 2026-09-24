import { useContext, useState } from 'react'
import { assets } from '../assets/assets.js'
import { AppContext } from '../context/AppContext.jsx'
import axios from 'axios'
import { toast } from 'react-toastify'
import UserIdentity from '../components/UserIdentity.jsx'

const MyProfile = () => {
  const { userData, setUserData, backendUrl, token, loadUserProfileData } = useContext(AppContext)
  const [isEdit, setIsEdit] = useState(false)
  const [image, setImage] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const updateUserProfileData = async () => {
    try {
      setIsSaving(true)
      const formData = new FormData()
      formData.append('name', userData.name)
      formData.append('phone', userData.phone)
      formData.append('address', JSON.stringify(userData.address))
      formData.append('gender', userData.gender)
      formData.append('dob', userData.dob)

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
      console.log(error)
      toast.error(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    userData && (
      <div className='py-6 max-w-2xl mx-auto'>
        <div className='bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 shadow-sm'>
          {/* Header & Avatar */}
          <div className='flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-gray-100'>
            <div className='relative'>
              {isEdit ? (
                <label htmlFor='avatar-upload' className='cursor-pointer group block'>
                  <div className='w-32 h-32 rounded-2xl overflow-hidden border-2 border-primary/40 relative shadow-md'>
                    <img
                      src={image ? URL.createObjectURL(image) : userData.image || assets.upload_icon}
                      className='w-full h-full object-cover group-hover:opacity-75 transition-opacity'
                      alt='Profile Avatar'
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
                <div className='w-32 h-32 rounded-2xl overflow-hidden border-2 border-gray-100 shadow-md'>
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
                <div>
                  <label className='block text-sm font-bold text-gray-700 mb-1.5'>Full Name</label>
                  <input
                    type='text'
                    value={userData.name}
                    onChange={(e) => setUserData((prev) => ({ ...prev, name: e.target.value }))}
                    className='w-full font-bold text-xl sm:text-2xl text-gray-900 border border-gray-300 rounded-xl p-3 focus:border-primary outline-none'
                  />
                </div>
              ) : (
                <>
                  <h1 className='text-2xl sm:text-3xl font-extrabold text-gray-900'>{userData.name}</h1>
                  <p className='text-sm text-primary font-semibold mt-1'>Registered Patient Account</p>
                  <p className='text-sm text-gray-500 mt-1 font-mono'>{userData.email}</p>
                </>
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div className='py-6 border-b border-gray-100'>
            <h2 className='text-sm font-bold text-gray-500 uppercase tracking-wider mb-4'>Contact Information</h2>
            <div className='grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4 text-base'>
              <span className='font-bold text-gray-600'>Email Address:</span>
              <span className='text-gray-900 font-mono'>{userData.email}</span>

              <span className='font-bold text-gray-600'>Phone Number:</span>
              {isEdit ? (
                <input
                  type='text'
                  value={userData.phone || ''}
                  placeholder='+1 (555) 000-0000'
                  onChange={(e) => setUserData((prev) => ({ ...prev, phone: e.target.value }))}
                  className='border border-gray-300 rounded-xl p-2.5 text-base focus:border-primary outline-none max-w-sm'
                />
              ) : (
                <span className='text-gray-800'>{userData.phone || 'Not provided'}</span>
              )}

              <span className='font-bold text-gray-600'>Street Address:</span>
              {isEdit ? (
                <div className='space-y-2 max-w-sm'>
                  <input
                    type='text'
                    value={userData.address?.line1 || ''}
                    placeholder='Apartment / Street Line 1'
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        address: { ...prev.address, line1: e.target.value },
                      }))
                    }
                    className='w-full border border-gray-300 rounded-xl p-2.5 text-base focus:border-primary outline-none'
                  />
                  <input
                    type='text'
                    value={userData.address?.line2 || ''}
                    placeholder='City, State, Zip Line 2'
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        address: { ...prev.address, line2: e.target.value },
                      }))
                    }
                    className='w-full border border-gray-300 rounded-xl p-2.5 text-base focus:border-primary outline-none'
                  />
                </div>
              ) : (
                <span className='text-gray-800'>
                  {userData.address?.line1 || 'No address set'}
                  {userData.address?.line2 && `, ${userData.address.line2}`}
                </span>
              )}
            </div>
          </div>

          {/* Basic Healthcare Information */}
          <div className='py-6 border-b border-gray-100'>
            <h2 className='text-sm font-bold text-gray-500 uppercase tracking-wider mb-4'>Basic Health Profile</h2>
            <div className='grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4 text-base'>
              <span className='font-bold text-gray-600'>Gender:</span>
              {isEdit ? (
                <select
                  value={userData.gender || 'Not selected'}
                  onChange={(e) => setUserData((prev) => ({ ...prev, gender: e.target.value }))}
                  className='border border-gray-300 rounded-xl p-2.5 text-base focus:border-primary outline-none max-w-xs'
                >
                  <option value='Not selected'>Not selected</option>
                  <option value='Male'>Male</option>
                  <option value='Female'>Female</option>
                  <option value='Other'>Other</option>
                </select>
              ) : (
                <span className='text-gray-800'>{userData.gender || 'Not specified'}</span>
              )}

              <span className='font-bold text-gray-600'>Date of Birth:</span>
              {isEdit ? (
                <input
                  type='date'
                  value={userData.dob || ''}
                  onChange={(e) => setUserData((prev) => ({ ...prev, dob: e.target.value }))}
                  className='border border-gray-300 rounded-xl p-2.5 text-base focus:border-primary outline-none max-w-xs'
                />
              ) : (
                <span className='text-gray-800'>{userData.dob || 'Not specified'}</span>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className='pt-6 flex justify-end gap-3'>
            {isEdit ? (
              <>
                <button
                  type='button'
                  onClick={() => setIsEdit(false)}
                  className='px-6 py-3 border border-gray-300 rounded-full text-sm font-bold text-gray-700 hover:bg-gray-50'
                >
                  Cancel
                </button>
                <button
                  type='button'
                  disabled={isSaving}
                  onClick={updateUserProfileData}
                  className='px-8 py-3 bg-primary text-white rounded-full text-sm font-bold shadow-md hover:bg-opacity-95'
                >
                  {isSaving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </>
            ) : (
              <button
                type='button'
                onClick={() => setIsEdit(true)}
                className='px-8 py-3 bg-primary/10 hover:bg-primary hover:text-white text-primary rounded-full text-sm sm:text-base font-bold transition-all shadow-sm'
              >
                ✏️ Edit Profile Information
              </button>
            )}
          </div>
        </div>
      </div>
    )
  )
}

export default MyProfile
