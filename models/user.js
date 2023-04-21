import mongoose from "mongoose";

const { Schema } = mongoose;
const userSchema = new Schema(
  {
    name: {
      type: String,
      tirm: true,
      required: true,
    },

    password: {
      type: String,
      tirm: true,
      required: true,
      min: 6,
      max: 100,
    },

    email: {
      type: String,
      tirm: true,
      required: true,
      unique: true,
    },

    secret: {
      type: String,
      tirm: true,
      required: true,
    },
    username: {
      type: String,
      unique: true,
      required: true,
    },
    about: { type: String },
    image: {
      url: String,
      public_id: String,
    },
    role: {
      type: String,
      default: "User",
    },
    following: [{ type: Schema.ObjectId, ref: "User" }],
    followers: [{ type: Schema.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
