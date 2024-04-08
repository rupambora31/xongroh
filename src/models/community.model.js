import mongoose, { Schema } from "mongoose";

// Schema for Community Post
const communityPostSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Schema for Topic
const topicSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    posts: [communityPostSchema], // Array of community posts
  },
  { timestamps: true }
);

// Schema for Community
const communitySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User", 
      },
    ],

    topics: [topicSchema], // Array of topics
  },
  { timestamps: true }
);

const CommunityPost = mongoose.model("CommunityPost", communityPostSchema);
const Topic = mongoose.model("Topic", topicSchema);
const Community = mongoose.model("Community", communitySchema);

module.exports = { CommunityPost, Topic, Community };
