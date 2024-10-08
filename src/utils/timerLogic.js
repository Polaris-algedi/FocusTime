export const MIN_DURATION = 1; // 5 minutes
export const MAX_DURATION = 60; // 60 minutes
export const DEFAULT_FOCUS_DURATION = 25; // 25 minutes
export const DEFAULT_BREAK_DURATION = 5; // 5 minutes
export const STEP = 5; // 5 minutes

/**
 * Increases the current duration by the specified step.
 *
 * @param {number} currentDuration - The current duration.
 * @return {number} The increased duration.
 */
export function increaseDuration(currentDuration) {
  return Math.min(currentDuration + STEP, MAX_DURATION);
}

/**
 * Decreases the current duration by the specified step.
 *
 * @param {number} currentDuration - The current duration.
 * @return {number} The decreased duration.
 */
export function decreaseDuration(currentDuration) {
  return Math.max(currentDuration - STEP, MIN_DURATION);
}

/**
 * Formats a time in seconds to a string in the format 'MM:SS'.
 *
 * @param {number} timeInSeconds - The time in seconds to be formatted.
 * @return {string} The formatted time as a string.
 */
export function formatTime(timeInSeconds) {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Returns the current date in the format 'YYYY-MM-DD'.
 *
 * @return {string} The current date as a string in 'YYYY-MM-DD' format.
 */
export function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/* 
This function returns the current date in UTC format (YYYY-MM-DD). 
It uses the toISOString() method, which provides the date and time in UTC. 
The split("T")[0] part extracts just the date portion.
*/
/*
export function getTodayDate() {
  const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
  return today;
}
*/
