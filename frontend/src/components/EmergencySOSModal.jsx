import { useContext } from 'react'
import { AppContext } from '../context/AppContext'

const EmergencySOSModal = ({ isOpen, onClose }) => {
  const { userData, t } = useContext(AppContext)

  if (!isOpen) return null

  const emergencyContacts = [
    { title: 'National Emergency Ambulance', number: '108', icon: '🚑', desc: 'Free 24/7 Medical Response' },
    { title: 'Police / Emergency Support', number: '112', icon: '🚨', desc: 'National Emergency Helpline' },
    { title: 'Hospital Emergency Desk', number: '+1 (800) 555-0199', icon: '🏥', desc: 'Prescripto Central Trauma Center' },
    { title: 'National Poison Information', number: '1800-116-117', icon: '🧪', desc: 'Toxicology Advisory' },
  ]

  const userSOS = userData?.emergencyContact

  return (
    <div className='fixed inset-0 bg-rose-950/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in'>
      <div className='bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl border-2 border-rose-200'>
        <div className='flex items-center justify-between pb-4 border-b border-rose-100'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-xl animate-pulse'>
              🚨
            </div>
            <div>
              <h3 className='font-black text-xl text-rose-700'>Emergency SOS Assistance</h3>
              <p className='text-xs text-gray-500'>Immediate Medical Help & Helplines</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold'
          >
            ✕
          </button>
        </div>

        {/* User's Configured Emergency Contact */}
        {userSOS?.phone ? (
          <div className='my-5 p-4 bg-rose-50 border border-rose-200 rounded-2xl'>
            <p className='text-xs font-bold text-rose-800 uppercase tracking-wider mb-1'>
              Your Designated Personal SOS Contact:
            </p>
            <div className='flex items-center justify-between mt-2'>
              <div>
                <p className='font-black text-gray-900 text-lg'>{userSOS.name || 'Family Contact'}</p>
                <p className='text-xs text-gray-600'>{userSOS.relation || 'Emergency Contact'}</p>
              </div>
              <a
                href={`tel:${userSOS.phone}`}
                className='px-4 py-2 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 shadow-md flex items-center gap-1.5'
              >
                📞 Call Now
              </a>
            </div>
          </div>
        ) : (
          <div className='my-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between'>
            <span>⚠️ You haven't configured a personal emergency contact yet.</span>
            <a href='/profile' className='font-bold underline text-amber-950'>
              Set in Profile
            </a>
          </div>
        )}

        {/* Rapid Dial Grid */}
        <div className='space-y-3 mt-4'>
          <p className='text-xs font-bold text-gray-500 uppercase tracking-wider'>
            Immediate Hospital & Emergency Lines:
          </p>
          {emergencyContacts.map((item, idx) => (
            <div
              key={idx}
              className='p-3.5 bg-gray-50 hover:bg-rose-50/50 border border-gray-200 hover:border-rose-200 rounded-2xl flex items-center justify-between transition-all'
            >
              <div className='flex items-center gap-3'>
                <span className='text-2xl'>{item.icon}</span>
                <div>
                  <p className='font-bold text-gray-900 text-sm'>{item.title}</p>
                  <p className='text-xs text-gray-500'>{item.desc}</p>
                </div>
              </div>
              <a
                href={`tel:${item.number}`}
                className='px-4 py-2 bg-gray-900 hover:bg-rose-600 text-white font-mono font-bold text-sm rounded-xl transition-colors shadow-sm'
              >
                {item.number}
              </a>
            </div>
          ))}
        </div>

        <div className='mt-6 pt-4 border-t text-center'>
          <button
            onClick={onClose}
            className='w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-2xl text-sm transition-colors'
          >
            Close Emergency Panel
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmergencySOSModal
