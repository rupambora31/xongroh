import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const postSchema = new Schema(
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

postSchema.plugin(mongooseAggregatePaginate);

export const Post = mongoose.model("Post", postSchema);
