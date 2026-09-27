import { useContext } from 'react'
import Login from './pages/Login'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AdminContext } from './context/AdminContext'
import Navbar from './components/Navbar'
import SideBar from './components/SideBar'
import AIAssistant from './components/AIAssistant'
import { Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Admin/Dashboard.jsx'
import AllAppointments from "./pages/Admin/AllAppointments.jsx"
import AddDoctor from "./pages/Admin/AddDoctor.jsx"
import DoctorsList from './pages/Admin/DoctorsList.jsx'
import { DoctorContext } from './context/DoctorContext.jsx'
import DoctorDashboard from './pages/Doctor/DoctorDashboard.jsx'
import DoctorAppointment from './pages/Doctor/DoctorAppointment.jsx'
import DoctorProfile from './pages/Doctor/DoctorProfile.jsx'

const App = () => {
  const { aToken } = useContext(AdminContext)
  const { dToken } = useContext(DoctorContext)

  return aToken || dToken ? (
    <div className='bg-[#F8F9FD] min-h-screen flex flex-col'>
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />
      <div className='flex flex-1 items-start min-h-[calc(100vh-65px)]'>
        <SideBar />
        <main className='flex-1 min-w-0 p-4 sm:p-6 lg:p-8'>
          <Routes>
            {/* Admin Routes */}
            <Route path='/' element={<Navigate to={aToken ? '/admin-dashboard' : '/doctor-dashboard'} replace />} />
            <Route path='/admin-dashboard' element={<Dashboard />} />
            <Route path='/all-appointments' element={<AllAppointments />} />
            <Route path='/add-doctor' element={<AddDoctor />} />
            <Route path='/doctor-list' element={<DoctorsList />} />
            {/* Doctor Routes */}
            <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
            <Route path='/doctor-appointments' element={<DoctorAppointment />} />
            <Route path='/doctor-profile' element={<DoctorProfile />} />
            <Route path='*' element={<Navigate to={aToken ? '/admin-dashboard' : '/doctor-dashboard'} replace />} />
          </Routes>
        </main>
      </div>
      {/* Intelligent AI Assistant for Admin & Doctor */}
      <AIAssistant />
    </div>
  ) : (
    <>
      <Login />
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  )
}

export default App
