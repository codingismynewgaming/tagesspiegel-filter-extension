/**
 * Background script for Tagesspiegel Filter extension
 * Handles icon badge updates and statistical tracking
 */

let extensionEnabled = true;
let autoSortComments = true;

// Load extension status on startup
browser.storage.sync.get({ extensionEnabled: true, autoSortComments: true }).then((result) => {
  extensionEnabled = result.extensionEnabled !== false;
  autoSortComments = result.autoSortComments !== false;
  console.log('Tagesspiegel Filter extension enabled:', extensionEnabled);
  console.log('Tagesspiegel Filter auto-sort comments enabled:', autoSortComments);
});

// Listen for extension status changes
browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync') {
    if (changes.extensionEnabled) {
      extensionEnabled = changes.extensionEnabled.newValue !== false;
      console.log('Tagesspiegel Filter extension enabled:', extensionEnabled);
    }
    if (changes.autoSortComments) {
      autoSortComments = changes.autoSortComments.newValue !== false;
      console.log('Tagesspiegel Filter auto-sort comments changed:', autoSortComments);
      
      // Notify content scripts about the change
      browser.tabs.query({ url: 'https://www.tagesspiegel.de/*' }, (tabs) => {
        tabs.forEach((tab) => {
          browser.tabs.sendMessage(tab.id, {
            type: 'AUTO_SORT_SETTING_CHANGED',
            enabled: autoSortComments
          }).catch(() => {}); // Ignore if content script not ready
        });
      });
    }
  }
});

// Listener for messages from content scripts
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'UPDATE_BADGE') {
    const count = message.count;
    const tabId = sender.tab.id;

    // Only update badge if extension is enabled
    if (extensionEnabled) {
      browser.action.setBadgeText({
        text: count > 0 ? count.toString() : '',
        tabId: tabId
      });

      // Set badge background color
      browser.action.setBadgeBackgroundColor({
        color: '#00426A', // Tagesspiegel blue
        tabId: tabId
      });
    } else {
      // Clear badge when extension is disabled
      browser.action.setBadgeText({
        text: '',
        tabId: tabId
      });
    }
  }

  if (message.type === 'EXTENSION_STATUS_CHANGED') {
    extensionEnabled = message.enabled;
    console.log('Extension status changed:', extensionEnabled);
  }

  if (message.type === 'CORAL_AUTO_SORT_RESULT') {
    if (message.status === 'success') {
      console.log('Coral auto-sort applied:', message.detail);
    }
    if (message.status === 'failed' && sender.tab && sender.tab.id) {
      browser.tabs.sendMessage(sender.tab.id, {
        type: 'CORAL_AUTO_SORT_FAILED',
        reason: message.detail || null
      }).catch(() => {});
    }
  }

  // Always return true for asynchronous responses if needed
  return true;
});

// Log initialization
console.log('Tagesspiegel Filter background script initialized.');
