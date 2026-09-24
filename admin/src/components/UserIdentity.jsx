const getUserInitials = (name = '') => {
  const clean = name.trim()
  if (!clean) return 'PT'
  const parts = clean.split(' ').filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return clean.slice(0, 2).toUpperCase()
}

const UserIdentity = ({ name = 'Patient', className = '' }) => {
  const initials = getUserInitials(name)

  return (
    <div
      className={`w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-sm flex-shrink-0 ${className}`}
      title={name}
    >
      <span>{initials}</span>
    </div>
  )
}

export default UserIdentity
