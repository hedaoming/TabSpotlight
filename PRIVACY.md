# Privacy Policy for Tab Spotlight

**Last Updated: January 14, 2026**

## Overview

Tab Spotlight is a browser extension designed to help users quickly search and switch between their Chrome tabs. We are committed to protecting your privacy.

## Data Collection & Privacy

**Tab Spotlight is 100% local. All data stays on your device.**

- ✅ All processing happens locally in your browser
- ✅ No data is ever transmitted to external servers
- ✅ No analytics, tracking, or cookies
- ✅ No personal information is collected or stored
- ✅ Open source and fully auditable

## How It Works

Tab Spotlight operates **entirely within your browser**:
- It reads your open tabs only when you activate the search overlay
- All searching and filtering happens locally in real-time
- Tab data is used only for display and is never persisted or transmitted

## Permissions Explained

This extension uses a minimal permission set. Here's exactly what each permission does:

| Permission | Why It's Needed |
|------------|-----------------|
| `tabs` | To read the list of your open tabs (title, URL, favicon) for searching |
| `activeTab` | To inject the search overlay **only** when you press the keyboard shortcut |
| `storage` | To save your theme preference (light/dark/auto) locally in Chrome |
| `scripting` | To inject the search overlay UI when triggered by the user |

> **Note**: We use `activeTab` instead of broad host permissions. This means the extension can only interact with a tab when you **explicitly invoke it** via keyboard shortcut. This is the most privacy-respecting permission model available.

## Third-Party Services

Tab Spotlight does **not** use any third-party services, APIs, or analytics tools.

## Data Storage

The only data stored is your theme preference (light, dark, or auto mode), which is saved locally in Chrome's sync storage and never transmitted externally.

## Changes to This Policy

If we make any changes to this privacy policy, we will update the "Last Updated" date above.

## Contact

If you have any questions about this privacy policy, please open an issue on our GitHub repository.

---

**Summary: Tab Spotlight is 100% local. We don't collect any data. Your privacy is fully protected.**
