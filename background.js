// Tab Spotlight - Background Service Worker

console.log('[Tab Spotlight] Background service worker started');

// Listen for keyboard shortcut command - this triggers the spotlight search
chrome.commands.onCommand.addListener((command) => {
  console.log('[Tab Spotlight] Command received:', command);
  if (command === 'toggle-spotlight') {
    toggleSpotlight();
  }
});

// Note: Toolbar icon click opens popup.html (settings) via default_popup in manifest
// No action.onClicked listener needed when default_popup is set

async function toggleSpotlight() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) {
      console.error('[Tab Spotlight] No active tab found');
      return;
    }

    console.log('[Tab Spotlight] Active tab:', tab.id, tab.url);

    // Check if we can inject into this tab (not chrome://, edge://, etc.)
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') ||
      tab.url.startsWith('chrome-extension://') || tab.url.startsWith('about:')) {
      console.warn('[Tab Spotlight] Cannot inject into special page:', tab.url);
      return;
    }

    // Try to send message first
    try {
      await chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
      console.log('[Tab Spotlight] Message sent successfully');
    } catch (error) {
      // Content script might not be loaded yet, inject it
      console.log('[Tab Spotlight] Content script not ready, injecting...', error.message);

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

      // Wait a bit for script to initialize then send message
      setTimeout(async () => {
        try {
          await chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
          console.log('[Tab Spotlight] Message sent after injection');
        } catch (e) {
          console.error('[Tab Spotlight] Failed to send message after injection:', e);
        }
      }, 100);
    }
  } catch (error) {
    console.error('[Tab Spotlight] Error in toggleSpotlight:', error);
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Tab Spotlight] Message received:', request.action);

  if (request.action === 'getTabs') {
    // Get all tabs from all windows
    chrome.tabs.query({}, (tabs) => {
      const tabsData = tabs.map(tab => ({
        id: tab.id,
        windowId: tab.windowId,
        title: tab.title || 'Untitled',
        url: tab.url || '',
        favIconUrl: tab.favIconUrl || '',
        active: tab.active
      }));
      console.log('[Tab Spotlight] Returning', tabsData.length, 'tabs');
      sendResponse({ tabs: tabsData });
    });
    return true;
  }

  if (request.action === 'switchToTab') {
    const { tabId, windowId } = request;
    console.log('[Tab Spotlight] Switching to tab:', tabId, 'window:', windowId);
    chrome.windows.update(windowId, { focused: true }, () => {
      chrome.tabs.update(tabId, { active: true });
    });
    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'closeTab') {
    console.log('[Tab Spotlight] Closing tab:', request.tabId);
    chrome.tabs.remove(request.tabId, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});
