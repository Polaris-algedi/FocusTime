export function getStorageData(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, resolve);
  });
}

export function setStorageData(data) {
  return new Promise((resolve) => {
    chrome.storage.local.set(data, resolve);
  });
}

/**
 * Retrieves all-time statistics from stored focus data.
 *
 * @return {Object} An object containing the total pomodoro count and total focus time.
 */
export async function getAllTimeStats() {
  const data = await chrome.storage.local.get("focusData");
  const focusData = data.focusData || {};

  return Object.values(focusData).reduce(
    (total, day) => ({
      pomodoroCount: total.pomodoroCount + day.pomodoroCount,
      totalFocusTime: total.totalFocusTime + day.totalFocusTime,
    }),
    { pomodoroCount: 0, totalFocusTime: 0 }
  );
}
