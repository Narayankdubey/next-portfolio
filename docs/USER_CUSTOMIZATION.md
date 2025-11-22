# Feature Flags - User Customization Guide

Your portfolio now has a **Settings panel** where you can customize what features and sections you want to see!

## 🎨 How to Access Settings

1. **Look for the Settings icon** on the right side of the screen (purple gear icon in the AppBar)
2. **Click the Settings icon** to open the customization panel
3. **Toggle features on/off** using checkboxes
4. **Your preferences are automatically saved** to your browser

## 📱 What You Can Customize

### Sections Tab

Turn entire page sections on or off:

- ✨ Hero / Landing Page
- 👤 About Me
- 💻 Skills Showcase
- 🚀 Projects Portfolio
- 📈 Experience Timeline
- 💬 Testimonials
- 📧 Contact Section

### Features Tab

Enable or disable interactive features:

- 🖥️ **Terminal** - Interactive command-line interface
- 🤖 **AI Chatbot** - Virtual assistant
- ⌨️ **Command Palette** - Keyboard shortcuts (⌘K)
- 🔍 **Search** - Global search functionality
- 🎵 **Music Player** - Background music
- 🎨 **Theme Customizer** - Color & theme settings
- 🏆 **Achievements** - Hidden achievements (easter eggs)
- 🎮 **Konami Code** - Secret easter egg (↑↑↓↓←→←→BA)
- ✨ **Particle Cursor** - Animated cursor effects
- 👆 **Click Counter** - Click tracking
- 🔔 **Notifications** - Toast messages
- 🌌 **3D Background** - Animated particle background
- 📊 **GitHub Heatmap** - Contribution calendar
- 🔧 **Tech Visualizer** - Technology stack viewer
- 📡 **Skills Radar** - Radar chart
- 📱 **Mobile Preview** - Mobile app showcase

## 💡 Features

### Auto-Save

Your preferences are **automatically saved** to your browser's localStorage. When you return, your choices will be remembered!

### Reset to Defaults

Click the "Reset to Defaults" button in the settings panel to restore all features to their original state.

### Real-Time Updates

Changes take effect **immediately** - no page refresh needed!

## 🎯 Example Scenarios

### Minimal Experience

Want a clean, simple portfolio?

- Turn off all easter eggs (Achievements, Konami Code, Click Counter)
- Disable Particle Cursor and 3D Background
- Keep only core sections (Hero, About, Skills, Projects, Contact)

### Interactive Demo Mode

Showcase all features:

- Enable everything to show off all the cool interactions
- Great for impressing visitors!

### Performance Mode

On a slower device?

- Disable 3D Background
- Turn off Particle Cursor
- Keep Achievements and other lightweight features

## 🔒 Privacy

All settings are stored **locally in your browser** using localStorage. Nothing is sent to any server. Your customization is private and stays on your device.

## 🛠️ Developer Mode

For developers, there's also a debug panel that shows all feature flags. Enable it by setting `showFeatureToggles: true` in `src/config/featureFlags.json`.

---

**Enjoy customizing your experience!** ✨
