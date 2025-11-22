import mongoose, { Schema, Model } from "mongoose";

export interface IContact {
  name: string;
  email: string;
  message: string;
  status: "pending" | "read" | "replied";
  createdAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    name: {
      type: String,
      required: [true, "Please provide your name"],
      trim: true,
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    message: {
      type: String,
      required: [true, "Please provide a message"],
      trim: true,
      maxlength: [1000, "Message cannot be more than 1000 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "read", "replied"],
      default: "pending",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Prevent model recompilation during hot reloads in development
const Contact: Model<IContact> =
  mongoose.models.Contact || mongoose.model<IContact>("Contact", ContactSchema);

export default Contact;
