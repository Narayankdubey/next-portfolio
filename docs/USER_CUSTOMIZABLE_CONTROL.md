# User Customizable Settings Control

The feature flags system includes a **meta-control** that lets you (the developer) decide which options appear in the user-facing settings panel.

## 📋 Configuration

In `src/config/featureFlags.json`, the `userCustomizable` section is a simple array structure:

```json
{
  "sections": {
    "hero": true,
    "about": true,
    "skills": false
    // ... other sections
  },
  "features": {
    "chatbot": true,
    "terminal": true,
    "toastNotifications": true
    // ... other features
  },
  "userCustomizable": {
    "sections": ["hero", "about", "projects", "experience"],
    "features": ["chatbot", "floatingTerminal", "musicPlayer", "particleCursor"]
  }
}
```

## 🎯 How It Works

### Simple Rule

**If a feature/section name is in the `userCustomizable` array:**

- ✅ Checkbox appears in Settings modal
- ✅ Users can toggle it on/off
- ✅ Value comes from the main `sections` or `features` config

**If a feature/section name is NOT in the array:**

- ❌ Checkbox is **hidden** from Settings modal
- ❌ Users cannot change it
- ✅ Feature still works based on main config value
- ✅ Only developers can control it via JSON

### Example

**Configuration:**

```json
{
  "features": {
    "chatbot": true, // ON by default
    "toastNotifications": true, // ON by default
    "konamiCode": true // ON by default
  },
  "userCustomizable": {
    "features": [
      "chatbot" // Only chatbot is customizable
      // toastNotifications NOT in array = hidden
      // konamiCode NOT in array = hidden
    ]
  }
}
```

**Result:**

- ✅ Users see only "AI Chatbot" checkbox in settings
- ❌ "Notifications" and "Konami Code" checkboxes are hidden
- ✅ All three features work (they're enabled in main config)
- ✅ Users can only toggle chatbot on/off

## 💡 Common Use Cases

### 1. Hide Easter Eggs (Keep Surprises!)

```json
{
  "userCustomizable": {
    "features": [
      "chatbot",
      "floatingTerminal",
      "musicPlayer"
      // achievementSystem - NOT included = hidden
      // konamiCode - NOT included = hidden
      // clickCounter - NOT included = hidden
    ]
  }
}
```

Easter eggs work but don't appear in settings!

### 2. Lock Core Features (Always Enabled)

```json
{
  "sections": {
    "hero": true,
    "about": true,
    "contact": true
  },
  "userCustomizable": {
    "sections": [
      // hero NOT included = always shown, can't disable
      "about",
      "skills",
      "projects"
      // contact NOT included = always shown, can't disable
    ]
  }
}
```

Landing and contact pages are always visible.

### 3. Minimal Settings Panel

```json
{
  "userCustomizable": {
    "features": ["chatbot", "floatingTerminal", "musicPlayer"]
  }
}
```

Clean, simple 3-option settings panel!

### 4. No Customization (Developer Control Only)

```json
{
  "userCustomizable": {
    "sections": [],
    "features": []
  }
}
```

Settings modal tabs will be empty - all control in developer's hands.

### 5. Full Customization (Default)

```json
{
  "userCustomizable": {
    "sections": ["hero", "about", "skills", "projects", "experience", "testimonials", "contact"],
    "features": [
      "floatingTerminal",
      "chatbot",
      "commandPalette",
      "searchModal",
      "musicPlayer",
      "themeCustomizer",
      "achievementSystem",
      "konamiCode",
      "particleCursor",
      "clickCounter",
      "interactiveBackground",
      "githubHeatmap",
      "techVisualizer",
      "skillRadar",
      "mobilePreview"
    ]
  }
}
```

All options available - maximum user control.

## ⚙️ Implementation Details

### Array Format

- Just list feature/section **names** (strings)
- Order doesn't matter
- Values (enabled/disabled) come from main config
- Arrays can be empty

### Filtering Logic

```tsx
// In FeatureFlagsSettings.tsx
Object.entries(flags.features)
  .filter(([key]) => flags.userCustomizable.features.includes(key))
  .map(([key, value]) => (
    // Render checkbox with value from flags.features[key]
  ))
```

### TypeScript Types

```tsx
interface FeatureFlags {
  sections: { hero: boolean; about: boolean /* ... */ };
  features: { chatbot: boolean; terminal: boolean /* ... */ };
  userCustomizable: {
    sections: string[]; // Array of section names
    features: string[]; // Array of feature names
  };
}
```

## 🎨 Quick Reference

| Want to...                   | Do this...                                              |
| ---------------------------- | ------------------------------------------------------- |
| Let users toggle a feature   | Add it to `userCustomizable.features` array             |
| Hide a feature from settings | Remove it from `userCustomizable.features` array        |
| Lock a feature as always-on  | Enable in main config, exclude from `userCustomizable`  |
| Lock a feature as always-off | Disable in main config, exclude from `userCustomizable` |
| Simple settings panel        | Include only 3-5 features in array                      |
| No user customization        | Set arrays to `[]`                                      |
| Full user control            | Include all features/sections in arrays                 |

## 🔧 Best Practices

1. **Start Simple**: Include only the most important features
2. **Easter Eggs**: Never include in `userCustomizable`
3. **Core Features**: Exclude critical sections (hero, contact)
4. **User Testing**: Get feedback on which features should be customizable
5. **Documentation**: Update if you change what's customizable

## ✨ Benefits of Array Approach

- ✅ **Simple**: Just list names, not true/false for each
- ✅ **Clean**: Less duplication in JSON
- ✅ **Flexible**: Easy to add/remove items
- ✅ **Single Source**: Values come from main config
- ✅ **Type-Safe**: TypeScript ensures valid names

---

**Remember**: This is developer-only configuration. Users see only what's in these arrays!
