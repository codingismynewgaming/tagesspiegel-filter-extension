/**
 * Background script for Tagesspiegel Filter extension
 * Handles icon badge updates and statistical tracking
 */

// Listener for messages from content scripts
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'UPDATE_BADGE') {
    const count = message.count;
    const tabId = sender.tab.id;
    
    // Update badge for the current tab
    browser.action.setBadgeText({
      text: count > 0 ? count.toString() : '',
      tabId: tabId
    });
    
    // Set badge background color
    browser.action.setBadgeBackgroundColor({
      color: '#00426A', // Tagesspiegel blue
      tabId: tabId
    });
  }
  
  // Always return true for asynchronous responses if needed
  return true;
});

// Log initialization
console.log('Tagesspiegel Filter background script initialized.');
