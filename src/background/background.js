import {
  DEFAULT_FOCUS_DURATION,
  DEFAULT_BREAK_DURATION,
  formatTime,
  getTodayDate,
} from "../utils/timerLogic.js";

let timer = {
  isRunning: false,
  timeLeft: DEFAULT_FOCUS_DURATION * 60,
  duration: DEFAULT_FOCUS_DURATION,
  interval: null,
  break: {
    isBreak: false,
    breakNumber: 0,
  },
  sessionCounter: 0,

  loadStateFromStorage: function () {
    return new Promise((resolve, reject) => {
      if (chrome && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(["timerState"], (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else if (result.timerState) {
            const state = result.timerState;
            this.timeLeft = state.timeLeft;
            this.duration = state.duration;
            this.break.isBreak = state.isBreak;
            this.sessionCounter = state.sessionCounter;
            this.break.breakNumber = state.breakNumber;
            this.isRunning = state.isRunning;
            console.log("Timer state loaded from storage");
            resolve(state);
          } else {
            console.log("No saved timer state found in storage");
            resolve(null);
          }
        });
      } else {
        reject(new Error("Chrome storage is not available"));
      }
    });
  },

  saveStateToStorage: function () {
    return new Promise((resolve, reject) => {
      if (chrome && chrome.storage && chrome.storage.local) {
        const state = {
          timeLeft: this.timeLeft,
          duration: this.duration,
          isBreak: this.break.isBreak,
          sessionCounter: this.sessionCounter,
          breakNumber: this.break.breakNumber,
          isRunning: this.isRunning,
          lastUpdated: getTodayDate(),
        };

        chrome.storage.local.set({ timerState: state }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            console.log("Timer state saved to storage");
            resolve();
          }
        });
      } else {
        reject(new Error("Chrome storage is not available"));
      }
    });
  },
};

// Load state
timer
  .loadStateFromStorage()
  .then((state) => {
    if (state) {
      console.log("Loaded timer state:", state);
      // Initialize UI with the loaded state
      updatePopup();
      updateBadge();
    } else {
      console.log("No saved state, using default values");
    }
  })
  .catch((error) => console.error("Error loading timer state:", error));

const options = {
  type: "basic",
  skipBreaks: false,
  timer: timer,
};

const focusData = {
  /*"2024-01-01": {
    "sessionCount": 0,
    "totalFocusTime": 0,
    "totalBreakTime": 0,
    "dailyGoal": 0,
    ""
  }*/
};

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.storage.local.set({ focusData: focusData });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "startTimer":
      startTimer(request.duration);
      break;
    case "pauseTimer":
      pauseTimer();
      break;
    case "resetTimer":
      resetTimer(request.duration);
      break;
    case "updateDuration":
      updateDuration(request.duration);
      break;
    case "getTimerState":
      sendResponse({ timer });
      break;
  }
  return true; // Indicates that the response will be sent asynchronously
});

function startTimer(duration) {
  if (!timer.isRunning) {
    timer.isRunning = true;
    timer.duration = duration;
    // Prevent overwriting the timer when restarting
    // Check if the new duration is different from the previous one
    // If it's different, update the timer's timeLeft; otherwise, keep the current timeLeft
    timer.timeLeft =
      timer.duration !== duration ? duration * 60 : timer.timeLeft;

    timer.interval = setInterval(() => {
      timer.timeLeft--;
      if (timer.timeLeft <= 0) {
        handleTimerEnd();
      }
      updatePopup();
      updateBadge();
    }, 1000);
  }
}

function pauseTimer() {
  // Code to remove later !!!!!!!!!!!!!!!!
  // --------------------------------------------
  // Test if data persist when extension is reloaded
  chrome.storage.local.get("focusData", (result) => {
    console.log(result);
  });

  // --------------------------------------------

  // main code
  timer.isRunning = false;
  clearInterval(timer.interval);
  timer
    .saveStateToStorage()
    .then(() => console.log("Timer state saved successfully"))
    .catch((error) => console.error("Error saving timer state:", error));
  updateBadge();
  updatePopup();
}

function resetTimer(duration) {
  pauseTimer();
  timer.duration = duration;
  timer.timeLeft = duration * 60;
  timer
    .saveStateToStorage()
    .then(() => console.log("Timer state saved successfully"))
    .catch((error) => console.error("Error saving timer state:", error));
  updatePopup();
}

function updateDuration(duration) {
  timer.duration = duration;
  timer.timeLeft = duration * 60;
  updateBadge();
  updatePopup();
}

function handleTimerEnd() {
  // Update focus data
  // Get today's date
  chrome.storage.local.get("focusData", (result) => {
    const focusData = result.focusData || {};
    const todayDate = getTodayDate();

    //----------------------DEBUG-------------------------
    /* console.log(todayDate);
    const now = new Date();
    console.log("Current Date Object:", now);
    console.log("Current UTC Date String:", now.toUTCString());
    console.log("Current Local Date String:", now.toString()); */
    //----------------------------------------------------

    if (timer.break.isBreak) {
      focusData[todayDate].totalBreakTime += timer.duration * 60;
      // Count the break
      timer.break.breakNumber++;
      // Reset the timer and save the extension state and go back to focus mode
      timer.break.isBreak = false;
      resetTimer(DEFAULT_FOCUS_DURATION);
    } else if (focusData[todayDate]) {
      // Check if today's date is already in focusData

      // Count the session
      timer.sessionCounter++;

      // Update focus data

      const newCount = focusData[todayDate].sessionCount + 1;
      const newTime = focusData[todayDate].totalFocusTime + timer.duration * 60;

      focusData[todayDate].sessionCount = newCount;
      focusData[todayDate].totalFocusTime = newTime;

      // Reset the timer and save the extension state and go back to break mode

      timer.break.isBreak = true;
      resetTimer(DEFAULT_BREAK_DURATION);
    } else {
      // If today's date is not in focusData, create a new entry
      focusData[todayDate] = {
        sessionCount: 1,
        totalFocusTime: timer.duration * 60,
        totalBreakTime: 0,
        dailyGoal: 0, // handle daily Goal time later
      };

      timer.break.isBreak = true;
      resetTimer(DEFAULT_BREAK_DURATION);
    }

    chrome.storage.local.set({
      focusData: focusData,
      dataBackup: focusData,
    });
  });
}

function updateBadge() {
  const timerMinutes = Math.floor(timer.timeLeft / 60);
  const timerSeconds = timer.timeLeft % 60;
  let badgeText = `${timerMinutes.toString().padStart(2, "0")}:${timerSeconds
    .toString()
    .padStart(2, "0")}`;
  chrome.action.setBadgeText({ text: badgeText });
  if (timer.break.isBreak) {
    chrome.action.setBadgeBackgroundColor({
      color: timer.isRunning ? "#4CAF50" : "#FFFF00",
    });
  } else {
    chrome.action.setBadgeBackgroundColor({
      color: timer.isRunning ? "#FF5722" : "#FFFF00",
    });
  }
}

function updatePopup() {
  chrome.runtime.sendMessage({
    action: "timerUpdate",
    timer: {
      isRunning: timer.isRunning,
      timeLeft: timer.timeLeft,
      duration: timer.duration,
    },
  });
}
