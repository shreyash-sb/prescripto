/**
 * Month name abbreviations
 */
export const MONTHS = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Formats a slotDate string (e.g. "22_9_2026") into human-readable format ("22 Sep 2026")
 * @param {string} slotDate - Stored slot date string formatted as D_M_YYYY
 * @returns {string} - Formatted date string
 */
export const slotDateFormat = (slotDate) => {
  if (!slotDate) return "";
  const dateArray = slotDate.split("_");
  if (dateArray.length < 3) return slotDate;
  const day = dateArray[0];
  const monthIdx = Number(dateArray[1]);
  const year = dateArray[2];
  return `${day} ${MONTHS[monthIdx] || ""} ${year}`;
};

/**
 * Formats currency amount with symbol
 * @param {number} amount - Numeric amount
 * @param {string} symbol - Currency symbol (default '$')
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, symbol = "$") => {
  return `${symbol}${Number(amount || 0).toLocaleString()}`;
};

/**
 * Calculates human age from date of birth
 * @param {string} dob - Date of birth string
 * @returns {string|number} - Age in years or "N/A"
 */
export const calculateAge = (dob) => {
  if (!dob || dob.toLowerCase() === "not selected") {
    return "N/A";
  }
  const today = new Date();
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) {
    return "N/A";
  }
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return isNaN(age) || age < 0 ? "N/A" : age;
};

export default {
  MONTHS,
  slotDateFormat,
  formatCurrency,
  calculateAge,
};
