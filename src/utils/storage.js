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