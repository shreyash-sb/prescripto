import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { translations } from "../utils/translations";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const backendUrl = (
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"
  ).replace(/\/$/, "");
  const currencySymbol = "$";
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : false
  );
  const [doctors, setDoctors] = useState([]);
  const [userData, setUserData] = useState(false);

  // Multi-lingual Language State: 'en' | 'hi' | 'mr'
  const [language, setLanguageState] = useState(
    localStorage.getItem("prescripto_lang") || "en"
  );

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem("prescripto_lang", lang);
  };

  const t = (key) => {
    const dict = translations[language] || translations.en;
    return dict[key] || translations.en[key] || key;
  };

  // Medicine Routines State
  const [medicineRoutines, setMedicineRoutines] = useState([]);
  const [accessLogs, setAccessLogs] = useState([]);

  const getDoctorData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/list");
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Doctor list fetch error:", error);
    }
  };

  const loadUserProfileData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/get-profile", {
        headers: { token },
      });
      if (data.success) {
        setUserData(data.userData);
        if (data.userData.preferredLanguage && !localStorage.getItem("prescripto_lang")) {
          setLanguageState(data.userData.preferredLanguage);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Profile fetch error:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        setToken(false);
      }
    }
  };

  const getMedicineRoutines = async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(backendUrl + "/api/user/medicine-routines", {
        headers: { token },
      });
      if (data.success) {
        setMedicineRoutines(data.routines);
      }
    } catch (error) {
      console.log("Medicine routines fetch error:", error);
    }
  };

  const getAccessLogs = async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(backendUrl + "/api/user/access-logs", {
        headers: { token },
      });
      if (data.success) {
        setAccessLogs(data.logs);
      }
    } catch (error) {
      console.log("Access logs fetch error:", error);
    }
  };

  useEffect(() => {
    if (token) {
      loadUserProfileData();
      getMedicineRoutines();
      getAccessLogs();
    } else {
      setUserData(false);
      setMedicineRoutines([]);
      setAccessLogs([]);
    }
  }, [token]);

  useEffect(() => {
    getDoctorData();
  }, []);

  const value = {
    doctors,
    getDoctorData,
    currencySymbol,
    token,
    setToken,
    backendUrl,
    userData,
    setUserData,
    loadUserProfileData,
    language,
    setLanguage,
    t,
    medicineRoutines,
    setMedicineRoutines,
    getMedicineRoutines,
    accessLogs,
    getAccessLogs,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
