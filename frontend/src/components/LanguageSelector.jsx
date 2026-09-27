import { useContext, useState, useRef, useEffect } from 'react'
import { AppContext } from '../context/AppContext'

const LanguageSelector = () => {
  const { language, setLanguage } = useContext(AppContext)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी (Hindi)' },
    { code: 'mr', label: 'मराठी (Marathi)' },
  ]

  const currentLang = languages.find((l) => l.code === language) || languages[0]

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className='flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full text-xs sm:text-sm font-semibold text-gray-800 transition-all shadow-sm'
        title='Select Language: English / हिंदी / मराठी'
      >
        <span>🌐</span>
        <span>{currentLang.label.split(' ')[0]}</span>
        <span className='text-[10px] text-gray-400'>▾</span>
      </button>

      {isOpen && (
        <div className='absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 p-1.5 z-50 animate-fade-in'>
          <p className='text-[10px] font-bold text-gray-400 uppercase px-3 py-1 tracking-wider'>
            Language / भाषा
          </p>
          {languages.map((item) => (
            <button
              key={item.code}
              onClick={() => {
                setLanguage(item.code)
                setIsOpen(false)
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm flex items-center justify-between transition-colors ${
                language === item.code
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-gray-700 hover:bg-gray-50 font-medium'
              }`}
            >
              <span>{item.label}</span>
              {language === item.code && <span className='text-primary text-xs'>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSelector
