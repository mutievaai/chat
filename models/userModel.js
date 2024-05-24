const mongoose = require("mongoose");
const fs = require("fs");

// Specify the file path
const imagePath = "public/images/default-avatar.jpg";
const imageBuffer = fs.readFileSync(imagePath);
const imageBase64 = imageBuffer.toString("base64");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: imageBase64,
    },
    music: [
      {
        type: String,
      },
    ],
    positions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Positions",
      },
    ],
    languages: [
      {
        type: String,
        ref: "Languages",
      },
    ],
    genres: [
      {
        type: String,
        ref: "Genres",
      },
    ],
    instruments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Instruments",
      },
    ],
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    friendRequests: [
      {
        // Field to store friend requests
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    is_online: {
      type: String,
      default: "0",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
