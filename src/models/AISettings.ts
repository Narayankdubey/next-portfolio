import mongoose from "mongoose";

const AISettingsSchema = new mongoose.Schema(
  {
    systemPrompt: {
      type: String,
      default: "",
    },
    customKnowledge: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.AISettings || mongoose.model("AISettings", AISettingsSchema);
