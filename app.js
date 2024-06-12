require("dotenv").config();

var mongoose = require("mongoose");
const url =
  "mongodb+srv://kambardias4:admin789@cluster0.tfpxkjo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(url);
const cookieParser = require('cookie-parser');

const app = require("express")();
const T9n = require('t9n');
const i18n = require('i18n');
const path = require("path")
const http = require("http").Server(app);
const express = require("express");
const userRoute = require("./routes/userRoute");
const User = require("./models/userModel");
const Chat = require("./models/chatModel");


i18n.configure({
  locals: ['en', 'ru', 'kz'], // Add more locales if needed
  directory: path.join(__dirname, 'locales'),
  defaultLocale: 'en',
  cookie: 'lang',
  objectNotation: true,
});
app.use(cookieParser());

app.use(i18n.init);
app.use((req, res, next) => {
  const lang = req.cookies.lang;
  if (lang) {
    res.setLocale(lang);
  }
  res.locals.currentLocale = res.getLocale(); // Make current locale available to templates
  next();
});
app.use("/", userRoute);
app.use(express.urlencoded({ extended: true }));

const io = require("socket.io")(http);

var usp = io.of("/user-namespace");

usp.on("connection", async function (socket) {
  console.log("User connected");
 
  var userId = socket.handshake.auth.token;
 
  await User.findByIdAndUpdate({ _id: userId }, { $set: { is_online: "1" } });
 
  //User broadcast online status
  socket.broadcast.emit("getOnlineUser", { user_id: userId });
 
  socket.emit("getOnlineUser", { user_id: userId });
 
 
  socket.on("disconnect", async function () {
    console.log("User disconnected");
 
    var userId = socket.handshake.auth.token;
    await User.findByIdAndUpdate({ _id: userId }, { $set: { is_online: "0" } });
 
    //User broadcast offline status
    socket.broadcast.emit("getOfflineUser", { user_id: userId });
  });
 
  //chatting implementation
  socket.on("newChat", function (data) {
    socket.broadcast.emit("loadNewChat", data);
  });
 
  //load old chats
  socket.on("existsChat", async function (data) {
    var chats = await Chat.find({
      $or: [
        { sender_id: data.sender_id, receiver_id: data.receiver_id },
        { sender_id: data.receiver_id, receiver_id: data.sender_id },
      ],
    }).sort({ timestamp: 1 });
    socket.emit("loadChats", { chats: chats });
  });
});


http.listen(4000, function () {
  console.log("4000 server is runing");
});
