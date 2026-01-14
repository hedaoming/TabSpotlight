// Tab Spotlight - Background Service Worker

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason !== 'install') {
    return;
  }

  try {
    const commands = await chrome.commands.getAll();
    const toggleCommand = commands.find((command) => command.name === 'toggle-spotlight');

    if (!toggleCommand || toggleCommand.shortcut) {
      return;
    }

    const platformInfo = await chrome.runtime.getPlatformInfo();
    const shortcut = platformInfo.os === 'mac' ? 'Command+Shift+S' : 'Ctrl+Shift+S';

    await chrome.commands.update({ name: 'toggle-spotlight', shortcut });
  } catch (error) {
    console.warn('[Tab Spotlight] Unable to set default shortcut:', error);
  }
});

// Listen for keyboard shortcut command - this triggers the spotlight search
chrome.commands.onCommand.addListener((command) => {

  if (command === 'toggle-spotlight') {
    toggleSpotlight();
  }
});

// Note: Toolbar icon click opens popup.html (settings) via default_popup in manifest
// No action.onClicked listener needed when default_popup is set

async function toggleSpotlight() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url) {
      console.error('[Tab Spotlight] No active tab found');
      return;
    }

    // Check if we can inject into this tab (not chrome://, edge://, etc.)
    const restrictedPrefixes = ['chrome://', 'chrome-extension://', 'edge://', 'about:', 'https://chrome.google.com/webstore'];
    if (restrictedPrefixes.some(prefix => tab.url.startsWith(prefix))) {
      console.warn('[Tab Spotlight] Cannot inject into restricted page:', tab.url);
      return;
    }

    // Ensure tab is focused
    await chrome.windows.update(tab.windowId, { focused: true });
    await chrome.tabs.update(tab.id, { active: true });

    // Try to toggle existing overlay first
    try {
      await chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
    } catch {
      // Content script not loaded - inject dynamically using activeTab permission
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

      // Wait for script to initialize, then toggle
      await new Promise(resolve => setTimeout(resolve, 50));
      await chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
    }
  } catch (error) {
    console.error('[Tab Spotlight] Error in toggleSpotlight:', error);
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {


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

      sendResponse({ tabs: tabsData });
    });
    return true;
  }

  if (request.action === 'switchToTab') {
    const { tabId, windowId } = request;

    chrome.windows.update(windowId, { focused: true }, () => {
      chrome.tabs.update(tabId, { active: true });
    });
    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'closeTab') {

    chrome.tabs.remove(request.tabId, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});
