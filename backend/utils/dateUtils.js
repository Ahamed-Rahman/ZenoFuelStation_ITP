// utils/dateUtils.js

/**
 * Checks if a given date string is today's date.
 * @param {string} dateString - The date string to check.
 * @returns {boolean} - True if the date is today, false otherwise.
 */
const isToday = (dateString) => {
    const today = new Date();
    const date = new Date(dateString);
  
    return (
      today.getDate() === date.getDate() &&
      today.getMonth() === date.getMonth() &&
      today.getFullYear() === date.getFullYear()
    );
  };
  
  module.exports = { isToday };
  