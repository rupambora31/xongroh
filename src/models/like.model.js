import mongoose, {Schema} from "mongoose";


const likeSchema = new Schema({
    post: {
        type: Schema.Types.ObjectId,
        ref: "Post"
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    reply: {
        type: Schema.Types.ObjectId,
        ref: "Reply"
    },
    communityPost: {
        type: Schema.Types.ObjectId,
        ref: "CommunityPost"
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    
}, {timestamps: true})

export const Like = mongoose.model("Like", likeSchema)