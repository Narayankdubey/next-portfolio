/* eslint-disable */
const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "src");
const componentsDir = path.join(srcDir, "components");

const componentMap = {
  // UI Elements
  "ClickCounter.tsx": "ui",
  "MultiSelect.tsx": "ui",
  "ScrollProgress.tsx": "ui",
  "SectionDivider.tsx": "ui",
  "SkeletonLoader.tsx": "ui",
  "TiltCard.tsx": "ui",
  "ToggleSwitch.tsx": "ui",
  "ToggleSwitch.module.css": "ui",

  // Layout
  "AppBar.tsx": "layout",
  "ClientProviders.tsx": "layout",
  "MobileWarning.tsx": "layout",
  "Navbar.tsx": "layout",

  // Sections
  "About.tsx": "sections",
  "CertificatesSection.tsx": "sections",
  "Contact.tsx": "sections",
  "Experience.tsx": "sections",
  "Hero.tsx": "sections",
  "Landing.tsx": "sections",
  "Projects.tsx": "sections",
  "Skills.tsx": "sections",

  // Features - Blog
  "BlogCard.tsx": "features/blog",
  "BlogCard.module.css": "features/blog",
  "BlogForm.tsx": "features/blog",
  "BlogForm.module.css": "features/blog",
  "BlogWidget.tsx": "features/blog",
  "BlogWidget.module.css": "features/blog",
  "EmptyBlogState.tsx": "features/blog",
  "EmptyBlogState.module.css": "features/blog",

  // Features - Chat
  "Chatbot.tsx": "features/chat",
  "ChatInterface.tsx": "features/chat",

  // Features - Terminal
  "FloatingTerminal.tsx": "features/terminal",
  "Terminal.tsx": "features/terminal",

  // Features - Settings
  "FeatureFlagsDebugger.tsx": "features/settings",
  "FeatureFlagsSettings.tsx": "features/settings",
  "ThemeCustomizer.tsx": "features/settings",

  // Modals
  "DraggableModal.tsx": "modals",
  "SearchModal.tsx": "modals",
  "WelcomeModal.tsx": "modals",

  // Widgets
  "CommandPalette.tsx": "widgets",
  "ExperienceTimeline.tsx": "widgets",
  "GithubHeatmap.tsx": "widgets",
  "ImageViewer.tsx": "widgets",
  "KeyboardShortcuts.tsx": "widgets",
  "MobilePreview.tsx": "widgets",
  "MusicPlayer.tsx": "widgets",
  "OnboardingTour.tsx": "widgets",
  "OnboardingTour.module.css": "widgets",
  "QuickActions.tsx": "widgets",
  "SkillRadar.tsx": "widgets",
  "TestimonialCarousel.tsx": "widgets",
  "VisitorCounter.tsx": "widgets",

  // Effects
  "AchievementSystem.tsx": "effects",
  "GlitchText.tsx": "effects",
  "InteractiveBackground.tsx": "effects",
  "KonamiCode.tsx": "effects",
  "ParticleCursor.tsx": "effects",
  "TechMarquee.tsx": "effects",
  "TechVisualizer.tsx": "effects",
};

// 1. Create missing directories
const categories = new Set(Object.values(componentMap));
categories.forEach((category) => {
  const dirPath = path.join(componentsDir, category);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Helper to get all files in src
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allFiles = getAllFiles(srcDir);

// 2. Update imports in all files
allFiles.forEach((file) => {
  if (!file.endsWith(".ts") && !file.endsWith(".tsx")) return;

  let content = fs.readFileSync(file, "utf8");
  let hasChanges = false;

  for (const [componentFile, category] of Object.entries(componentMap)) {
    if (componentFile.endsWith(".css")) continue; // skip updating CSS module imports as they stay relative

    const componentName = componentFile.replace(".tsx", "");

    // Match variants:
    // "@/components/Component"
    // "./Component"
    // "../components/Component"

    // This regex ensures we only match the actual import path string and replace it.
    const regex = new RegExp(
      `(['"])(@/components/|\\./|\\.\\./components/)${componentName}(['"])`,
      "g"
    );

    content = content.replace(regex, (match, p1, p2, p3) => {
      hasChanges = true;
      // Upgrade relative to absolute for safety, or update existing absolute.
      return `${p1}@/components/${category}/${componentName}${p3}`;
    });
  }

  if (hasChanges) {
    fs.writeFileSync(file, content);
    console.log(`Updated imports in ${file}`);
  }
});

// 3. Move files
for (const [file, category] of Object.entries(componentMap)) {
  const sourcePath = path.join(componentsDir, file);
  const destPath = path.join(componentsDir, category, file);

  if (fs.existsSync(sourcePath)) {
    fs.renameSync(sourcePath, destPath);
    console.log(`Moved ${file} to ${category}/`);
  } else {
    console.log(`Warning: ${file} not found at ${sourcePath}`);
  }
}

console.log("Restructuring complete!");
