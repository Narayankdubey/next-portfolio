import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAdminUser extends Document {
  username: string;
  password?: string; // Optional because we might not select it by default
  email: string;
  role: string;
  lastViewedComments: Date;
  lastViewedChat: Date;
  lastViewedJourneys: Date;
  createdAt: Date;
}

const AdminUserSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  role: {
    type: String,
    default: "admin",
    enum: ["admin", "superadmin"],
  },
  lastViewedComments: {
    type: Date,
    default: () => new Date(0), // Default to epoch: all comments created after this will be seen as "new"
  },
  lastViewedChat: {
    type: Date,
    default: () => new Date(0),
  },
  lastViewedJourneys: {
    type: Date,
    default: () => new Date(0),
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const AdminUser: Model<IAdminUser> =
  mongoose.models.AdminUser || mongoose.model<IAdminUser>("AdminUser", AdminUserSchema);

export default AdminUser;
