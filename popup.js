// Tab Spotlight - Popup Settings Script

document.addEventListener('DOMContentLoaded', async () => {
    // Load saved settings
    const settings = await chrome.storage.sync.get({
        theme: 'auto' // default to auto
    });

    // Set active theme
    setActiveTheme(settings.theme);

    // Theme option click handlers
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', async () => {
            const theme = option.dataset.theme;
            setActiveTheme(theme);

            await chrome.storage.sync.set({ theme });
            showSavedIndicator();

            // Notify any open content scripts about the theme change
            const tabs = await chrome.tabs.query({});
            for (const tab of tabs) {
                try {
                    chrome.tabs.sendMessage(tab.id, { action: 'themeChanged', theme });
                } catch (e) {
                    // Ignore errors for tabs where content script isn't loaded
                }
            }
        });
    });

    // Configure shortcut button
    document.getElementById('configure-shortcut').addEventListener('click', () => {
        // Open Chrome's extension shortcuts page
        chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
    });

    // Update shortcut display based on platform
    updateShortcutDisplay();
});

function setActiveTheme(theme) {
    document.querySelectorAll('.theme-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.theme === theme);
    });
}

function showSavedIndicator() {
    const indicator = document.getElementById('saved-indicator');
    indicator.classList.add('show');
    setTimeout(() => {
        indicator.classList.remove('show');
    }, 1500);
}

function updateShortcutDisplay() {
    const display = document.getElementById('shortcut-display');
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

    if (isMac) {
        display.innerHTML = `
      <span class="key">⌘</span>
      <span class="key">⇧</span>
      <span class="key">K</span>
    `;
    } else {
        display.innerHTML = `
      <span class="key">Ctrl</span>
      <span class="key">Shift</span>
      <span class="key">K</span>
    `;
    }
}
