import { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'
import DoctorIdentity from '../../components/DoctorIdentity'

const DoctorsList = () => {
  const { doctors, getAllDoctors, aToken, changeAvailability, deleteDoctor } = useContext(AdminContext)

  useEffect(() => {
    if (aToken) {
      getAllDoctors()
    }
  }, [aToken])

  const handleDeleteDoctor = (item) => {
    if (
      window.confirm(
        `Are you sure you want to remove Dr. ${item.name} (${item.speciality}) from the hospital staff directory?\n\nThis will remove their profile and cancel pending consultations.`
      )
    ) {
      deleteDoctor(item._id)
    }
  }

  return (
    <div className='m-5 max-h-[90vh] overflow-y-scroll'>
      <div className='flex items-center justify-between mb-4'>
        <div>
          <h1 className='text-xl font-bold text-gray-800 mb-0.5'>Doctor Staff Directory</h1>
          <p className='text-xs text-gray-500'>Manage hospital doctor roster, platform availability, and staff removal</p>
        </div>
        <span className='text-xs font-semibold bg-indigo-50 text-primary border border-indigo-200 px-3 py-1 rounded-full'>
          Total Staff: {doctors.length} Doctors
        </span>
      </div>

      <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pt-2'>
        {doctors.map((item, index) => (
          <div
            key={index}
            className='bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between group relative'
          >
            <DoctorIdentity
              name={item.name}
              speciality={item.speciality}
              docId={item._id}
              degree={item.degree}
            />
            <div className='p-4 flex-1 flex flex-col justify-between'>
              <div>
                <p className='text-neutral-800 text-base font-bold'>{item.name}</p>
                <p className='text-primary text-xs font-medium'>{item.speciality}</p>
                <p className='text-gray-400 text-xs mt-0.5'>{item.degree}</p>
              </div>

              <div className='mt-4 pt-3 border-t flex flex-col gap-2.5'>
                {/* Live Availability Toggle */}
                <div className='flex items-center justify-between text-xs'>
                  <span className='text-gray-500'>Live Status:</span>
                  <label className='flex items-center gap-1.5 cursor-pointer font-medium'>
                    <input
                      type='checkbox'
                      onChange={() => changeAvailability(item._id)}
                      checked={item.available}
                      className='accent-[#5F65FF] w-4 h-4 cursor-pointer'
                    />
                    <span className={item.available ? 'text-emerald-600' : 'text-rose-500'}>
                      {item.available ? 'Available' : 'Unavailable'}
                    </span>
                  </label>
                </div>

                {/* Remove Doctor Action */}
                <button
                  type='button'
                  onClick={() => handleDeleteDoctor(item)}
                  className='w-full text-xs font-semibold py-1.5 px-3 rounded-lg border border-rose-200 text-rose-600 bg-rose-50/50 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-1.5 shadow-sm'
                  title={`Remove Dr. ${item.name} from hospital directory`}
                >
                  <span>🗑️</span>
                  <span>Remove Doctor</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DoctorsList
