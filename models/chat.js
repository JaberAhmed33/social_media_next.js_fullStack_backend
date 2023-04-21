import mongoose from "mongoose";

const {ObjectId} = mongoose.Schema;

const chatSchema = new mongoose.Schema({
    message: {
        type: {},
        required:true
    },
    sendBy: {
        type: ObjectId,
        ref: "User"
    },
    image: {
        url: String,
        public_id: String
    },
    likes: [{
        type: ObjectId,
        ref: "User"
    }],
},{timestamps:true});


export default mongoose.model("Chat", chatSchema)