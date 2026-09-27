import { createContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = ({ children }) => {
  const [aToken, setAToken] = useState(
    localStorage.getItem("aToken") ? localStorage.getItem("aToken") : ""
  );
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(false);

  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");

  const getAllDoctors = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/admin/all-doctors", {
        headers: { aToken },
      });
      if (response.data.success) {
        setDoctors(response.data.doctors || response.data.doctor || []);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log("Admin get doctors error:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("aToken");
        setAToken("");
      } else {
        toast.error(error.response?.data?.message || error.message);
      }
    }
  };

  const changeAvailability = async (docId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/change-availability",
        { docId },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAllDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Change availability error:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const deleteDoctor = async (docId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/delete-doctor",
        { docId },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAllDoctors();
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      console.log("Delete doctor error:", error);
      toast.error(error.response?.data?.message || error.message);
      return false;
    }
  };

  const getAllAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/appointments", {
        headers: { aToken },
      });
      if (data.success) {
        setAppointments(data.appointments || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Admin get appointments error:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/cancel-appointment",
        { appointmentId },
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success(data.message);
        getAllAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Admin cancel appointment error:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const collectPayment = async (
    appointmentId,
    paymentMethod = "Verified by Admin"
  ) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/collect-payment",
        { appointmentId, paymentMethod },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAllAppointments();
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      console.log("Admin collect payment error:", error);
      toast.error(error.response?.data?.message || error.message);
      return false;
    }
  };

  const getDashData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/dashboard", {
        headers: { aToken },
      });
      if (data.success) {
        setDashData(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Admin dash data error:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const value = {
    aToken,
    setAToken,
    backendUrl,
    doctors,
    getAllDoctors,
    changeAvailability,
    deleteDoctor,
    appointments,
    setAppointments,
    getAllAppointments,
    cancelAppointment,
    collectPayment,
    getDashData,
    dashData,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export default AdminContextProvider;
