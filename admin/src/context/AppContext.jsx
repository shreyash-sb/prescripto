import { createContext } from "react";
import { calculateAge, slotDateFormat, formatCurrency } from "../utils/formatters.js";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const currency = "$";

  const value = {
    calculateAge,
    slotDateFormat,
    formatCurrency,
    currency,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
