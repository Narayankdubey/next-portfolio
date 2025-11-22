import mongoose, { Schema, Document } from "mongoose";

export interface IContactMessage extends Document {
  name: string;
  email: string;
  message: string;
  status: "pending" | "read" | "replied";
  createdAt: Date;
}

const ContactMessageSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "read", "replied"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.ContactMessage ||
  mongoose.model<IContactMessage>("ContactMessage", ContactMessageSchema);
