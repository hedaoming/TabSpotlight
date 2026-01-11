# Tab Spotlight

[Read in 中文](README_zh.md)

**Tab Spotlight** is a Spotlight-like tab switcher for Chrome. Designed for keyboard-first usage to quickly access your tabs.

## Features
- 🚀 **Quick Switch**: Find and switch tabs fast, just like macOS Spotlight.
- ⌨️ **Keyboard First**: Completely usable without a mouse.
- 🔍 **Smart Search**: Supports searching by title and URL.

## Shortcuts
- **Mac**: `Command` + `Shift` + `S`
- **Windows/Linux**: `Ctrl` + `Shift` + `S`

## Installation (Developer Mode)
1. Download the code to your local machine.
2. Open Chrome and go to the Extensions management page: `chrome://extensions/`.
3. Enable **"Developer mode"** in the top right corner.
4. Click **"Load unpacked"**.
5. Select the folder containing this project.

## Release & Packaging
This project includes an automated packaging script `release.sh` to generate the `.zip` file required for publishing.

### How to use the release script
The script automatically cleans old build packages and zips everything except development files (like `.git`, `release.sh`, `README.md`, etc.) into `TabSpotlight.zip`.

#### Steps:
1. Open Terminal.
2. Navigate to the project root directory:
   ```bash
   cd /path/to/TabSpotlight
   ```
3. Run the script:
   ```bash
   ./release.sh
   ```
   *Note: If you encounter permission issues, run `chmod +x release.sh` first.*

4. After execution, `TabSpotlight.zip` will be generated in the current directory, ready for upload to the Chrome Web Store.
