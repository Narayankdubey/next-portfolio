import mongoose, { Schema, Document } from "mongoose";

export interface IChatMessage extends Document {
  userId: string;
  message: string;
  response: string;
  timestamp: Date;
}

const ChatMessageSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  message: {
    type: String,
    required: true,
  },
  response: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true,
  },
});

// Compound index for efficient queries
ChatMessageSchema.index({ userId: 1, timestamp: 1 });

export default mongoose.models.ChatMessage ||
  mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema, "chatmessages");
