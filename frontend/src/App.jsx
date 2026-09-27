import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import About from "./pages/About"
import Doctors from "./pages/Doctors"
import Login from "./pages/Login"
import Contact from "./pages/Contact"
import MyProfile from "./pages/MyProfile"
import MyAppointments from "./pages/MyAppointments"
import Appointment from './pages/Appointment'
import MedicineSchedule from './pages/MedicineSchedule'
import FollowUpManager from './pages/FollowUpManager'
import PrivacyAuditLog from './pages/PrivacyAuditLog'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AIAssistant from './components/AIAssistant'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  return (
    <div className='mx-4 sm:mx-[8%]'>
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/doctors' element={<Doctors />} />
        <Route path='/doctors/:speciality' element={<Doctors />} />
        <Route path='/medicine-schedule' element={<MedicineSchedule />} />
        <Route path='/follow-ups' element={<FollowUpManager />} />
        <Route path='/privacy-logs' element={<PrivacyAuditLog />} />
        <Route path='/login' element={<Login />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/profile' element={<MyProfile />} />
        <Route path='/my-profile' element={<MyProfile />} />
        <Route path='/my-appointments' element={<MyAppointments />} />
        <Route path='/appointment/:docId' element={<Appointment />} />
      </Routes>
      <Footer />
      <AIAssistant />
    </div>
  )
}

export default App
