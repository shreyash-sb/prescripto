const MONTHS = [
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
 * Formats slotDate string (e.g., "24_09_2026") into human-readable format ("24 Sep 2026").
 * @param {string} slotDate
 * @returns {string}
 */
export const slotDateFormat = (slotDate) => {
  if (!slotDate) return "";
  const dateArray = slotDate.split("_");
  if (dateArray.length < 3) return slotDate;
  const monthNum = Number(dateArray[1]);
  const monthName = MONTHS[monthNum] || dateArray[1];
  return `${dateArray[0]} ${monthName} ${dateArray[2]}`;
};

/**
 * Calculates patient age based on date of birth.
 * @param {string} dob
 * @returns {number|string}
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
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return isNaN(age) || age < 0 ? "N/A" : age;
};

/**
 * Formats currency amounts cleanly.
 * @param {number|string} amount
 * @param {string} symbol
 * @returns {string}
 */
export const formatCurrency = (amount, symbol = "$") => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return `${symbol}0`;
  }
  return `${symbol}${Number(amount).toLocaleString()}`;
};
