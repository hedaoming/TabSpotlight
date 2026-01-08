# Tab Spotlight

**Tab Spotlight** 是一个类似 Spotlight 的 Chrome 标签页切换工具。键盘优先，快速访问你的标签页。

## 功能特点
- 🚀 **快速切换**：像 macOS Spotlight 一样快速查找和切换标签页。
- ⌨️ **键盘优先**：完全无需鼠标即可操作。
- 🔍 **智能搜索**：支持标题和 URL 搜索。

## 快捷键
- **Mac**: `Command` + `Shift` + `S`
- **Windows/Linux**: `Ctrl` + `Shift` + `S`

## 安装说明 (开发者模式)
1. 下载代码到本地。
2. 打开 Chrome 浏览器，进入扩展程序管理页面：`chrome://extensions/`。
3. 开启右上角的 **"开发者模式" (Developer mode)**。
4. 点击 **"加载已解压的扩展程序" (Load unpacked)**。
5. 选择本项目所在的文件夹。

## 发布与打包
本项目包含一个自动化打包脚本 `release.sh`，用于生成发布所需的 `.zip` 文件。

### 如何使用 release 脚本
该脚本会自动清理旧的构建包，并将除开发文件（如 `.git`, `release.sh`, `README.md` 等）以外的内容打包成 `TabSpotlight.zip`。

#### 步骤：
1. 打开终端 (Terminal)。
2. 进入项目根目录：
   ```bash
   cd /path/to/TabSpotlight
   ```
3. 运行打包脚本：
   ```bash
   ./release.sh
   ```
   *注意：如果遇到权限不足的问题，请先添加执行权限：`chmod +x release.sh`*

4. 脚本执行完毕后，会在当前目录下生成 `TabSpotlight.zip` 文件，可直接用于上传至 Chrome Web Store。

### 脚本说明
`release.sh` 主要执行以下操作：
- 删除旧的 `TabSpotlight.zip`（如果存在）。
- 使用 `zip` 命令打包当前目录下的所有文件。
- 自动排除以下非发布必需文件：
  - `.git` 目录
  - `.DS_Store` 系统文件
  - `release.sh` 脚本本身
  - `README.md` 文档

