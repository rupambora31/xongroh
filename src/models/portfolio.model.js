import mongoose, { Schema } from "mongoose";

const portfolioSchema = new Schema(
  {
    contentUrl: {
      type: String, //cloudinary url
    },
    content: { type: String, required: true },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isDraft: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const Portfolio = mongoose.model("Portfolio", portfolioSchema);
