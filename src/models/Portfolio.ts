import mongoose, { Schema, Model } from "mongoose";

// TypeScript interfaces
export interface IPersonal {
  name: string;
  title: string;
  tagline: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  profileImage: string;
}

export interface ISocial {
  github: string;
  linkedin: string;
  email: string;
}

export interface IAbout {
  bio: string[];
}

export interface ISkills {
  frontend: string[];
  backend: string[];
  tools: string[];
  other: string[];
}

export interface IExperience {
  company: string;
  role: string;
  period: string;
  type: string;
  description: string[];
  color: string;
}

export interface IProject {
  title: string;
  description: string;
  tags: string[];
  github: string;
  demo: string;
  color: string;
  playStoreUrl?: string;
  appStoreUrl?: string;
}

export interface IEducation {
  degree: string;
  institution: string;
  location: string;
  period: string;
  gpa?: string;
}

export interface IPlaylistItem {
  title: string;
  artist: string;
  duration: string;
}

export interface ITestimonial {
  id: number;
  name: string;
  role: string;
  text: string;
  avatar: string;
}

export interface IAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface IPortfolio {
  personal: IPersonal;
  social: ISocial;
  about: IAbout;
  skills: ISkills;
  experience: IExperience[];
  projects: IProject[];
  education: IEducation[];
  awards: string[];
  hobbies: string[];
  playlist: IPlaylistItem[];
  testimonials: ITestimonial[];
  achievements: IAchievement[];
  resumeUrl?: string;
  updatedAt?: Date;
}

// Mongoose schemas
const PersonalSchema = new Schema(
  {
    name: { type: String, required: true },
    title: { type: String, required: true },
    tagline: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    location: { type: String, required: true },
    website: { type: String, required: true },
    profileImage: { type: String, required: true },
  },
  { _id: false }
);

const SocialSchema = new Schema(
  {
    github: { type: String, required: true },
    linkedin: { type: String, required: true },
    email: { type: String, required: true },
  },
  { _id: false }
);

const AboutSchema = new Schema(
  {
    bio: { type: [String], required: true },
  },
  { _id: false }
);

const SkillsSchema = new Schema(
  {
    frontend: { type: [String], required: true },
    backend: { type: [String], required: true },
    tools: { type: [String], required: true },
    other: { type: [String], required: true },
  },
  { _id: false }
);

const ExperienceSchema = new Schema(
  {
    company: { type: String, required: true },
    role: { type: String, required: true },
    period: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: [String], required: true },
    color: { type: String, required: true },
  },
  { _id: false }
);

const ProjectSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    tags: { type: [String], required: true },
    github: { type: String, required: true },
    demo: { type: String, required: true },
    color: { type: String, required: true },
    playStoreUrl: { type: String },
    appStoreUrl: { type: String },
  },
  { _id: false }
);

const EducationSchema = new Schema(
  {
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    location: { type: String, required: true },
    period: { type: String, required: true },
    gpa: { type: String },
  },
  { _id: false }
);

const PlaylistItemSchema = new Schema(
  {
    title: { type: String, required: true },
    artist: { type: String, required: true },
    duration: { type: String, required: true },
  },
  { _id: false }
);

const TestimonialSchema = new Schema(
  {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    text: { type: String, required: true },
    avatar: { type: String, required: true },
  },
  { _id: false }
);

const AchievementSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    unlocked: { type: Boolean, default: false },
  },
  { _id: false }
);

// Main Portfolio schema
const PortfolioSchema = new Schema<IPortfolio>(
  {
    personal: { type: PersonalSchema, required: true },
    social: { type: SocialSchema, required: true },
    about: { type: AboutSchema, required: true },
    skills: { type: SkillsSchema, required: true },
    experience: { type: [ExperienceSchema], required: true },
    projects: { type: [ProjectSchema], required: true },
    education: { type: [EducationSchema], required: true },
    awards: { type: [String], required: true },
    hobbies: { type: [String], required: true },
    playlist: { type: [PlaylistItemSchema], required: true },
    testimonials: { type: [TestimonialSchema], required: true },
    achievements: { type: [AchievementSchema], required: true },
    resumeUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation during hot reloads
const Portfolio: Model<IPortfolio> =
  mongoose.models.Portfolio || mongoose.model<IPortfolio>("Portfolio", PortfolioSchema);

export default Portfolio;
