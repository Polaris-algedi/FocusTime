import "./popup.css";
import {
  MIN_DURATION,
  MAX_DURATION,
  DEFAULT_DURATION,
  increaseDuration,
  decreaseDuration,
  formatTime,
  getTodayDate,
} from "../utils/timerLogic.js";

const timerDisplay = document.getElementById("timer");
const durationDisplay = document.getElementById("durationDisplay");
const decreaseBtn = document.getElementById("decreaseBtn");
const increaseBtn = document.getElementById("increaseBtn");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const pomodoroCountEl = document.getElementById("pomodoroCount");
const totalFocusTimeEl = document.getElementById("totalFocusTime");

let timer = {
  isRunning: false,
  timeLeft: DEFAULT_DURATION * 60,
  duration: DEFAULT_DURATION,
};

function updateDisplay() {
  timerDisplay.textContent = formatTime(timer.timeLeft);
  durationDisplay.textContent = timer.duration;
}

function updateStats() {
  chrome.storage.local.get("focusData", (result) => {
    const focusData = result.focusData || {};
    const todayDate = getTodayDate();

    if (focusData[todayDate]) {
      const { pomodoroCount, totalFocusTime } = focusData[todayDate];
      pomodoroCountEl.textContent = pomodoroCount || 0;
      totalFocusTimeEl.textContent = Math.floor((totalFocusTime || 0) / 60);
    }
  });
}

decreaseBtn.addEventListener("click", () => {
  if (!timer.isRunning) {
    timer.duration = decreaseDuration(timer.duration);
    timer.timeLeft = timer.duration * 60;
    updateDisplay();
    chrome.runtime.sendMessage({
      action: "updateDuration",
      duration: timer.duration,
    });
  }
});

increaseBtn.addEventListener("click", () => {
  if (!timer.isRunning) {
    timer.duration = increaseDuration(timer.duration);
    timer.timeLeft = timer.duration * 60;
    updateDisplay();
    chrome.runtime.sendMessage({
      action: "updateDuration",
      duration: timer.duration,
    });
  }
});

startBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({
    action: "startTimer",
    duration: timer.duration,
  });
});

pauseBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "pauseTimer" });
});

resetBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({
    action: "resetTimer",
    duration: timer.duration,
  });
});

function init() {
  chrome.runtime.sendMessage({ action: "getTimerState" }, (response) => {
    if (response && response.timer) {
      timer = response.timer;
      updateDisplay();
    }
  });
  updateStats();
}

init();

// Listen for updates from background script
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "timerUpdate") {
    timer = request.timer;
    updateDisplay();
    updateStats();
  }
});

// TODO: I think you have to add an time event listener if it exists to make the app update the stats at the start of the day
