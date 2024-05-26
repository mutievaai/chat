const mongoose = require("mongoose");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const Post = require("../models/postModel");
const Instruments = require("../models/instrumentsModel");
const Positions = require("../models/positionsModel");
const Genres = require("../models/genresModel");
const Languages = require("../models/languagesModel");
const bcrypt = require("bcrypt");
const crypto = require('crypto');
const fs = require("fs");
const path = require("path");
const nodemailer = require('nodemailer');


const register = async (req, res) => {
  try {
    // console.log('Request body:', req.body); // Debugging line to check request body

    const passwordHash = await bcrypt.hash(req.body.password, 10);

    // const imagePath = "";
    // const imageBuffer = fs.readFileSync(imagePath);
    // const imageBase64 = imageBuffer.toString('base64');

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      // image: imageBase64,
      password: passwordHash,
    });

    await user.save();

    res.render("login", {
      messageReg: "Your Registration Completed Succedfully!",
    });
  } catch (error) {
    console.log(error.message);
  }
};

const loadLogin = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};

const login = async (req, res) => {
  try {
    // console.log('Request body:', req.body); // Debugging line to check request body

    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        req.session.user = userData;
        res.redirect("/dashboard");
      } else {
        res.render("login", { messageLog: "Email and password are incorrect" });
      }
    } else {
      res.render("login", { messageLog: "Email and password are incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const forgotPassword = async (req, res) => { //1
  try{
    res.render("forgotPassword", {message:""});
  }catch(error){
    console.log(error.message)
  }
}

const requestPasswordReset = async (req, res) => {  //2
  const userEmail = req.body.email;
  console.log("request Password email " + userEmail)
  const user = await User.findOne({email:userEmail})
  // console.log(user)
  if(!user){
    return res.status(400).send({ message: 'User with this email does not exist.' });
  }
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpires = Date.now() + 3600000; // 1 hour

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = resetTokenExpires;
  await user.save();

  // Send the email
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'kiel.hodkiewicz@ethereal.email',
      pass: 'WsrwAg4gua2mTd43YJ',
    }
  });
  const mailOptions = {
    from: 'kambardias4@example.com',
    to: user.email,
    subject: 'Password Reset Music Collaboration Platform',
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
            Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n
            http://localhost:4000/resetPassword/${resetToken}\n\n
            If you did not request this, please ignore this email and your password will remain unchanged.\n`,
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      return res.status(500).send({ message: 'Error sending email.' });
    }
    res.status(200).send({ message: 'Password reset email sent.' });
  });

}
const resetPasswordPage = async (req, res) =>{ //3
  try{
    res.render('resetPasswordPage', {message:""});
  }catch(error){
    console.log(error.message)
  }
}
const resetPassword = async (req, res) => { //4
  const { token } = req.params;
  const { newPassword } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).send({message:'Password reset token is invalid or has expired.'});
  }
  const passwordHash = await bcrypt.hash(newPassword, 10);

  user.password = passwordHash;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).send({message:'Password has been reset.'});
};


const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

const loadHomepage = async (req, res) => {
  try {
    res.render("homepage", { user: req.session.user });
  } catch (error) {
    console.log(error.message);
  }
};

// users
const loadUsers = async (req, res) => {
  try {
    var users = await User.find({ _id: { $nin: [req.session.user._id] } });
    res.render("users", { user: req.session.user, users: users });
  } catch (error) {
    console.log(error.message);
  }
};

const saveChat = async (req, res) => {
  try {
    var chat = new Chat({
      sender_id: req.body.sender_id,
      receiver_id: req.body.receiver_id,
      message: req.body.message,
    });

    var newChat = await chat.save();
    res
      .status(200)
      .send({ success: true, msg: "Chat inserted", data: newChat });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};
// activity
const loadActivity = async (req, res) => {
  try {
    var posts = await Post.find({});
    // console.log(posts)
    res.render("activity", { user: req.session.user, posts: posts });
  } catch (error) {
    console.log(error.message);
  }
};
const createPost = async (req, res) => {
  try {
    const userId = req.session.user._id; // Assuming user ID is stored in session
    const imagePath = req.file.path;
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString("base64");

    const post = new Post({
      user_id: userId,
      title: req.body.title,
      image: imageBase64,
      content: req.body.content,
    });

    await post.save();
    // var posts = await Post.find({});
    // res.render('activity', {user: req.session.user, posts:posts})
    res.redirect("activity");
  } catch (error) {
    console.log(error.message);
  }
};
// admin-panel
const loadAllUsers = async (req, res) => {
  try {
    var users = await User.find({});
    res.render("admin", { user: req.session.user, users: users });
  } catch (error) {
    console.log(error.message);
  }
};
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    res.json(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Server error" });
  }
};

const updateUser = async (req, res) => {
  try {
    console.log("update " + req.params.userId);
    // console.log(req.body)
    await User.findByIdAndUpdate(req.params.userId, req.body);
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Server Error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    console.log("delete " + req.params.userId);
    await User.findByIdAndDelete(req.params.userId);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Server Error" });
  }
};

// Profile
const openProfile = async (req, res) => {
  try {
    // Validate userId as an ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.session.user._id)) {
      return res.status(400).send("No user in session");
    }
    // const user = await User.findById(req.session.user._id)

    const profUser = await User.findById(req.params.userId)
      .populate("instruments")
      .populate("positions")
      .populate("genres")
      .populate("languages");
    if (!profUser) {
      return res.status(400).send("Invalid user ID");
    }
    let status = "user";
    if (profUser._id.equals(req.session.user._id)) {
      status = "you";
    } else if (profUser.friends.includes(req.session.user._id)) {
      status = "friend";
    } else if (profUser.friendRequests.includes(req.session.user._id)) {
      status = "friend-request";
    }
    const allInstruments = await Instruments.find({});
    const allPositions = await Positions.find({});
    const allGenres = await Genres.find({});
    const allLanguages = await Languages.find({});
    res.render("profile", {
      user: req.session.user,
      profUser: profUser,
      status: status,
      allInstruments: allInstruments,
      allPositions: allPositions,
      allGenres: allGenres,
      allLanguages: allLanguages
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};
const sendFriendRequest = async (req, res) => {
  try {
    const userId = req.session.user._id; // The ID of the user sending the request
    const friendId = req.params.profId; // The ID of the user receiving the request

    // const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!friend.friendRequests.includes(userId)) {
      friend.friendRequests.push(userId);
      await friend.save();
      res.redirect(`/profile/${friendId}`);
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
};

const uploadProfileImage = async (req, res) => {
  try {
    const imagePath = req.file.path;
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString("base64");
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    const userId = req.session.user._id;

    const user = await User.findById(userId);

    user.image = imageBase64;

    await user.save();

    res.redirect(`/profile/${userId}`);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};
const uploadMusic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    const musicPath = req.file.path;
    const musicBuffer = fs.readFileSync(musicPath);
    const musicBase64 = musicBuffer.toString("base64");
    const userId = req.session.user._id;
    const user = await User.findById(userId);

    user.music.push(musicBase64);
    await user.save();

    res.redirect(`/profile/${userId}`);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};

const deleteMusic = async (req, res) => {
  try {
    const userId = req.params.userId;
    const musicIndex = req.params.musicIndex;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    if (musicIndex < 0 || musicIndex >= user.music.length) {
      return res.status(400).send("Invalid music index");
    }

    user.music.splice(musicIndex, 1); // Удаление музыки по индексу
    await user.save();

    res.redirect(`/profile/${userId}`);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.session.user._id;
    let selectedInstruments = req.body.instruments; // This will be an array of selected instrument IDs or names
    let selectedPositions = req.body.positions; // This will be an array of selected positions IDs or names
    let selectedGenres = req.body.genres; // This will be an array of selected genres IDs or names
    let selectedLanguages = req.body.languages; // This will be an array of selected languages IDs or names
    // Ensure selectedInstruments is an array
    selectedInstruments = Array.isArray(selectedInstruments) ? selectedInstruments : [selectedInstruments];
    selectedPositions = Array.isArray(selectedPositions) ? selectedPositions : [selectedPositions];
    selectedGenres = Array.isArray(selectedGenres) ? selectedGenres : [selectedGenres];
    selectedLanguages = Array.isArray(selectedLanguages) ? selectedLanguages : [selectedLanguages];

    // Convert instrument names to ObjectIds
    const instrumentIds = await Promise.all(selectedInstruments.map(async (instrumentName) => {
        const instrument = await Instruments.findOne({ name: instrumentName });
        return instrument ? instrument._id : null;
    }));
    
    // Convert positions names to ObjectIds
    const positionIds = await Promise.all(selectedPositions.map(async (positionName) => {
      const position = await Positions.findOne({ name: positionName });
      return position ? position._id : null;
  }));

      // Convert genres names to ObjectIds
      const genreIds = await Promise.all(selectedGenres.map(async (genreName) => {
        const genre = await Genres.findOne({ name: genreName });
        return genre ? genre._id : null;
    }));
    
      // Convert languages names to ObjectIds
      const languageIds = await Promise.all(selectedLanguages.map(async (languageName) => {
        const language = await Languages.findOne({ name: languageName });
        return language ? language._id : null;
    }));

    // Filter out null values
    const validInstrumentIds = instrumentIds.filter(id => id !== null);
    const validPositionIds = positionIds.filter(id => id !== null);
    const validGenreIds = genreIds.filter(id => id !== null);
    const validLanguageIds = languageIds.filter(id => id !== null);


    // Update the user's tags
    await User.findByIdAndUpdate(userId, { instruments: validInstrumentIds, positions: validPositionIds, genres: validGenreIds, languages: validLanguageIds });
    
    res.redirect(`/profile/${userId}`);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error" });
  }
};

// Friends
const loadFriends = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const user = await User.findById(userId)
      .populate("friends")
      .populate("friendRequests");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const friendRequests = user.friendRequests;
    const friends = user.friends;
    // console.log(friends)
    // console.log(friendRequests)
    res.render("friends", {
      user: req.session.user,
      friends: friends,
      friendRequests: friendRequests,
    });
  } catch (error) {
    console.error(error.message);
    // res.status(500).json({ error: 'Server error' });
  }
};
const acceptRequest = async (req, res) => {
  try {
    const userId = req.session.user._id; // ID of the currently logged-in user
    const friendRequestId = req.params.friendRequestId; // ID of the friend request being accepted

    // Find the current user and the user who sent the friend request
    const currentUser = await User.findById(userId);
    const requestingUser = await User.findById(friendRequestId);

    // Check if the requestingUser exists and is in the friend requests of currentUser
    if (
      !requestingUser ||
      !currentUser.friendRequests.includes(friendRequestId)
    ) {
      return res.status(404).redirect("/friends"); // Redirect to friends page if friend request not found
    }

    // Add requestingUser to the friends list of currentUser
    currentUser.friends.push(requestingUser._id);
    // Remove requestingUser from the friend requests of currentUser
    currentUser.friendRequests = currentUser.friendRequests.filter(
      (id) => id.toString() !== friendRequestId
    );

    // Save changes to both users
    await currentUser.save();

    // Optionally, you can also add currentUser to the friends list of requestingUser
    requestingUser.friends.push(currentUser._id);
    await requestingUser.save();

    // Redirect to friends page after successfully accepting the friend request
    res.redirect("/friends");
  } catch (eror) {
    console.error(error.message);
  }
};
const declineRequest = async (req, res) => {
  try {
    const userId = req.session.user._id; // ID of the currently logged-in user
    const friendRequestId = req.params.friendRequestId; // ID of the friend request being declined

    // Find the current user
    const currentUser = await User.findById(userId);

    // Check if the friend request exists in the friendRequests list of the current user
    if (!currentUser.friendRequests.includes(friendRequestId)) {
      return res.status(404).redirect("/friends"); // Redirect to friends page if friend request not found
    }

    // Remove the friend request from the friendRequests list of the current user
    currentUser.friendRequests = currentUser.friendRequests.filter(
      (id) => id.toString() !== friendRequestId
    );

    // Save changes to the current user
    await currentUser.save();

    // Redirect to friends page after successfully declining the friend request
    res.redirect("/friends");
  } catch (error) {
    console.error(error.message);
    res.status(500).redirect("/friends"); // Redirect to friends page on server error
  }
};

module.exports = {
  register,
  loadLogin,
  login,
  logout,
  loadHomepage, // homepage
  loadActivity, // activity
  createPost, // activity
  loadAllUsers, // admin
  getUserById, // admin
  updateUser, // admin
  deleteUser, // admin
  loadFriends, // friends
  acceptRequest, // friends
  declineRequest, // friends
  saveChat, // chat
  sendFriendRequest, // profile
  openProfile, // profile
  uploadMusic, // profile
  deleteMusic, // profile
  updateUserProfile, //prfile
  uploadProfileImage, // profile
  loadUsers, // Users
  forgotPassword,
  resetPassword,
  requestPasswordReset,
  resetPasswordPage
};
