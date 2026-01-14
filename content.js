// Tab Spotlight - Content Script

(function () {
  'use strict';

  let isOpen = false;
  let shadowRoot = null;
  let hostElement = null;
  let allTabs = [];
  let filteredTabs = [];
  let selectedIndex = 0;
  let userThemeSetting = 'auto'; // 'auto', 'light', 'dark'

  // Detect system theme preference
  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  // Get effective theme based on user setting
  function getEffectiveTheme() {
    if (userThemeSetting === 'auto') {
      return systemPrefersDark() ? 'dark' : 'light';
    }
    return userThemeSetting;
  }

  // Load theme setting from storage
  async function loadThemeSetting() {
    try {
      const result = await chrome.storage.sync.get({ theme: 'auto' });
      userThemeSetting = result.theme;
    } catch (e) {

      userThemeSetting = 'auto';
    }
  }

  // Update overlay theme
  function updateOverlayTheme() {
    if (shadowRoot) {
      const overlay = shadowRoot.getElementById('overlay');
      if (overlay) {
        overlay.classList.remove('dark', 'light');
        overlay.classList.add(getEffectiveTheme());
      }
    }
  }

  // Create and inject the Shadow DOM container
  function createOverlay() {
    if (hostElement) return;

    hostElement = document.createElement('div');
    hostElement.id = 'tab-spotlight-host';
    shadowRoot = hostElement.attachShadow({ mode: 'closed' });

    const themeClass = getEffectiveTheme();
    shadowRoot.innerHTML = `
      <style>${getStyles()}</style>
      <div class="overlay ${themeClass}" id="overlay">
        <div class="spotlight-container">
          <div class="search-box">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="11" cy="11" r="7"></circle>
              <path d="M21 21l-4.35-4.35"></path>
            </svg>
            <input type="text" id="search-input" placeholder="Search tabs..." autocomplete="off" spellcheck="false" autofocus>
            <span class="shortcut-hint">esc</span>
          </div>
          <div class="results-container" id="results-container">
            <div class="results-list" id="results-list"></div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(hostElement);

    // Listen for system theme changes (only relevant when user setting is 'auto')
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (userThemeSetting === 'auto') {
        updateOverlayTheme();
      }
    });

    // Auto-close overlay when tab hidden (user switches tabs)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && isOpen) {
        closeOverlay();
      }
    });
  }

  function getStyles() {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      .overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding-top: 12vh;
        z-index: 2147483647;
        opacity: 0;
        visibility: hidden;
        transition: opacity 100ms ease-out, visibility 100ms ease-out;
      }

      /* Light theme (default - like macOS Spotlight) */
      .overlay.light {
        background: rgba(0, 0, 0, 0.15);
      }

      .overlay.light .spotlight-container {
        background: rgba(255, 255, 255, 0.92);
        box-shadow: 
          0 30px 60px -15px rgba(0, 0, 0, 0.25),
          0 0 0 0.5px rgba(0, 0, 0, 0.1),
          0 0 1px rgba(0, 0, 0, 0.1);
      }

      .overlay.light .search-box {
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      }

      .overlay.light .search-icon {
        color: rgba(0, 0, 0, 0.4);
      }

      .overlay.light #search-input {
        color: #1d1d1f;
      }

      .overlay.light #search-input::placeholder {
        color: rgba(0, 0, 0, 0.35);
      }

      .overlay.light .shortcut-hint {
        color: rgba(0, 0, 0, 0.35);
        background: rgba(0, 0, 0, 0.06);
      }

      .overlay.light .results-container::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.15);
      }

      .overlay.light .result-item:hover {
        background: rgba(0, 0, 0, 0.04);
      }

      .overlay.light .result-item.selected {
        background: #007AFF;
      }

      .overlay.light .result-item.selected .tab-title,
      .overlay.light .result-item.selected .tab-url,
      .overlay.light .result-item.selected .window-badge {
        color: #fff;
      }

      .overlay.light .favicon {
        background: rgba(0, 0, 0, 0.05);
      }

      .overlay.light .favicon-placeholder {
        background: rgba(0, 0, 0, 0.05);
        color: rgba(0, 0, 0, 0.4);
      }

      .overlay.light .tab-title {
        color: #1d1d1f;
      }

      .overlay.light .tab-url {
        color: rgba(0, 0, 0, 0.5);
      }

      .overlay.light .window-badge {
        color: rgba(0, 0, 0, 0.4);
        background: rgba(0, 0, 0, 0.06);
      }

      .overlay.light .highlight {
        background: rgba(255, 204, 0, 0.4);
        color: inherit;
      }

      .overlay.light .result-item.selected .highlight {
        background: rgba(255, 255, 255, 0.3);
        color: #fff;
      }

      .overlay.light .empty-state {
        color: rgba(0, 0, 0, 0.4);
      }

      /* Dark theme */
      .overlay.dark {
        background: rgba(0, 0, 0, 0.4);
      }

      .overlay.dark .spotlight-container {
        background: rgba(40, 40, 40, 0.95);
        box-shadow: 
          0 30px 60px -15px rgba(0, 0, 0, 0.5),
          0 0 0 0.5px rgba(255, 255, 255, 0.1),
          inset 0 0 0 0.5px rgba(255, 255, 255, 0.05);
      }

      .overlay.dark .search-box {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .overlay.dark .search-icon {
        color: rgba(255, 255, 255, 0.5);
      }

      .overlay.dark #search-input {
        color: #fff;
      }

      .overlay.dark #search-input::placeholder {
        color: rgba(255, 255, 255, 0.4);
      }

      .overlay.dark .shortcut-hint {
        color: rgba(255, 255, 255, 0.3);
        background: rgba(255, 255, 255, 0.1);
      }

      .overlay.dark .results-container::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
      }

      .overlay.dark .result-item:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      .overlay.dark .result-item.selected {
        background: #0A84FF;
      }

      .overlay.dark .result-item.selected .tab-title,
      .overlay.dark .result-item.selected .tab-url,
      .overlay.dark .result-item.selected .window-badge {
        color: #fff;
      }

      .overlay.dark .favicon {
        background: rgba(255, 255, 255, 0.1);
      }

      .overlay.dark .favicon-placeholder {
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.5);
      }

      .overlay.dark .tab-title {
        color: #fff;
      }

      .overlay.dark .tab-url {
        color: rgba(255, 255, 255, 0.5);
      }

      .overlay.dark .window-badge {
        color: rgba(255, 255, 255, 0.4);
        background: rgba(255, 255, 255, 0.1);
      }

      .overlay.dark .highlight {
        background: rgba(255, 214, 0, 0.35);
        color: #fff;
      }

      .overlay.dark .result-item.selected .highlight {
        background: rgba(255, 255, 255, 0.25);
        color: #fff;
      }

      .overlay.dark .empty-state {
        color: rgba(255, 255, 255, 0.4);
      }

      .overlay.active {
        opacity: 1;
        visibility: visible;
      }

      .spotlight-container {
        width: 680px;
        max-height: 520px;
        border-radius: 16px;
        backdrop-filter: blur(50px) saturate(180%);
        -webkit-backdrop-filter: blur(50px) saturate(180%);
        overflow: hidden;
        transform: scale(0.97) translateY(-8px);
        transition: transform 100ms ease-out;
      }

      .overlay.active .spotlight-container {
        transform: scale(1) translateY(0);
      }

      .search-box {
        display: flex;
        align-items: center;
        padding: 0 20px;
        height: 54px;
        gap: 14px;
      }

      .search-icon {
        width: 22px;
        height: 22px;
        flex-shrink: 0;
      }

      #search-input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        font-size: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
        font-weight: 400;
        letter-spacing: -0.02em;
        caret-color: #007AFF;
      }

      .shortcut-hint {
        font-size: 11px;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
        font-weight: 500;
        padding: 4px 8px;
        border-radius: 5px;
        flex-shrink: 0;
        text-transform: uppercase;
        letter-spacing: 0.02em;
      }

      .results-container {
        max-height: 440px;
        overflow-y: auto;
        overscroll-behavior: contain;
      }

      .results-container::-webkit-scrollbar {
        width: 8px;
      }

      .results-container::-webkit-scrollbar-track {
        background: transparent;
      }

      .results-container::-webkit-scrollbar-thumb {
        border-radius: 4px;
      }

      .results-list {
        padding: 6px 8px 8px;
      }

      .result-item {
        display: flex;
        align-items: center;
        padding: 10px 12px;
        cursor: pointer;
        gap: 12px;
        border-radius: 10px;
        transition: background 60ms ease;
      }

      .favicon {
        width: 24px;
        height: 24px;
        border-radius: 5px;
        flex-shrink: 0;
        object-fit: contain;
      }

      .favicon-placeholder {
        width: 24px;
        height: 24px;
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        flex-shrink: 0;
      }

      .tab-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .tab-title {
        font-size: 14px;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        letter-spacing: -0.01em;
      }

      .tab-url {
        font-size: 12px;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
        font-weight: 400;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .window-badge {
        font-size: 11px;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
        font-weight: 500;
        padding: 3px 8px;
        border-radius: 5px;
        flex-shrink: 0;
      }

      .highlight {
        border-radius: 3px;
        padding: 0 1px;
      }

      .empty-state {
        padding: 40px 20px;
        text-align: center;
        font-size: 14px;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
      }

      .active-indicator {
        width: 7px;
        height: 7px;
        background: #34C759;
        border-radius: 50%;
        flex-shrink: 0;
        box-shadow: 0 0 0 2px rgba(52, 199, 89, 0.2);
      }
    `;
  }

  // Fuzzy search implementation
  function fuzzyMatch(text, query) {
    if (!query) return { matched: true, score: 0, ranges: [] };

    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const ranges = [];

    // Exact substring match
    const exactIndex = lowerText.indexOf(lowerQuery);
    if (exactIndex !== -1) {
      ranges.push([exactIndex, exactIndex + query.length]);
      return { matched: true, score: 100 + (1 / (exactIndex + 1)), ranges };
    }

    // Word boundary match
    const words = lowerText.split(/[\s\-_./]+/);
    let wordStart = 0;
    for (const word of words) {
      if (word.startsWith(lowerQuery)) {
        ranges.push([wordStart, wordStart + query.length]);
        return { matched: true, score: 80, ranges };
      }
      wordStart += word.length + 1;
    }

    // Character sequence match (fuzzy)
    let queryIndex = 0;
    let lastMatchIndex = -1;
    const matchRanges = [];

    for (let i = 0; i < lowerText.length && queryIndex < lowerQuery.length; i++) {
      if (lowerText[i] === lowerQuery[queryIndex]) {
        if (lastMatchIndex === i - 1 && matchRanges.length > 0) {
          matchRanges[matchRanges.length - 1][1] = i + 1;
        } else {
          matchRanges.push([i, i + 1]);
        }
        lastMatchIndex = i;
        queryIndex++;
      }
    }

    if (queryIndex === lowerQuery.length) {
      return { matched: true, score: 50 - matchRanges.length, ranges: matchRanges };
    }

    return { matched: false, score: 0, ranges: [] };
  }

  function searchTabs(query) {
    if (!query.trim()) {
      filteredTabs = allTabs.map(tab => ({ ...tab, titleRanges: [], urlRanges: [] }));
      return;
    }

    const results = [];

    for (const tab of allTabs) {
      const titleMatch = fuzzyMatch(tab.title, query);
      const urlMatch = fuzzyMatch(tab.url, query);

      if (titleMatch.matched || urlMatch.matched) {
        results.push({
          ...tab,
          score: Math.max(titleMatch.score * 1.5, urlMatch.score), // Title matches weighted higher
          titleRanges: titleMatch.ranges,
          urlRanges: urlMatch.ranges
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    filteredTabs = results;
  }

  function highlightText(text, ranges) {
    if (!ranges || ranges.length === 0) return escapeHtml(text);

    let result = '';
    let lastIndex = 0;

    for (const [start, end] of ranges) {
      result += escapeHtml(text.slice(lastIndex, start));
      result += `<span class="highlight">${escapeHtml(text.slice(start, end))}</span>`;
      lastIndex = end;
    }
    result += escapeHtml(text.slice(lastIndex));

    return result;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function getDomain(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  function renderResults() {
    const list = shadowRoot.getElementById('results-list');

    if (filteredTabs.length === 0) {
      list.innerHTML = '<div class="empty-state">No matching tabs found</div>';
      return;
    }

    // Get unique window IDs to determine if we need window badges
    const windowIds = [...new Set(allTabs.map(t => t.windowId))];
    const showWindowBadge = windowIds.length > 1;

    list.innerHTML = filteredTabs.map((tab, index) => `
      <div class="result-item ${index === selectedIndex ? 'selected' : ''}" data-index="${index}" data-tab-id="${tab.id}" data-window-id="${tab.windowId}">
        ${tab.favIconUrl ?
        `<img class="favicon" src="${escapeHtml(tab.favIconUrl)}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="favicon-placeholder" style="display:none">🌐</div>` :
        `<div class="favicon-placeholder">🌐</div>`
      }
        <div class="tab-info">
          <div class="tab-title">${highlightText(tab.title, tab.titleRanges)}</div>
          <div class="tab-url">${highlightText(getDomain(tab.url), tab.urlRanges)}</div>
        </div>
        ${tab.active ? '<div class="active-indicator" title="Current tab"></div>' : ''}
        ${showWindowBadge ? `<div class="window-badge">Win ${windowIds.indexOf(tab.windowId) + 1}</div>` : ''}
      </div>
    `).join('');

    // Scroll selected item into view
    const selectedItem = list.querySelector('.selected');
    if (selectedItem) {
      selectedItem.scrollIntoView({ block: 'nearest' });
    }
  }

  function openOverlay() {
    if (isOpen) return;

    createOverlay();
    isOpen = true;
    selectedIndex = 0;

    // Update theme class in case system theme changed
    const overlay = shadowRoot.getElementById('overlay');
    overlay.classList.remove('dark', 'light');
    overlay.classList.add(getEffectiveTheme());

    // Fetch tabs from background script
    chrome.runtime.sendMessage({ action: 'getTabs' }, (response) => {
      if (response && response.tabs) {
        allTabs = response.tabs;
        filteredTabs = allTabs.map(tab => ({ ...tab, titleRanges: [], urlRanges: [] }));
        renderResults();
      }
    });

    const input = shadowRoot.getElementById('search-input');

    const focusSearchInput = () => {
      if (!document.hasFocus()) {
        window.focus();
      }

      input.focus({ preventScroll: true });
      input.select();
    };

    // Trigger animation and focus with multiple attempts for reliability
    requestAnimationFrame(() => {
      overlay.classList.add('active');
      input.value = '';
      focusSearchInput();

      // Double-ensure focus after a short delay
      setTimeout(() => {
        focusSearchInput();
      }, 50);
    });

    // Add event listeners
    input.addEventListener('input', handleInput);
    overlay.addEventListener('click', handleOverlayClick);
    document.addEventListener('keydown', handleKeydown, true);
  }

  function closeOverlay() {
    if (!isOpen) return;

    const overlay = shadowRoot.getElementById('overlay');
    overlay.classList.remove('active');

    // Clean up after animation
    setTimeout(() => {
      isOpen = false;
      document.removeEventListener('keydown', handleKeydown, true);

      const input = shadowRoot.getElementById('search-input');
      input.removeEventListener('input', handleInput);
      overlay.removeEventListener('click', handleOverlayClick);
    }, 100);
  }

  function handleInput(e) {
    const query = e.target.value;
    searchTabs(query);
    selectedIndex = 0;
    renderResults();
  }

  function handleOverlayClick(e) {
    if (e.target.id === 'overlay') {
      closeOverlay();
      return;
    }

    const resultItem = e.target.closest('.result-item');
    if (resultItem) {
      const tabId = parseInt(resultItem.dataset.tabId, 10);
      const windowId = parseInt(resultItem.dataset.windowId, 10);
      switchToTab(tabId, windowId);
    }
  }

  function handleKeydown(e) {
    if (!isOpen) return;

    // Prevent all keyboard events from bubbling to the page
    // This stops websites like GitHub from capturing keys (s, c, etc.)
    e.stopPropagation();

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        closeOverlay();
        break;

      case 'ArrowDown':
        e.preventDefault();
        e.stopPropagation();
        if (filteredTabs.length > 0) {
          selectedIndex = (selectedIndex + 1) % filteredTabs.length;
          renderResults();
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        e.stopPropagation();
        if (filteredTabs.length > 0) {
          selectedIndex = (selectedIndex - 1 + filteredTabs.length) % filteredTabs.length;
          renderResults();
        }
        break;

      case 'Enter':
        e.preventDefault();
        e.stopPropagation();
        if (filteredTabs.length > 0 && filteredTabs[selectedIndex]) {
          const tab = filteredTabs[selectedIndex];
          switchToTab(tab.id, tab.windowId);
        }
        break;

      case 'w':
        // Cmd/Ctrl + W to close selected tab
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault();
          e.stopPropagation();
          if (filteredTabs.length > 0 && filteredTabs[selectedIndex]) {
            closeSelectedTab();
          }
        }
        break;
    }
  }

  function switchToTab(tabId, windowId) {
    chrome.runtime.sendMessage({ action: 'switchToTab', tabId, windowId }, () => {
      closeOverlay();
    });
  }

  function closeSelectedTab() {
    const tab = filteredTabs[selectedIndex];
    if (!tab) return;

    chrome.runtime.sendMessage({ action: 'closeTab', tabId: tab.id }, () => {
      // Remove from arrays and re-render
      allTabs = allTabs.filter(t => t.id !== tab.id);
      filteredTabs = filteredTabs.filter(t => t.id !== tab.id);

      if (selectedIndex >= filteredTabs.length) {
        selectedIndex = Math.max(0, filteredTabs.length - 1);
      }

      renderResults();
    });
  }

  // Listen for messages from background script and popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {


    if (request.action === 'toggle') {
      if (isOpen) {
        closeOverlay();
      } else {
        // Load latest theme setting before opening
        loadThemeSetting().then(() => {
          openOverlay();
        });
      }
      sendResponse({ success: true });
    }

    if (request.action === 'themeChanged') {
      userThemeSetting = request.theme;
      updateOverlayTheme();
      sendResponse({ success: true });
    }

    return true;
  });

  // Load theme setting on script initialization
  loadThemeSetting();



})();
