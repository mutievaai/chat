const mongoose = require("mongoose");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const Post = require("../models/postModel");
const Instruments = require("../models/instrumentsModel");
const Positions = require("../models/positionsModel");
const Genres = require("../models/genresModel");
const Languages = require("../models/languagesModel");
const Cities = require("../models/citiesModel");
const Comment = require("../models/CommentModel")
const bcrypt = require("bcrypt");
const crypto = require('crypto');
const fs = require("fs");
const path = require("path");
const nodemailer = require('nodemailer');
const { title } = require("process");
const {error} = require("console");
const jwt = require("jsonwebtoken")

const register = async (req, res) => {
  try {
    const passwordHash = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: passwordHash,
    });

    await user.save();

    res.render("login", {
      messageReg: "Your Registration Completed Succedfully!", lang: res.locale
    });
  } catch (error) {
    console.log(error.message);
  }
};

const loadLogin = async (req, res) => {
  try {
    res.render("login",{lang: res.locale });
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

const forgotPasswordPage = (req, res) => {
  res.render('forgotPassword', { message: "", lang: res.locale });
};
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.render('forgotPassword', { message: "Please provide an email", lang: res.locale });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.render('forgotPassword', { message: "User not found", lang: res.locale });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });
  // Generate a unique reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  // Set the expiry time for the token (e.g., 1 hour)
  const resetTokenExpires = Date.now() + 3600000; // 1 hour

  // Update the user's reset token and expiry in the database
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = resetTokenExpires;
  await user.save();

  // Construct the reset password URL with the token
  const resetPasswordUrl = `${process.env.CLIENT_URL}/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MY_GMAIL,
        pass: process.env.MY_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.MY_GMAIL,
      to: email,
      subject: "Password Reset Request",
      text: `Click on this link to reset your password: ${process.env.CLIENT_URL}/resetPassword/${token}`,
    };

    await transporter.sendMail(mailOptions);
    return res.render('forgotPassword', { message: "Password reset link sent successfully to your email account", lang: res.locale });

  } catch (error) {
    return res.render('forgotPassword', { message: "Something went wrong", lang: res.locale });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send({ message: 'User with this email does not exist.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MY_GMAIL,
        pass: process.env.MY_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.MY_GMAIL,
      to: user.email,
      subject: 'Password Reset Music Collaboration Platform',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
            Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n
            ${process.env.CLIENT_URL}/resetPassword/${resetToken}\n\n
            If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        return res.status(500).send({ message: 'Error sending email.' });
      }
      res.status(200).send({ message: 'Password reset email sent.' });
    });

  } catch (error) {
    return res.status(500).send({ message: 'Something went wrong.' });
  }
};

const resetPasswordPage = (req, res) => {
  res.render('resetPasswordPage', { message: "", token: req.params.token, lang: res.locale });
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send({ message: 'Password reset token is invalid or has expired.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    user.password = passwordHash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).send({ message: 'Password has been reset.' });

  } catch (error) {
    res.status(500).send({ message: 'Something went wrong.' });
  }
};


const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

const isLogout = (req, res, next) => {
  if (req.session.user) {
    // If user is logged in, redirect to homepage
    return res.redirect('/');
  }
  next();
};
const loadHomepage = async (req, res) => {
  try {
    res.render("homepage", { user: req.session.user, lang: res.locale  });
  } catch (error) {
    console.log(error.message);
  }
};
// users
const loadUsers = async (req, res) => {
  try {
    const { name, city, instruments, positions, genres, languages } = req.query;
    const query = {};
    if (name) query.name = new RegExp(name, 'i');
    if (city) query.city = { $in: city };
    if (instruments) query.instruments = { $in: instruments };
    if (positions) query.positions = { $in: positions };
    if (genres) query.genres = { $in: genres };
    if (languages) query.languages = { $in: languages };

    var users = await User.find(query);
    const allInstruments = await Instruments.find({});
    const allPositions = await Positions.find({});
    const allGenres = await Genres.find({});
    const allLanguages = await Languages.find({});
    const allCities = await Cities.find({});

    res.render("users", { user: req.session.user, users, allInstruments, allPositions, allGenres, allLanguages, allCities, lang: res.locale});
  } catch (error) {
    console.log(error.message);
  }
};
const  saveChat = async (req, res) => {
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
    res.status(400).send({ user: req.session.user, success: false, msg: error.message, lang: res.locale });
  }
};

// activity
const loadActivity = async (req, res) => {
  try {
    var posts = await Post.find({});
    // console.log(posts)
    res.render("activity", { user: req.session.user, posts: posts, lang: res.locale });
  } catch (error) {
    console.log(error.message);
  }
};
const openPost = async (req, res) => {
  try{
    const postId = req.params.postId
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(400).send("Invalid post ID");
    }
    const comments = await Comment.find({ post_id: postId }).populate('user_id', 'name image');
    res.render('post', { post, comments, user: req.session.user, lang: res.locale });
  }catch(error){
    console.log(error.message)
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
const addComment = async (req, res) => {
  try {
    const post_id  = req.params.postId;
    const user_id  = req.session.user._id;
    const { text: content  } = req.body;

    const comment = new Comment({
      post_id,
      user_id,
      content
    });

    await comment.save();

    res.redirect(`/post/${post_id}`);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};
const deleteComment = async (req, res) => {
  try {
    const post_id  = req.params.postId;
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);
    const user = await User.findById(req.session.user._id)
    if (!comment) {
      return res.status(404).send("Comment not found");
    }
    console.log(req.session.user._id.toString()+", "+ comment.user_id.toString())
    if (user.role == "admin"){
      pass;
    }else if (user._id.toString() != comment.user_id.toString()) {
      return res.status(403).send("You do not have permission to delete this comment");
    }
    await Comment.findByIdAndDelete(commentId);
    res.redirect(`/post/${post_id}`); // Redirect to the post page
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).send("Post not found");
    }
    if (req.session.user.role == "user" ) {
      return res.status(403).send("You do not have permission to delete this post");
    }
    await Post.findByIdAndDelete(postId);
    res.redirect(`/activity`);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({});
    res.render('activity', { posts });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};

// admin-panel
const loadAllUsers = async (req, res) => {
  try {
    var users = await User.find({});
    res.render("admin", { user: req.session.user, users: users, lang: res.locale });
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
      .populate("languages")
      .populate("city");
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
    const allCities = await Cities.find({});
    res.render("profile", {
      lang: res.locale, 
      profUser: profUser,
      status: status,
      allInstruments: allInstruments,
      allPositions: allPositions,
      allGenres: allGenres,
      allLanguages: allLanguages,
      allCities: allCities, 
      
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};
const updateAboutMe = async (req, res) => {
  try{
    const aboutMe = req.body.aboutMe
    await User.findByIdAndUpdate(req.session.user._id, {aboutMe : aboutMe})
    res.redirect(`/profile/${req.session.user._id}`)
  }
  catch(eror){
    console.loge(error.message)
    res.status(500).send("Cant Update")
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
    const fileName = path.basename(req.file.originalname);
    const musicBuffer = fs.readFileSync(musicPath);
    const musicBase64 = musicBuffer.toString("base64");
    const userId = req.session.user._id;
    const user = await User.findById(userId);
    const mus = {
      title:fileName,
      data: musicBase64
    }
    console.log(fileName)
    user.music.push(mus);
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
    let selectedCity = req.body.city; // This will be an array of selected cities IDs or names
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
      // Convert cities name to ObjectId
      const city = await Cities.findOne({ name: selectedCity });
      const cityId = city ? city._id : null;
    

    // Filter out null values
    const validInstrumentIds = instrumentIds.filter(id => id !== null);
    const validPositionIds = positionIds.filter(id => id !== null);
    const validGenreIds = genreIds.filter(id => id !== null);
    const validLanguageIds = languageIds.filter(id => id !== null);

    const updateData = {
      instruments: validInstrumentIds,
      positions: validPositionIds,
      genres: validGenreIds,
      languages: validLanguageIds,
      city: cityId 
    };
    
    await User.findByIdAndUpdate(userId, updateData);

    
    res.redirect(`/profile/${userId}`,{ lang: res.locale});
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
      lang: res.locale
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
      return res.status(404).redirect("/friends", {lang: res.locale}); // Redirect to friends page if friend request not found
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
    res.redirect("/friends", {user: req.session.user, lang: res.locale});
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
    res.redirect("/friends", {user: req.session.user, lang: res.locale});
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
  openPost,   // activiti-post
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
  resetPasswordPage,
  forgotPasswordPage,
  addComment,
  updateAboutMe,
  deleteComment,
  getPosts, 
  deletePost
};
