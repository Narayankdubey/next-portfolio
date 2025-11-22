import mongoose, { Schema, Document } from "mongoose";

export interface IVisitLog extends Document {
  userId: string;
  visitTime: Date;
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

const VisitLogSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  visitTime: {
    type: Date,
    required: true,
    default: Date.now,
    index: true,
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

// Index for querying visits by user and time
VisitLogSchema.index({ userId: 1, visitTime: -1 });

export default mongoose.models.VisitLog || mongoose.model<IVisitLog>("VisitLog", VisitLogSchema);
