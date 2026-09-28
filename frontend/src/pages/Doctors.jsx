import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useParams, useNavigate } from 'react-router-dom'
import DoctorIdentity from '../components/DoctorIdentity'

const Doctors = () => {
  const navigate = useNavigate()
  const { speciality } = useParams()
  const { doctors, currencySymbol, t } = useContext(AppContext)

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

    // Search query filter
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
    <div className='py-6 max-w-6xl mx-auto'>
      {/* Header & Live Search */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gray-100'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2'>
            <span>👨‍⚕️</span> {t('doctorsHeading')}
          </h1>
          <p className='text-xs sm:text-sm text-gray-500 mt-1'>{t('doctorsSubheading')}</p>
        </div>

        {/* Search Bar */}
        <div className='flex items-center gap-2 max-w-md w-full'>
          <div className='relative w-full'>
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className='w-full pl-9 pr-8 py-2 text-xs sm:text-sm border border-gray-200 rounded-full outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-gray-50/60 focus:bg-white'
            />
            <span className='absolute left-3 top-2.5 text-gray-400 text-xs'>🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className='absolute right-3 top-2 text-xs text-gray-400 hover:text-gray-600'
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className='flex flex-wrap items-center justify-between gap-3 py-3 text-xs sm:text-sm'>
        <div className='flex items-center gap-3'>
          <button
            className={`py-1.5 px-3 border rounded-xl font-medium transition-all sm:hidden ${
              showFilter ? 'bg-primary text-white' : 'bg-white text-gray-700 border-gray-200'
            }`}
            onClick={() => setShowFilter((prev) => !prev)}
          >
            {t('filterTitle')}
          </button>

          <label className='flex items-center gap-1.5 cursor-pointer select-none text-gray-700 font-medium text-xs sm:text-sm'>
            <input
              type='checkbox'
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className='rounded text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer'
            />
            {t('availableToday')}
          </label>
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-gray-500 font-medium text-xs'>{t('sortBy')}</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className='border border-gray-200 rounded-xl px-2.5 py-1.5 outline-none bg-white font-medium text-gray-700 text-xs shadow-2xs'
          >
            <option value='default'>{t('sortRecommended')}</option>
            <option value='fee-low'>{t('sortFeeLow')}</option>
            <option value='fee-high'>{t('sortFeeHigh')}</option>
            <option value='rating'>{t('sortRating')}</option>
          </select>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className='flex flex-col sm:flex-row items-start gap-6 mt-2'>
        {/* Speciality Filter Sidebar */}
        <div className={`flex-col gap-1.5 text-xs sm:text-sm text-gray-700 w-full sm:w-56 ${showFilter ? 'flex' : 'hidden sm:flex'}`}>
          <p className='font-bold text-[10px] text-gray-400 uppercase tracking-wider mb-1 px-1'>{t('filterTitle')}</p>
          <button
            onClick={() => navigate('/doctors')}
            className={`text-left px-3.5 py-2 border rounded-xl transition-all font-medium text-xs sm:text-sm ${
              !speciality ? 'bg-primary text-white shadow-2xs border-primary font-bold' : 'bg-white hover:bg-gray-50 border-gray-200'
            }`}
          >
            {t('allSpecialities')} ({doctors.length})
          </button>
          {specialitiesList.map((spec, index) => {
            const count = doctors.filter((d) => d.speciality === spec).length
            return (
              <button
                key={index}
                onClick={() => (speciality === spec ? navigate('/doctors') : navigate(`/doctors/${spec}`))}
                className={`text-left px-3.5 py-2 border rounded-xl transition-all font-medium text-xs sm:text-sm ${
                  speciality === spec
                    ? 'bg-primary text-white shadow-2xs border-primary font-bold'
                    : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                }`}
              >
                {spec} <span className='text-xs opacity-70'>({count})</span>
              </button>
            )
          })}
        </div>

        {/* Doctors Grid */}
        <div className='flex-1 w-full'>
          {filterDoc.length === 0 ? (
            <div className='bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-2xs'>
              <p className='text-4xl mb-2'>👨‍⚕️</p>
              <h3 className='text-base font-bold text-gray-800'>No doctors matched your search</h3>
              <p className='text-xs text-gray-500 mt-1 max-w-sm mx-auto'>
                Try clearing search terms or selecting another medical department.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setOnlyAvailable(false)
                  navigate('/doctors')
                }}
                className='mt-4 text-xs font-semibold text-primary hover:underline'
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
              {filterDoc.map((item, index) => {
                return (
                  <div
                    onClick={() => navigate(`/appointment/${item._id}`)}
                    key={index}
                    className='bg-white border border-gray-100 rounded-2xl overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between shadow-2xs'
                  >
                    <div className='relative overflow-hidden'>
                      <DoctorIdentity
                        name={item.name}
                        speciality={item.speciality}
                        docId={item._id}
                        degree={item.degree}
                      />
                      <div className='absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-full text-[11px] font-bold text-gray-800 shadow-2xs flex items-center gap-1 z-20'>
                        <span>⭐</span> {item.rating || '4.9'}
                      </div>
                    </div>

                    <div className='p-4 flex-1 flex flex-col justify-between'>
                      <div>
                        <div className='flex items-center justify-between mb-1'>
                          <div
                            className={`flex items-center gap-1.5 text-xs font-semibold ${
                              item.available ? 'text-emerald-600' : 'text-rose-500'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.available ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                              }`}
                            />
                            <span>{item.available ? 'Available' : 'Unavailable'}</span>
                          </div>
                          <span className='text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded'>
                            {item.experience} Exp.
                          </span>
                        </div>

                        <h3 className='text-gray-900 text-base font-bold leading-snug'>{item.name}</h3>
                        <p className='text-primary text-xs font-semibold mt-0.5'>{item.speciality}</p>
                        <p className='text-gray-400 text-[11px]'>{item.degree}</p>
                      </div>

                      <div className='pt-3 mt-3 border-t border-gray-100 flex items-center justify-between'>
                        <div>
                          <span className='text-gray-400 text-[10px] block font-medium uppercase'>Consultation Fee</span>
                          <span className='text-gray-900 font-bold text-base'>
                            {currencySymbol}
                            {item.fees}
                          </span>
                        </div>
                        <button className='bg-primary text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl hover:bg-opacity-95 transition-all shadow-2xs'>
                          Book Slot →
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Doctors
