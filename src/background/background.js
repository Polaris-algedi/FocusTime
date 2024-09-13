import {
  DEFAULT_DURATION,
  formatTime,
  getTodayDate,
} from "../utils/timerLogic.js";

let timer = {
  isRunning: false,
  timeLeft: DEFAULT_DURATION * 60,
  duration: DEFAULT_DURATION,
  interval: null,
};

const focusData = {
  /*"2024-01-01": {
    "pomodoroCount": 0,
    "totalFocusTime": 0,
    "totalBreakTime": 0,
    "dailyGoal": 0,


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
    timer.timeLeft = duration * 60;
    timer.interval = setInterval(() => {
      timer.timeLeft--;
      if (timer.timeLeft <= 0) {
        handleTimerEnd();
      }
      updatePopup();
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
  updatePopup();
}

function resetTimer(duration) {
  pauseTimer();
  timer.duration = duration;
  timer.timeLeft = duration * 60;
  updatePopup();
}

function updateDuration(duration) {
  timer.duration = duration;
  timer.timeLeft = duration * 60;
  updatePopup();
}

function handleTimerEnd() {
  chrome.storage.local.get("focusData", (result) => {
    const focusData = result.focusData || {};
    const todayDate = getTodayDate();
    //----------------------DEBUG-------------------------
    console.log(todayDate);
    const now = new Date();
    console.log("Current Date Object:", now);
    console.log("Current UTC Date String:", now.toUTCString());
    console.log("Current Local Date String:", now.toString());
    //----------------------------------------------------

    if (focusData[todayDate]) {
      const newCount = focusData[todayDate].pomodoroCount + 1;
      const newTime = focusData[todayDate].totalFocusTime + timer.duration * 60;

      focusData[todayDate].pomodoroCount = newCount;
      focusData[todayDate].totalFocusTime = newTime;
      // focusData[todayDate].totalBreakTime = 0; // handle total break time later
    } else {
      focusData[todayDate] = {
        pomodoroCount: 1,
        totalFocusTime: timer.duration * 60,
        totalBreakTime: 0,
        dailyGoal: 0, // handle daily Goal time later
      };
    }

    chrome.storage.local.set({
      focusData: focusData,
    });
  });
  resetTimer(timer.duration);
  // You can add notification logic here
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
