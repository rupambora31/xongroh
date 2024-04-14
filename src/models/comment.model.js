import mongoose, { Schema } from "mongoose";

// Define Feedback Schema
const feedbackSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  replies: [
    {
      type: Schema.Types.ObjectId,
      ref: "FeedbackReply",
    },
  ],
});

// Define FeedbackReply Schema
const feedbackReplySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  feedback: {
    type: Schema.Types.ObjectId,
    ref: "Feedback",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

// Define Comment Schema
const commentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, // User who made the comment
  post: {
    type: Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  }, // Post to which the comment is associated
  communityPost: {
    type: Schema.Types.ObjectId,
    ref: "CommunityPost",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  replies: [
    {
      type: Schema.Types.ObjectId,
      ref: "Reply",
    },
  ],
});

// Define Reply Schema
const replySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, // User who made the reply
  comment: {
    type: Schema.Types.ObjectId,
    ref: "Comment",
    required: true,
  }, // Comment to which the reply is associated
  content: {
    type: String,
    required: true,
  },
});

const Feedback = mongoose.model("Feedback", feedbackSchema);
const FeedbackReply = mongoose.model("FeedbackReply", feedbackReplySchema);

const Comment = mongoose.model("Comment", commentSchema);
const Reply = mongoose.model("Reply", replySchema);

module.exports = { Feedback, FeedbackReply, Comment, Reply };
