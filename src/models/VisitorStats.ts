import mongoose, { Schema, Document } from "mongoose";

export interface IVisitorStats extends Document {
  userId: string;
  visitCount: number;
  lastVisit: Date;
  firstVisit: Date;
  browser?: string;
  os?: string;
  device?: string;
  screenResolution?: string;
  timezone?: string;
  language?: string;
  referrer?: string;
  userAgent?: string;
  latitude?: number;
  longitude?: number;
}

const VisitorStatsSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  visitCount: {
    type: Number,
    required: true,
    default: 1,
  },
  lastVisit: {
    type: Date,
    required: true,
    default: Date.now,
  },
  firstVisit: {
    type: Date,
    required: true,
    default: Date.now,
  },
  browser: {
    type: String,
    required: false,
  },
  os: {
    type: String,
    required: false,
  },
  device: {
    type: String,
    required: false,
  },
  screenResolution: {
    type: String,
    required: false,
  },
  timezone: {
    type: String,
    required: false,
  },
  language: {
    type: String,
    required: false,
  },
  referrer: {
    type: String,
    required: false,
  },
  userAgent: {
    type: String,
    required: false,
  },
  latitude: {
    type: Number,
    required: false,
  },
  longitude: {
    type: Number,
    required: false,
  },
});

export default mongoose.models.VisitorStats ||
  mongoose.model<IVisitorStats>("VisitorStats", VisitorStatsSchema);
