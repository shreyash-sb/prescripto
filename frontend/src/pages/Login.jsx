import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const { backendUrl, token, setToken } = useContext(AppContext)
  const navigate = useNavigate()

  const [state, setState] = useState('Login') // 'Login' | 'Sign Up'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleFillDemo = () => {
    setState('Login');
    setEmail('patient@example.com');
    setPassword('patient12345');
    toast.info('Demo Patient credentials filled! Click Log In to continue.');
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      if (state === 'Sign Up') {
        const { data } = await axios.post(`${backendUrl}/api/user/register`, {
          name,
          password,
          email,
        })
        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
          toast.success('Account created successfully!')
          navigate('/')
        } else {
          toast.error(data.message)
        }
      } else {
        const { data } = await axios.post(`${backendUrl}/api/user/login`, {
          password,
          email,
        })
        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
          toast.success('Welcome back!')
          navigate('/')
        } else {
          toast.error(data.message)
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      navigate('/')
    }
  }, [token, navigate])

  return (
    <div className='min-h-[80vh] flex flex-col justify-center items-center py-10 px-4'>
      {/* Patient Demo Quick Login */}
      <div className='flex items-center gap-2 mb-6 bg-white px-5 py-2 rounded-full border border-indigo-100 shadow-sm text-xs sm:text-sm'>
        <span className='font-bold text-gray-600'>Demo:</span>
        <button
          type='button'
          onClick={handleFillDemo}
          className='bg-primary hover:bg-opacity-95 text-white font-bold px-4 py-1.5 rounded-full transition-all shadow-sm active:scale-95 text-xs'
        >
          👤 Fill Patient Demo
        </button>
      </div>

      <form
        onSubmit={onSubmitHandler}
        className='flex flex-col gap-4 m-auto p-8 sm:p-10 w-full max-w-md rounded-3xl text-zinc-700 text-base shadow-2xl border border-gray-100 bg-white'
      >
        <p className='text-2xl sm:text-3xl font-bold text-gray-900'>
          {state === 'Sign Up' ? 'Create Patient Account' : 'Patient Login'}
        </p>
        <p className='text-sm text-gray-500 -mt-2'>
          Please {state === 'Sign Up' ? 'sign up' : 'log in'} to schedule consultations
        </p>

        {state === 'Sign Up' && (
          <div className='w-full'>
            <p className='text-sm font-semibold text-gray-700 mb-1.5'>Full Name</p>
            <input
              type='text'
              placeholder='e.g. Alex Johnson'
              onChange={(e) => setName(e.target.value)}
              value={name}
              className='border border-zinc-300 rounded-xl w-full p-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all'
              required
            />
          </div>
        )}

        <div className='w-full'>
          <p className='text-sm font-semibold text-gray-700 mb-1.5'>Email Address</p>
          <input
            type='email'
            placeholder='patient@example.com'
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className='border border-zinc-300 rounded-xl w-full p-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all'
            required
          />
        </div>

        <div className='w-full relative'>
          <p className='text-sm font-semibold text-gray-700 mb-1.5'>Password</p>
          <div className='relative'>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder='Minimum 8 characters'
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className='border border-zinc-300 rounded-xl w-full p-3 pr-16 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all'
              required
            />
            <button
              type='button'
              onClick={() => setShowPassword((prev) => !prev)}
              className='absolute right-3.5 top-3.5 text-xs font-bold text-gray-500 hover:text-gray-700'
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <button
          type='submit'
          disabled={isLoading}
          className='bg-primary text-white w-full py-3.5 rounded-2xl text-base font-bold hover:bg-opacity-95 shadow-md mt-2 transition-all active:scale-95'
        >
          {isLoading ? 'Please wait...' : state === 'Sign Up' ? 'Create Account' : 'Log in'}
        </button>

        <div className='text-sm text-center pt-3 border-t mt-2 text-gray-600'>
          {state === 'Sign Up' ? (
            <p>
              Already have an account?{' '}
              <span
                onClick={() => setState('Login')}
                className='text-primary font-bold underline cursor-pointer'
              >
                Login here
              </span>
            </p>
          ) : (
            <p>
              New to our platform?{' '}
              <span
                onClick={() => setState('Sign Up')}
                className='text-primary font-bold underline cursor-pointer'
              >
                Create an account
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  )
}

export default Login
