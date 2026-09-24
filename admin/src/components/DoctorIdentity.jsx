const getSpecialityTheme = (speciality = '') => {
  const spec = speciality.toLowerCase()
  if (spec.includes('general')) {
    return {
      gradient: 'from-blue-600 via-indigo-600 to-blue-800',
      bgLight: 'bg-blue-50 text-blue-700 border-blue-200',
      accent: '#4F46E5',
      icon: '🩺',
      short: 'GP',
      label: 'General Medicine',
    }
  }
  if (spec.includes('gynecol')) {
    return {
      gradient: 'from-rose-500 via-pink-600 to-rose-700',
      bgLight: 'bg-rose-50 text-rose-700 border-rose-200',
      accent: '#E11D48',
      icon: '🌸',
      short: 'GYN',
      label: "Women's Health",
    }
  }
  if (spec.includes('dermatol')) {
    return {
      gradient: 'from-amber-500 via-orange-500 to-amber-700',
      bgLight: 'bg-amber-50 text-amber-700 border-amber-200',
      accent: '#D97706',
      icon: '✨',
      short: 'DERM',
      label: 'Dermatology & Skin',
    }
  }
  if (spec.includes('pediatric')) {
    return {
      gradient: 'from-emerald-500 via-teal-600 to-emerald-700',
      bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      accent: '#059669',
      icon: '👶',
      short: 'PED',
      label: 'Pediatrics & Child Care',
    }
  }
  if (spec.includes('neurolog')) {
    return {
      gradient: 'from-purple-600 via-violet-600 to-indigo-800',
      bgLight: 'bg-purple-50 text-purple-700 border-purple-200',
      accent: '#7C3AED',
      icon: '🧠',
      short: 'NEURO',
      label: 'Neurology & Brain Care',
    }
  }
  if (spec.includes('gastro')) {
    return {
      gradient: 'from-cyan-600 via-sky-600 to-blue-800',
      bgLight: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      accent: '#0284C7',
      icon: '🔬',
      short: 'GASTRO',
      label: 'Gastroenterology',
    }
  }
  return {
    gradient: 'from-indigo-600 via-blue-600 to-indigo-800',
    bgLight: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    accent: '#4F46E5',
    icon: '⚕️',
    short: 'MD',
    label: speciality || 'Medical Specialist',
  }
}

const getDoctorInitials = (name = '') => {
  const clean = name.replace(/^(dr\.|dr|doctor)\s+/i, '').trim()
  const parts = clean.split(' ').filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return 'DR'
}

const DoctorIdentity = ({
  name = 'Doctor',
  speciality = 'General physician',
  docId = '',
  degree = 'MBBS',
  mode = 'card',
  className = '',
}) => {
  const theme = getSpecialityTheme(speciality)
  const initials = getDoctorInitials(name)
  const idBadge = docId ? `MED-${docId.toString().slice(-4).toUpperCase()}` : 'CERTIFIED'

  if (mode === 'avatar') {
    return (
      <div
        className={`w-9 h-9 rounded-full bg-gradient-to-br ${theme.gradient} text-white font-bold flex items-center justify-center text-xs shadow-sm flex-shrink-0 ${className}`}
        title={`${name} (${speciality})`}
      >
        <span>{initials}</span>
      </div>
    )
  }

  if (mode === 'header') {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.gradient} text-white p-6 flex flex-col justify-between shadow-lg aspect-square max-w-[240px] ${className}`}
      >
        <div className='absolute -right-6 -bottom-6 opacity-15 text-white pointer-events-none select-none text-[120px] font-black leading-none'>
          +
        </div>
        <div className='flex items-center justify-between z-10'>
          <span className='bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase'>
            {theme.label}
          </span>
          <span className='text-lg'>{theme.icon}</span>
        </div>

        <div className='flex flex-col items-center justify-center my-auto z-10'>
          <div className='w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/50 flex items-center justify-center shadow-inner'>
            <span className='text-2xl font-black'>{initials}</span>
          </div>
          <span className='text-[11px] font-semibold mt-1.5 uppercase text-white/90'>
            {degree || 'Doctor'}
          </span>
        </div>

        <div className='z-10 flex items-center justify-between border-t border-white/20 pt-1.5 text-[10px]'>
          <span>Verified Staff</span>
          <span className='font-mono opacity-80'>{idBadge}</span>
        </div>
      </div>
    )
  }

  // Card mode
  return (
    <div
      className={`relative w-full aspect-[4/3] bg-gradient-to-br ${theme.gradient} text-white p-4 flex flex-col justify-between overflow-hidden ${className}`}
    >
      <div className='absolute -right-4 -bottom-4 opacity-15 text-white pointer-events-none select-none text-8xl font-black leading-none'>
        +
      </div>
      <div className='absolute top-2 right-2 text-base opacity-80 z-10'>
        {theme.icon}
      </div>

      <div className='flex items-center justify-between z-10'>
        <span className='bg-white/20 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase'>
          {theme.short}
        </span>
      </div>

      <div className='flex flex-col items-center justify-center my-auto z-10'>
        <div className='w-12 h-12 rounded-xl bg-white/20 border border-white/50 flex items-center justify-center shadow'>
          <span className='text-lg font-black text-white'>{initials}</span>
        </div>
      </div>

      <div className='z-10 flex items-center justify-between text-[9px] border-t border-white/20 pt-1 text-white/90'>
        <span>Verified</span>
        <span className='font-mono'>{idBadge}</span>
      </div>
    </div>
  )
}

export default DoctorIdentity
