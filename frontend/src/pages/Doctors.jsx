import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useParams, useNavigate } from 'react-router-dom'
import DoctorIdentity from '../components/DoctorIdentity'

const Doctors = () => {
  const navigate = useNavigate()
  const { speciality } = useParams()
  const { doctors, currencySymbol } = useContext(AppContext)

  const [filterDoc, setFilterDoc] = useState([])
  const [showFilter, setShowFilter] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('default')
  const [onlyAvailable, setOnlyAvailable] = useState(false)

  const specialitiesList = [
    'General physician',
    'Gynecologist',
    'Dermatologist',
    'Pediatricians',
    'Neurologist',
    'Gastroenterologist',
  ]

  const applyFilterAndSort = () => {
    let result = [...doctors]

    // Speciality filter
    if (speciality) {
      result = result.filter(
        (doc) => doc.speciality.toLowerCase() === speciality.toLowerCase()
      )
    }

    // Availability filter
    if (onlyAvailable) {
      result = result.filter((doc) => doc.available)
    }

    // Search query filter (name, speciality, degree, clinic)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (doc) =>
          doc.name?.toLowerCase().includes(q) ||
          doc.speciality?.toLowerCase().includes(q) ||
          doc.degree?.toLowerCase().includes(q) ||
          doc.address?.line1?.toLowerCase().includes(q) ||
          doc.address?.line2?.toLowerCase().includes(q)
      )
    }

    // Sorting
    if (sortBy === 'fee-low') {
      result.sort((a, b) => (a.fees || 0) - (b.fees || 0))
    } else if (sortBy === 'fee-high') {
      result.sort((a, b) => (b.fees || 0) - (a.fees || 0))
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    }

    setFilterDoc(result)
  }

  useEffect(() => {
    applyFilterAndSort()
  }, [doctors, speciality, searchQuery, sortBy, onlyAvailable])

  return (
    <div className='py-6'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-extrabold text-gray-900'>Find & Book Top Doctors</h1>
          <p className='text-sm sm:text-base text-gray-500 mt-1'>
            Discover trusted medical specialists and schedule your consultation
          </p>
        </div>

        {/* Live Search Bar */}
        <div className='flex items-center gap-2 max-w-md w-full'>
          <div className='relative w-full'>
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search by doctor, speciality, degree...'
              className='w-full pl-10 pr-4 py-2.5 text-sm sm:text-base border border-gray-300 rounded-full outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm'
            />
            <span className='absolute left-3.5 top-3 text-gray-400 text-base'>🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className='absolute right-3.5 top-2.5 text-sm text-gray-400 hover:text-gray-600'
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className='flex flex-wrap items-center justify-between gap-4 py-4 text-sm'>
        <div className='flex items-center gap-3'>
          <button
            className={`py-2 px-4 border rounded-xl font-semibold transition-all sm:hidden ${
              showFilter ? 'bg-primary text-white' : 'bg-white text-gray-700'
            }`}
            onClick={() => setShowFilter((prev) => !prev)}
          >
            Filters
          </button>

          <label className='flex items-center gap-2 cursor-pointer select-none text-gray-700 font-semibold text-sm sm:text-base'>
            <input
              type='checkbox'
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className='rounded text-primary focus:ring-primary h-4 w-4 cursor-pointer'
            />
            Available Today Only
          </label>
        </div>

        <div className='flex items-center gap-2.5'>
          <span className='text-gray-600 font-semibold text-sm sm:text-base'>Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className='border border-gray-300 rounded-xl px-3 py-2 outline-none bg-white font-semibold text-gray-700 text-sm sm:text-base shadow-sm'
          >
            <option value='default'>Recommended</option>
            <option value='fee-low'>Fee: Low to High</option>
            <option value='fee-high'>Fee: High to Low</option>
            <option value='rating'>Highest Rated ⭐</option>
          </select>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className='flex flex-col sm:flex-row items-start gap-6 mt-3'>
        {/* Speciality Filter Sidebar */}
        <div className={`flex-col gap-2 text-base text-gray-700 w-full sm:w-60 ${showFilter ? 'flex' : 'hidden sm:flex'}`}>
          <p className='font-bold text-xs text-gray-400 uppercase tracking-wider mb-1 px-1'>Specialities</p>
          <button
            onClick={() => navigate('/doctors')}
            className={`text-left px-4 py-2.5 border rounded-2xl transition-all font-semibold text-sm sm:text-base ${
              !speciality ? 'bg-primary text-white shadow-md border-primary' : 'bg-white hover:bg-gray-50 border-gray-200'
            }`}
          >
            All Specialities ({doctors.length})
          </button>
          {specialitiesList.map((spec, index) => {
            const count = doctors.filter((d) => d.speciality === spec).length
            return (
              <button
                key={index}
                onClick={() => (speciality === spec ? navigate('/doctors') : navigate(`/doctors/${spec}`))}
                className={`text-left px-4 py-2.5 border rounded-2xl transition-all font-semibold text-sm sm:text-base ${
                  speciality === spec
                    ? 'bg-primary text-white shadow-md border-primary'
                    : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                }`}
              >
                {spec} <span className='text-xs opacity-80'>({count})</span>
              </button>
            )
          })}
        </div>

        {/* Doctors Grid */}
        <div className='flex-1 w-full'>
          {filterDoc.length === 0 ? (
            <div className='bg-white rounded-3xl border border-gray-200 p-12 text-center'>
              <p className='text-5xl mb-3'>👨‍⚕️</p>
              <h3 className='text-lg font-bold text-gray-800'>No doctors matched your criteria</h3>
              <p className='text-sm text-gray-500 mt-2 max-w-sm mx-auto'>
                Try clearing search terms, switching specialities, or toggling the availability filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setOnlyAvailable(false)
                  navigate('/doctors')
                }}
                className='mt-5 text-sm font-bold text-primary hover:underline'
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filterDoc.map((item, index) => (
                <div
                  onClick={() => navigate(`/appointment/${item._id}`)}
                  key={index}
                  className='bg-white border border-gray-200 rounded-3xl overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between'
                >
                  <div className='relative overflow-hidden'>
                    <DoctorIdentity
                      name={item.name}
                      speciality={item.speciality}
                      docId={item._id}
                      degree={item.degree}
                    />
                    <div className='absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm flex items-center gap-1 z-20'>
                      <span>⭐</span> {item.rating || '4.9'}
                    </div>
                  </div>

                  <div className='p-5 flex-1 flex flex-col justify-between'>
                    <div>
                      <div className='flex items-center justify-between mb-1.5'>
                        <div
                          className={`flex items-center gap-2 text-xs sm:text-sm font-semibold ${
                            item.available ? 'text-emerald-600' : 'text-rose-500'
                          }`}
                        >
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              item.available ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span>{item.available ? 'Available' : 'Unavailable'}</span>
                        </div>
                        <span className='text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md'>{item.experience}</span>
                      </div>

                      <h3 className='text-gray-900 text-lg font-bold leading-tight'>{item.name}</h3>
                      <p className='text-primary text-sm font-semibold mt-1'>{item.speciality}</p>
                      <p className='text-gray-400 text-xs mt-0.5'>{item.degree}</p>
                    </div>

                    <div className='pt-4 mt-4 border-t flex items-center justify-between'>
                      <div>
                        <span className='text-gray-400 text-xs block font-medium'>Consultation Fee</span>
                        <span className='text-gray-900 font-extrabold text-lg'>
                          {currencySymbol}
                          {item.fees}
                        </span>
                      </div>
                      <button className='bg-primary/10 text-primary font-bold text-sm px-4 py-2 rounded-xl hover:bg-primary hover:text-white transition-colors shadow-sm'>
                        Book Now →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Doctors
