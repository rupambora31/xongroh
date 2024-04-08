import mongoose, { Schema } from "mongoose";

const supportSchema = new Schema(
  {
    supporter: {
      type: Schema.Types.ObjectId, // one who is supporting the "user"
      ref: "User",
    },
    supporting: {
      type: Schema.Types.ObjectId, // one to whom 'user' is supporting
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Support = mongoose.model("Support", supportSchema);
