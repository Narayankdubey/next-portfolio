import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBlogPost extends Document {
  title: string;
  description: string; // Short description for listings
  content: string; // Full rich HTML content
  type: "internal" | "external";
  externalUrl?: string; // required if type is external
  thumbnailUrl?: string; // optional thumbnail image URL
  isVisible: boolean; // Admin toggle to hide/show blog
  likeCount: number; // Number of likes
  viewCount: number; // Number of views
  slug: string; // URL-friendly identifier
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ["internal", "external"], required: true },
    externalUrl: { type: String },
    thumbnailUrl: { type: String },
    isVisible: { type: Boolean, default: true },
    likeCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    slug: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

// Ensure externalUrl is present when type is external
BlogPostSchema.pre("validate", function (next) {
  if (this.type === "external" && !this.externalUrl) {
    next(new Error("externalUrl is required for external blog posts"));
  } else {
    next();
  }
});

// Generate slug from title if not present
BlogPostSchema.pre("validate", function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
  next();
});

// Delete cached model to ensure schema updates are applied
if (mongoose.models.BlogPost) {
  delete mongoose.models.BlogPost;
}

const BlogPost: Model<IBlogPost> = mongoose.model<IBlogPost>("BlogPost", BlogPostSchema);

export default BlogPost;
