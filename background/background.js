/**
 * Background script for Tagesspiegel Filter extension
 * Handles icon badge updates and statistical tracking
 */

let extensionEnabled = true;

// Load extension status on startup
browser.storage.sync.get({ extensionEnabled: true }).then((result) => {
  extensionEnabled = result.extensionEnabled !== false;
  console.log('Tagesspiegel Filter extension enabled:', extensionEnabled);
});

// Listen for extension status changes
browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.extensionEnabled) {
    extensionEnabled = changes.extensionEnabled.newValue !== false;
    console.log('Tagesspiegel Filter extension enabled:', extensionEnabled);
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

  // Always return true for asynchronous responses if needed
  return true;
});

// Log initialization
console.log('Tagesspiegel Filter background script initialized.');
