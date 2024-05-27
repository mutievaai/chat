const mongoose = require("mongoose");
const fs = require("fs");
const { resetPassword } = require("../controllers/userController");

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
    city: {
      type: String,
      ref: "City",
    },
    image: {
      type: String,
      default: imageBase64,
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cities",
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
        type: mongoose.Schema.Types.ObjectId,
        ref: "Languages",
      },
    ],
    genres: [
      {
        type: mongoose.Schema.Types.ObjectId,
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
    resetPasswordToken:{
      type: String,
    },
    resetPasswordExpires:{
      type: Date,
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
