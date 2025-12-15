import mongoose, { Document, Model, Schema } from "mongoose";

export interface IComment extends Document {
  blogId: mongoose.Types.ObjectId;
  content: string;
  userId?: string;
  authorName?: string;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    blogId: { type: Schema.Types.ObjectId, ref: "BlogPost", required: true },
    content: { type: String, required: true, maxlength: 1000 },
    userId: { type: String },
    authorName: { type: String },
    isVisible: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Delete cached model to ensure schema updates are applied
if (mongoose.models.Comment) {
  delete mongoose.models.Comment;
}

const Comment: Model<IComment> = mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;
