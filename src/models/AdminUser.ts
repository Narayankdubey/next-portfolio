import mongoose, { Schema, Document } from "mongoose";

export interface IAdminUser extends Document {
  username: string;
  password?: string; // Optional because we might not select it by default
  email: string;
  role: string;
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.AdminUser ||
  mongoose.model<IAdminUser>("AdminUser", AdminUserSchema);
