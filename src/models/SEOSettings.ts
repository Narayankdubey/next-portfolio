import mongoose, { Schema, Document } from "mongoose";

export interface ISEOSettings extends Document {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterHandle: string;
  updatedAt: Date;
}

const SEOSettingsSchema: Schema = new Schema(
  {
    title: {
      type: String,
      default: "Narayan Dubey | Full Stack Developer",
    },
    description: {
      type: String,
      default:
        "Portfolio of Narayan Dubey, a Full Stack Developer specializing in React, Node.js, and Cloud Technologies.",
    },
    keywords: {
      type: String,
      default:
        "Narayan Dubey, Full Stack Developer, React, Node.js, Next.js, Web Developer, Portfolio",
    },
    ogTitle: {
      type: String,
      default: "Narayan Dubey | Full Stack Developer",
    },
    ogDescription: {
      type: String,
      default:
        "Portfolio of Narayan Dubey, a Full Stack Developer specializing in React, Node.js, and Cloud Technologies.",
    },
    ogImage: {
      type: String,
      default: "", // Empty string means fallback to a default image in layout if needed
    },
    twitterHandle: {
      type: String,
      default: "@narayandubey",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.SEOSettings ||
  mongoose.model<ISEOSettings>("SEOSettings", SEOSettingsSchema);
