import { getAllTimeStats } from "../utils/storage.js";
import Chart from "chart.js/auto";

//----------------------DEBUG-------------------------
async function checkStorageContents() {
  const allData = await chrome.storage.local.get(null);
  console.log("All storage contents:", allData);
}
//----------------------------------------------------

async function getWeeklyData() {
  const data = await chrome.storage.local.get("focusData");
  //----------------------DEBUG-------------------------

  console.log("Retrieved data:", data);
  if (!data.focusData) {
    console.log("No pomodoro data found in storage");
    return [];
  }
  //----------------------------------------------------

  const focusData = data.focusData || {};

  const today = new Date();
  const weekInMilliseconds = 7 * 24 * 60 * 60 * 1000;
  const lastWeek = new Date(today.getTime() - weekInMilliseconds);

  const weeklyData = Object.entries(focusData)
    .filter(([date]) => new Date(date) >= lastWeek) // Only include data from the last week
    .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB)) // Sort dates in ascending order
    .map(([date, data]) => ({
      date,
      pomodoroCount: data.pomodoroCount,
      totalFocusTime: Math.round(data.totalFocusTime / 3600), // Convert to hours
    }));

  //----------------------DEBUG-------------------------
  console.log("Weekly data:", weeklyData);
  //----------------------------------------------------
  return weeklyData;
}

async function renderWeeklyChart() {
  const weeklyData = await getWeeklyData();
  //----------------------DEBUG-------------------------
  console.log("Data for chart:", weeklyData);
  //----------------------------------------------------

  const ctx = document.getElementById("weeklyChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: weeklyData.map((d) => new Date(d.date).toLocaleDateString()),
      datasets: [
        {
          label: "Pomodoros Completed",
          data: weeklyData.map((d) => d.pomodoroCount),
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
        {
          label: "Focus Time (minutes)",
          data: weeklyData.map((d) => d.totalFocusTime),
          backgroundColor: "rgba(153, 102, 255, 0.2)",
          borderColor: "rgba(153, 102, 255, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

async function updateSummaryStats() {
  const stats = await getAllTimeStats();
  document.getElementById("totalPomodoros").textContent = stats.pomodoroCount;
  document.getElementById("totalFocusHours").textContent = Math.round(
    stats.totalFocusTime / 3600
  );
  document.getElementById("totalFocusMinutes").textContent = Math.round(
    (stats.totalFocusTime % 3600) / 60
  );
}

async function init() {
  console.log("Initializing...");
  await checkStorageContents();
  console.log("Storage contents checked");
  await renderWeeklyChart();
  console.log("Chart rendered");
  await updateSummaryStats();
  console.log("Summary stats updated");
}

init().catch((error) => console.error("Initialization error:", error));
