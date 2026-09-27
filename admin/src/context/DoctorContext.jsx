import { useState, createContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const DoctorContext = createContext();

const DoctorContextProvider = ({ children }) => {
  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");

  const [dToken, setDToken] = useState(
    localStorage.getItem("dToken") ? localStorage.getItem("dToken") : ""
  );
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(false);
  const [profileData, setProfileData] = useState(false);

  const getAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/appointments", {
        headers: { dToken },
      });
      if (data.success) {
        setAppointments(data.appointments || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Doctor get appointments error:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("dToken");
        setDToken("");
      } else {
        toast.error(error.response?.data?.message || error.message);
      }
    }
  };

  const completeAppointment = async (
    appointmentId,
    prescription = "",
    diagnosisNotes = "",
    structuredMedicines = [],
    followUpDays = 0
  ) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/complete-appointment",
        { appointmentId, prescription, diagnosisNotes, structuredMedicines, followUpDays },
        { headers: { dToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAppointments();
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      console.log("Doctor complete appointment error:", error);
      toast.error(error.response?.data?.message || error.message);
      return false;
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/cancel-appointment",
        { appointmentId },
        { headers: { dToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAppointments();
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      console.log("Doctor cancel appointment error:", error);
      toast.error(error.response?.data?.message || error.message);
      return false;
    }
  };

  const collectPayment = async (
    appointmentId,
    paymentMethod = "Cash Collected (Clinic)"
  ) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/collect-payment",
        { appointmentId, paymentMethod },
        { headers: { dToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAppointments();
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      console.log("Doctor collect payment error:", error);
      toast.error(error.response?.data?.message || error.message);
      return false;
    }
  };

  const updateLiveQueue = async (queueData) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/update-live-queue",
        queueData,
        { headers: { dToken } }
      );
      if (data.success) {
        toast.success(data.message || "Live OPD Queue updated!");
        getProfileData();
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      console.log("Update live queue error:", error);
      toast.error(error.response?.data?.message || error.message);
      return false;
    }
  };

  const getDashData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/dashboard", {
        headers: { dToken },
      });
      if (data.success) {
        setDashData(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Doctor get dash data error:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const getProfileData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/profile", {
        headers: { dToken },
      });
      if (data.success) {
        setProfileData(data.profileData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Doctor get profile data error:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const acceptAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/accept-appointment",
        { appointmentId },
        { headers: { dToken } }
      );
      if (data.success) {
        toast.success(data.message || "Appointment accepted!");
        getAppointments();
        getDashData();
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      console.log("Doctor accept appointment error:", error);
      toast.error(error.response?.data?.message || error.message);
      return false;
    }
  };

  const rejectAppointment = async (appointmentId, rejectionReason = "Doctor unavailable for requested slot") => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/reject-appointment",
        { appointmentId, rejectionReason },
        { headers: { dToken } }
      );
      if (data.success) {
        toast.success(data.message || "Appointment rejected");
        getAppointments();
        getDashData();
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      console.log("Doctor reject appointment error:", error);
      toast.error(error.response?.data?.message || error.message);
      return false;
    }
  };

  const value = {
    dToken,
    setDToken,
    backendUrl,
    appointments,
    setAppointments,
    getAppointments,
    acceptAppointment,
    rejectAppointment,
    completeAppointment,
    cancelAppointment,
    collectPayment,
    updateLiveQueue,
    dashData,
    setDashData,
    getDashData,
    profileData,
    setProfileData,
    getProfileData,
  };

  return (
    <DoctorContext.Provider value={value}>{children}</DoctorContext.Provider>
  );
};

export default DoctorContextProvider;
