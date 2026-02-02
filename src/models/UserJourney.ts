import mongoose, { Schema, Model, Document } from "mongoose";

export interface ISectionImpression {
  interactionId?: string;
  sectionId: string;
  viewedAt: Date;
  duration: number; // milliseconds
  scrollDepth: number; // percentage 0-100
  interactions: number;
}

export interface IDeviceInfo {
  type: "mobile" | "tablet" | "desktop";
  os: string;
  browser: string;
}

export interface ILocationInfo {
  country?: string;
  city?: string;
  ip?: string;
}

export interface IAction {
  type: string;
  target: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface IUserJourney extends Document {
  sessionId: string;
  visitorId: string;
  landingPage: string;
  referrer?: string;
  userAgent: string;
  device: IDeviceInfo;
  location?: ILocationInfo;
  startTime: Date;
  endTime?: Date;
  totalDuration?: number; // milliseconds
  events: ISectionImpression[];
  actions: IAction[];
  createdAt: Date;
  updatedAt: Date;
}

const SectionImpressionSchema = new Schema<ISectionImpression>(
  {
    interactionId: { type: String, required: false },
    sectionId: {
      type: String,
      required: true,
      enum: [
        "hero",
        "about",
        "skills",
        "projects",
        "experience",
        "testimonials",
        "contact",
        "blog",
        "blog-listing",
        "blog-detail",
      ],
    },
    viewedAt: { type: Date, required: true, default: Date.now },
    duration: { type: Number, default: 0 },
    scrollDepth: { type: Number, default: 0, min: 0, max: 100 },
    interactions: { type: Number, default: 0 },
  },
  { _id: false }
);

const DeviceInfoSchema = new Schema<IDeviceInfo>(
  {
    type: {
      type: String,
      enum: ["mobile", "tablet", "desktop"],
      required: true,
    },
    os: { type: String, required: true },
    browser: { type: String, required: true },
  },
  { _id: false }
);

const LocationInfoSchema = new Schema<ILocationInfo>(
  {
    country: String,
    city: String,
    ip: String,
  },
  { _id: false }
);

const ActionSchema = new Schema<IAction>(
  {
    type: { type: String, required: true }, // e.g., 'click', 'navigation'
    target: { type: String, required: true }, // e.g., 'navbar-home'
    timestamp: { type: Date, default: Date.now },
    metadata: { type: Map, of: Schema.Types.Mixed },
  },
  { _id: false }
);

const UserJourneySchema = new Schema<IUserJourney>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    visitorId: {
      type: String,
      required: true,
      index: true,
    },
    landingPage: {
      type: String,
      required: true,
    },
    referrer: String,
    userAgent: {
      type: String,
      required: true,
    },
    device: {
      type: DeviceInfoSchema,
      required: true,
    },
    location: LocationInfoSchema,
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    endTime: Date,
    totalDuration: Number,
    events: [SectionImpressionSchema],
    actions: [ActionSchema],
  },
  {
    timestamps: true,
  }
);

// Index for querying recent journeys
UserJourneySchema.index({ startTime: -1 });
UserJourneySchema.index({ visitorId: 1, startTime: -1 });

// Delete cached model to ensure schema updates
if (mongoose.models.UserJourney) {
  delete mongoose.models.UserJourney;
}

const UserJourney: Model<IUserJourney> = mongoose.model<IUserJourney>(
  "UserJourney",
  UserJourneySchema
);

export default UserJourney;
