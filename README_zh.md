# Tab Spotlight

[English](README.md)

**Tab Spotlight** 是一个类似 macOS Spotlight 的 Chrome 标签页切换工具。键盘优先，快速查找和切换标签页。

![Tab Spotlight Banner](img/promo_banner.png)

## ✨ 功能特点

- 🚀 **即时搜索** – 通过标题或 URL 模糊匹配快速找到任意标签页
- ⌨️ **键盘优先** – 专为速度设计，无需鼠标操作
- 🎨 **精美界面** – 简洁优雅的设计，自动适配系统主题
- 🌗 **明暗模式** – 自动跟随系统偏好设置

## 📸 截图预览

### 浅色模式
![搜索界面](img/Search.png)

### 搜索高亮
![搜索结果](img/SearchResult.png)

### 深色模式
![深色模式](img/SearchResultDark.png)

## ⌨️ 快捷键

| 操作 | Mac | Windows/Linux |
|------|-----|---------------|
| 打开 Tab Spotlight | `⌘` + `Shift` + `S` | `Ctrl` + `Shift` + `S` |
| 上下导航 | `↑` / `↓` | `↑` / `↓` |
| 切换到选中标签 | `Enter` | `Enter` |
| 关闭搜索框 | `Esc` | `Esc` |
| 关闭选中标签 | `⌘` + `W` | `Ctrl` + `W` |

## 📦 安装方式

### 从 Chrome 应用商店安装
*（即将上线）*

### 开发者模式安装
1. 下载或克隆本仓库
2. 打开 Chrome，进入 `chrome://extensions/`
3. 开启右上角的 **「开发者模式」**
4. 点击 **「加载已解压的扩展程序」**
5. 选择本项目所在文件夹

## 🚀 发布与打包

本项目包含自动化打包脚本，用于生成 Chrome Web Store 发布所需的 `.zip` 文件。

```bash
# 进入项目目录
cd /path/to/TabSpotlight

# 运行打包脚本
./release.sh
```

> **注意**：如果遇到权限问题，请先运行 `chmod +x release.sh`

脚本会生成 `TabSpotlight.zip`，可直接上传至 Chrome Web Store。

## 🔒 隐私声明

Tab Spotlight 完全在本地运行。**不收集、不上传任何用户数据。**

👉 [查看完整隐私政策](PRIVACY.md)

## 📄 开源协议

MIT License
