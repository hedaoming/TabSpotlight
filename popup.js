// Tab Spotlight - Options Page Script

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
