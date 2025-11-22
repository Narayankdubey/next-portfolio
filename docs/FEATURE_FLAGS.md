# Feature Flags System

This portfolio application includes a comprehensive feature flags system that allows you to control which sections and features are visible.

## 📋 Configuration File

All feature flags are controlled through a single JSON file:

```
src/config/featureFlags.json
```

## 🎯 How to Use

### Basic Usage

1. **Open the configuration file**: `src/config/featureFlags.json`
2. **Toggle features**: Change any value from `true` to `false` (or vice versa)
3. **Save the file**: Changes take effect immediately in development mode

### Example

To hide the chatbot feature:

```json
{
  "features": {
    "chatbot": false // Changed from true to false
  }
}
```

## 📊 Available Flags

### Sections

Control entire page sections:

- **`hero`** - Landing/Hero section with animated typing effects
- **`about`** - About me section with profile information
- **`skills`** - Skills showcase section
- **`projects`** - Projects portfolio section
- **`experience`** - Professional experience timeline
- **`testimonials`** - Client testimonials carousel
- **`contact`** - Contact form and information

### Features

Control individual features and interactive elements:

#### Core Features

- **`floatingTerminal`** - Interactive terminal window
- **`chatbot`** - AI chatbot assistant
- **`commandPalette`** - Keyboard shortcut command menu (Cmd/Ctrl + K)
- **`searchModal`** - Global search functionality

#### Interactive Elements

- **`musicPlayer`** - Background music player
- **`themeCustomizer`** - Theme and color customization panel
- **`achievementSystem`** - Easter egg achievements system
- **`konamiCode`** - Konami code easter egg (↑↑↓↓←→←→BA)
- **`particleCursor`** - Animated particle cursor effect
- **`clickCounter`** - Click tracking easter egg

#### Visual Features

- **`toastNotifications`** - Toast notification system
- **`interactiveBackground`** - 3D particle background
- **`githubHeatmap`** - GitHub-style contribution heatmap
- **`techVisualizer`** - Technology stack visualizer
- **`skillRadar`** - Skills radar chart
- **`mobilePreview`** - Mobile app preview modal

### Development Mode

- **`showFeatureToggles`** - Show the feature flags debugger panel
- **`enableDebugLogs`** - Enable console debug logging

## 🛠️ Development Tools

### Feature Flags Debugger

When `devMode.showFeatureToggles` is enabled, a purple settings button appears in the bottom-left corner. Click it to see:

- All active/inactive sections
- All active/inactive features
- Real-time status of each flag
- Quick reference to the config file location

To enable:

```json
{
  "devMode": {
    "showFeatureToggles": true
  }
}
```

## 💻 Programmatic Access

### Using the Hook

```tsx
import { useFeatureFlags } from "@/context/FeatureFlagsContext";

function MyComponent() {
  const flags = useFeatureFlags();

  if (!flags.features.chatbot) {
    return null; // Don't render if feature is disabled
  }

  return <Chatbot />;
}
```

### Convenience Hooks

```tsx
import { useIsFeatureEnabled, useIsSectionEnabled } from "@/context/FeatureFlagsContext";

function MyComponent() {
  const isChatbotEnabled = useIsFeatureEnabled("chatbot");
  const isAboutEnabled = useIsSectionEnabled("about");

  // Use the flags...
}
```

## 🎨 Common Use Cases

### 1. Disable All Easter Eggs

```json
{
  "features": {
    "achievementSystem": false,
    "konamiCode": false,
    "clickCounter": false
  }
}
```

### 2. Minimal Portfolio (Only Core Sections)

```json
{
  "sections": {
    "hero": true,
    "about": true,
    "skills": true,
    "projects": true,
    "experience": false,
    "testimonials": false,
    "contact": true
  }
}
```

## ⚡ Performance Tips

- Disable heavy features like `interactiveBackground` on lower-end devices
- Turn off `particleCursor` if you notice performance issues
- Disable `achievementSystem` if you don't need tracking

## 🚀 Production Deployment

Before deploying, set these in `featureFlags.json`:

```json
{
  "devMode": {
    "showFeatureToggles": false,
    "enableDebugLogs": false
  }
}
```

---

**Files**:

- Config: `src/config/featureFlags.json`
- Context: `src/context/FeatureFlagsContext.tsx`
- Usage: `src/app/page.tsx`
