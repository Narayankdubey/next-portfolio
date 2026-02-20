import mongoose, { Schema, Model } from "mongoose";

export interface ISections {
  hero: boolean;
  about: boolean;
  skills: boolean;
  projects: boolean;
  experience: boolean;
  testimonials: boolean;
  certificates: boolean;
  contact: boolean;
}

export interface IFeatures {
  floatingTerminal: boolean;
  chatbot: boolean;
  commandPalette: boolean;
  searchModal: boolean;
  musicPlayer: boolean;
  themeCustomizer: boolean;
  achievementSystem: boolean;
  konamiCode: boolean;
  particleCursor: boolean;
  clickCounter: boolean;
  toastNotifications: boolean;
  interactiveBackground: boolean;
  githubHeatmap: boolean;
  techVisualizer: boolean;
  skillRadar: boolean;
  mobilePreview: boolean;
  quickActions: boolean;
  blog: boolean;
  techMarquee: boolean;
  openToWork: boolean; // Display "Open to Work" badge in Hero
}

export interface IUserCustomizable {
  sections: string[];
  features: string[];
}

export interface IDevMode {
  showFeatureToggles: boolean;
  enableDebugLogs: boolean;
}

export interface IFeatureFlags {
  sections: ISections;
  features: IFeatures;
  userCustomizable: IUserCustomizable;
  devMode: IDevMode;
  updatedAt?: Date;
}

const SectionsSchema = new Schema(
  {
    hero: { type: Boolean, default: true },
    about: { type: Boolean, default: true },
    skills: { type: Boolean, default: true },
    projects: { type: Boolean, default: true },
    experience: { type: Boolean, default: true },
    testimonials: { type: Boolean, default: true },
    certificates: { type: Boolean, default: true },
    contact: { type: Boolean, default: true },
  },
  { _id: false }
);

const FeaturesSchema = new Schema(
  {
    floatingTerminal: { type: Boolean, default: true },
    chatbot: { type: Boolean, default: true },
    commandPalette: { type: Boolean, default: true },
    searchModal: { type: Boolean, default: true },
    musicPlayer: { type: Boolean, default: true },
    themeCustomizer: { type: Boolean, default: true },
    achievementSystem: { type: Boolean, default: true },
    konamiCode: { type: Boolean, default: true },
    particleCursor: { type: Boolean, default: true },
    clickCounter: { type: Boolean, default: true },
    toastNotifications: { type: Boolean, default: true },
    interactiveBackground: { type: Boolean, default: true },
    githubHeatmap: { type: Boolean, default: true },
    techVisualizer: { type: Boolean, default: true },
    skillRadar: { type: Boolean, default: true },
    mobilePreview: { type: Boolean, default: true },
    quickActions: { type: Boolean, default: true },
    blog: { type: Boolean, default: true },
    techMarquee: { type: Boolean, default: true },
    openToWork: { type: Boolean, default: true },
  },
  { _id: false }
);

const UserCustomizableSchema = new Schema(
  {
    sections: { type: [String], default: [] },
    features: { type: [String], default: [] },
  },
  { _id: false }
);

const DevModeSchema = new Schema(
  {
    showFeatureToggles: { type: Boolean, default: true },
    enableDebugLogs: { type: Boolean, default: false },
  },
  { _id: false }
);

const FeatureFlagsSchema = new Schema<IFeatureFlags>(
  {
    sections: { type: SectionsSchema, required: true },
    features: { type: FeaturesSchema, required: true },
    userCustomizable: { type: UserCustomizableSchema, required: true },
    devMode: { type: DevModeSchema, required: true },
  },
  {
    timestamps: true,
  }
);

// Delete cached model to ensure schema updates are applied
if (mongoose.models.FeatureFlags) {
  delete mongoose.models.FeatureFlags;
}

const FeatureFlags: Model<IFeatureFlags> = mongoose.model<IFeatureFlags>(
  "FeatureFlags",
  FeatureFlagsSchema
);

export default FeatureFlags;
