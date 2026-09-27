import { useContext, useState } from 'react'
import { AdminContext } from '../context/AdminContext.jsx'
import axios from 'axios'
import { toast } from 'react-toastify'
import { DoctorContext } from '../context/DoctorContext.jsx'

const Login = () => {
  const [role, setRole] = useState('Admin') // 'Admin' | 'Doctor'
  const [isRegister, setIsRegister] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Common Fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Admin Specific Field
  const [secretCode, setSecretCode] = useState('ADMIN123')

  // Doctor Specific Fields
  const [speciality, setSpeciality] = useState('General physician')
  const [degree, setDegree] = useState('MBBS, MD')
  const [experience, setExperience] = useState('3 Years')
  const [fees, setFees] = useState(50)
  const [about, setAbout] = useState('')
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')

  const { setAToken, backendUrl } = useContext(AdminContext)
  const { setDToken } = useContext(DoctorContext)

  // Fill Demo Credentials Helpers
  const handleFillAdminDemo = () => {
    setRole('Admin');
    setIsRegister(false);
    setEmail('admin@example.com');
    setPassword('admin12345');
    toast.info('🛡️ Admin Demo credentials filled! Click Admin Login to continue.');
  };

  const handleFillDoctorDemo = () => {
    setRole('Doctor');
    setIsRegister(false);
    setEmail('doctor@example.com');
    setPassword('doctor12345');
    toast.info('👨‍⚕️ Doctor Demo credentials filled! Click Doctor Login to continue.');
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      if (role === 'Admin') {
        if (isRegister) {
          const { data } = await axios.post(`${backendUrl}/api/admin/register`, {
            name,
            email,
            password,
            secretCode,
          })
          if (data.success) {
            toast.success(data.message || 'Admin account created!')
            localStorage.setItem('aToken', data.token)
            setAToken(data.token)
          } else {
            toast.error(data.message)
          }
        } else {
          const { data } = await axios.post(`${backendUrl}/api/admin/login`, {
            email,
            password,
          })
          if (data.success) {
            localStorage.setItem('aToken', data.token)
            setAToken(data.token)
            toast.success('Admin login successful!')
          } else {
            toast.error(data.message)
          }
        }
      } else {
        if (isRegister) {
          const doctorPayload = {
            name,
            email,
            password,
            speciality,
            degree,
            experience,
            fees: Number(fees),
            about: about || `Dr. ${name} is a dedicated ${speciality} practitioner.`,
            address: { line1: address1 || 'Medical Center St.', line2: address2 || 'Clinic Suite' },
          }

          const { data } = await axios.post(`${backendUrl}/api/doctor/register`, doctorPayload)
          if (data.success) {
            toast.success(data.message || 'Doctor account created!')
            localStorage.setItem('dToken', data.token)
            setDToken(data.token)
          } else {
            toast.error(data.message)
          }
        } else {
          const { data } = await axios.post(`${backendUrl}/api/doctor/login`, {
            email,
            password,
          })
          if (data.success) {
            localStorage.setItem('dToken', data.token)
            setDToken(data.token)
            toast.success('Doctor login successful!')
          } else {
            toast.error(data.message)
          }
        }
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || error.message || 'Authentication error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-[85vh] flex flex-col justify-center items-center py-10 px-4'>
      {/* Demo Credentials Quick-Select Pill */}
      <div className='flex flex-wrap items-center justify-center gap-2 mb-6 bg-white p-2 rounded-full border shadow-sm text-xs'>
        <span className='font-bold text-gray-600 pl-2'>Demo:</span>
        <button
          type='button'
          onClick={handleFillAdminDemo}
          className='bg-[#5F65FF] hover:bg-indigo-600 text-white font-bold px-3.5 py-1 rounded-full transition-all shadow-sm active:scale-95'
        >
          🛡️ Fill Admin Demo
        </button>
        <button
          type='button'
          onClick={handleFillDoctorDemo}
          className='bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1 rounded-full transition-all shadow-sm active:scale-95'
        >
          👨‍⚕️ Fill Doctor Demo
        </button>
      </div>

      {/* Main Authentication Card */}
      <form
        onSubmit={onSubmitHandler}
        className='flex flex-col gap-4 items-start p-6 sm:p-8 w-full max-w-md bg-white border rounded-2xl text-[#5E5E5E] text-sm shadow-xl'
      >
        {/* Role & Mode Switcher */}
        <div className='w-full text-center pb-2 border-b'>
          <div className='inline-flex p-1 bg-gray-100 rounded-xl mb-3'>
            <button
              type='button'
              onClick={() => setRole('Admin')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                role === 'Admin' ? 'bg-white text-[#5F65FF] shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🛡️ Admin
            </button>
            <button
              type='button'
              onClick={() => setRole('Doctor')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                role === 'Doctor' ? 'bg-white text-[#5F65FF] shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              👨‍⚕️ Doctor
            </button>
          </div>
          <p className='text-2xl font-black text-gray-800'>
            <span className='text-[#5F65FF]'>{role} </span> {isRegister ? 'Registration' : 'Login'}
          </p>
          <p className='text-xs text-gray-400 mt-1'>
            {isRegister
              ? `Create your ${role.toLowerCase()} account to manage operations`
              : `Sign in to access the ${role.toLowerCase()} portal`}
          </p>
        </div>

        {/* Registration-only fields */}
        {isRegister && (
          <div className='w-full'>
            <p className='font-bold text-xs mb-1'>Full Name</p>
            <input
              type='text'
              required
              placeholder={role === 'Doctor' ? 'e.g. Dr. Alex Morgan' : 'e.g. John Doe'}
              onChange={(e) => setName(e.target.value)}
              value={name}
              className='border border-gray-300 rounded-lg w-full p-2.5 text-sm focus:border-[#5F65FF] outline-none transition-all'
            />
          </div>
        )}

        {/* Common Email Field */}
        <div className='w-full'>
          <p className='font-bold text-xs mb-1'>Email Address</p>
          <input
            type='email'
            required
            placeholder='name@example.com'
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className='border border-gray-300 rounded-lg w-full p-2.5 text-sm focus:border-[#5F65FF] outline-none transition-all'
          />
        </div>

        {/* Common Password Field */}
        <div className='w-full relative'>
          <p className='font-bold text-xs mb-1'>Password</p>
          <div className='relative'>
            <input
              type={showPassword ? 'text' : 'password'}
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              placeholder='Minimum 8 characters'
              required
              className='border border-gray-300 rounded-lg w-full p-2.5 pr-10 text-sm focus:border-[#5F65FF] outline-none transition-all'
            />
            <button
              type='button'
              onClick={() => setShowPassword((prev) => !prev)}
              className='absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-xs font-bold'
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* Admin Registration Secret Key */}
        {isRegister && role === 'Admin' && (
          <div className='w-full'>
            <div className='flex justify-between items-center mb-1'>
              <p className='font-bold text-xs'>Admin Passkey</p>
              <span className='text-[10px] text-indigo-500 font-bold'>Default: ADMIN123</span>
            </div>
            <input
              type='text'
              required
              placeholder='ADMIN123'
              onChange={(e) => setSecretCode(e.target.value)}
              value={secretCode}
              className='border border-gray-300 rounded-lg w-full p-2.5 text-sm focus:border-[#5F65FF] outline-none transition-all'
            />
          </div>
        )}

        {/* Doctor Registration Specific Fields */}
        {isRegister && role === 'Doctor' && (
          <>
            <div className='grid grid-cols-2 gap-3 w-full'>
              <div>
                <p className='font-bold text-xs mb-1'>Speciality</p>
                <select
                  value={speciality}
                  onChange={(e) => setSpeciality(e.target.value)}
                  className='border border-gray-300 rounded-lg w-full p-2 text-xs focus:border-[#5F65FF] outline-none font-semibold'
                >
                  <option value='General physician'>General physician</option>
                  <option value='Gynecologist'>Gynecologist</option>
                  <option value='Dermatologist'>Dermatologist</option>
                  <option value='Pediatricians'>Pediatricians</option>
                  <option value='Neurologist'>Neurologist</option>
                  <option value='Gastroenterologist'>Gastroenterologist</option>
                </select>
              </div>

              <div>
                <p className='font-bold text-xs mb-1'>Experience</p>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className='border border-gray-300 rounded-lg w-full p-2 text-xs focus:border-[#5F65FF] outline-none font-semibold'
                >
                  <option value='1 Year'>1 Year</option>
                  <option value='2 Years'>2 Years</option>
                  <option value='3 Years'>3 Years</option>
                  <option value='5 Years'>5 Years</option>
                  <option value='7+ Years'>7+ Years</option>
                  <option value='10+ Years'>10+ Years</option>
                </select>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-3 w-full'>
              <div>
                <p className='font-bold text-xs mb-1'>Degree / Qualification</p>
                <input
                  type='text'
                  required
                  placeholder='MBBS, MD'
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className='border border-gray-300 rounded-lg w-full p-2 text-xs focus:border-[#5F65FF] outline-none'
                />
              </div>

              <div>
                <p className='font-bold text-xs mb-1'>Consultation Fee ($)</p>
                <input
                  type='number'
                  required
                  min='0'
                  value={fees}
                  onChange={(e) => setFees(e.target.value)}
                  className='border border-gray-300 rounded-lg w-full p-2 text-xs focus:border-[#5F65FF] outline-none'
                />
              </div>
            </div>

            <div className='w-full'>
              <p className='font-bold text-xs mb-1'>Clinic Address</p>
              <input
                type='text'
                placeholder='Street / Clinic name'
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                className='border border-gray-300 rounded-lg w-full p-2 text-xs mb-1.5 focus:border-[#5F65FF] outline-none'
              />
              <input
                type='text'
                placeholder='City, State'
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                className='border border-gray-300 rounded-lg w-full p-2 text-xs focus:border-[#5F65FF] outline-none'
              />
            </div>

            <div className='w-full'>
              <p className='font-bold text-xs mb-1'>About You</p>
              <textarea
                placeholder='Brief background, patient philosophy, or clinic hours'
                rows='2'
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className='border border-gray-300 rounded-lg w-full p-2 text-xs focus:border-[#5F65FF] outline-none'
              />
            </div>
          </>
        )}

        {/* Submit Button */}
        <button
          type='submit'
          disabled={isLoading}
          className='bg-[#5F65FF] hover:bg-indigo-600 active:scale-[0.99] text-white w-full py-3 rounded-xl font-bold text-sm transition-all shadow-md mt-1'
        >
          {isLoading ? 'Please wait...' : isRegister ? `Create ${role} Account` : `${role} Login`}
        </button>

        {/* Toggle Login / Register */}
        <div className='w-full text-center text-xs text-gray-500 pt-2 border-t flex flex-col gap-1.5'>
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button
                type='button'
                onClick={() => setIsRegister(false)}
                className='text-[#5F65FF] font-bold underline'
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Need a new {role} account?{' '}
              <button
                type='button'
                onClick={() => setIsRegister(true)}
                className='text-[#5F65FF] font-bold underline'
              >
                Register here
              </button>
            </p>
          )}

          <p className='text-gray-400'>
            Switch role to{' '}
            <button
              type='button'
              onClick={() => {
                setRole(role === 'Admin' ? 'Doctor' : 'Admin')
                setIsRegister(false)
              }}
              className='text-indigo-600 underline font-bold'
            >
              {role === 'Admin' ? 'Doctor Portal' : 'Admin Portal'}
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}

export default Login
