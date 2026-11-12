// Tagesspiegel Filter - Coral iframe auto-sort bridge (content script)
// Communicates between extension storage and MAIN world script.

(function () {
  'use strict';

  if (!/\/embed\/stream/.test(location.pathname)) {
    return;
  }

  const CHANNEL = 'TS_CORAL_AUTO_SORT';
  const CONFIG = {
    enabledDefault: true
  };

  let autoSortEnabled = CONFIG.enabledDefault;
  let mainReady = false;

  const postToMain = (type, payload) => {
    try {
      window.postMessage({ channel: CHANNEL, type, ...payload }, '*');
    } catch (error) {
      // Ignore postMessage errors.
    }
  };

  const sendState = () => {
    if (!mainReady) {
      return;
    }
    postToMain('STATE', { enabled: autoSortEnabled });
  };

  const handleMainMessage = (event) => {
    if (event.source !== window) {
      return;
    }
    const data = event.data;
    if (!data || data.channel !== CHANNEL) {
      return;
    }
    if (data.type === 'READY') {
      mainReady = true;
      sendState();
      return;
    }
    if (data.type === 'RESULT') {
      chrome.runtime.sendMessage({
        type: 'CORAL_AUTO_SORT_RESULT',
        status: data.status,
        detail: data.detail || null
      }).catch(() => {});
    }
  };

  window.addEventListener('message', handleMainMessage);

  const loadSettings = async () => {
    try {
      const result = await chrome.storage.sync.get({ autoSortComments: CONFIG.enabledDefault });
      autoSortEnabled = result.autoSortComments !== false;
    } catch (error) {
      autoSortEnabled = CONFIG.enabledDefault;
    }
  };

  const init = async () => {
    await loadSettings();
    sendState();

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'sync' || !changes.autoSortComments) {
        return;
      }
      autoSortEnabled = changes.autoSortComments.newValue !== false;
      sendState();
    });
  };

  init().catch(() => {});
})();
