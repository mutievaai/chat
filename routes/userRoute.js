const express = require("express");
const user_route = express();

const bodyParser = require("body-parser");

const session = require("express-session");
const { SESSION_SECRET } = process.env;
//user_route.use(session({ secret:SESSION_SECRET}));
user_route.use(
  session({
    secret: SESSION_SECRET,
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
  })
);

user_route.use((req, res, next) => {
  res.locals.isAuthenticated = !!req.session.user;
  res.locals.user = req.session.user;
  next();
});

user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({ extended: true }));

user_route.set("view engine", "ejs");
user_route.set("views", "./views");

user_route.use(express.static("public"));

const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + path.extname(file.originalname);
    cb(null, name);
  },
});

const upload = multer({ storage: storage });

const userController = require("../controllers/userController");

const auth = require("../middlewares/auth");

user_route.get("/", userController.loadHomepage);

user_route.post("/register", userController.register);

user_route.get("/login", auth.isLogout, userController.loadLogin);
user_route.post("/login", userController.login);
user_route.get("/logout", auth.isLogin, userController.logout);

user_route.get('/forgotPassword', auth.isLogout, userController.forgotPassword);
user_route.post('/forgotPassword  ', auth.isLogout, userController.requestPasswordReset);
user_route.get('/resetPassword/:token', auth.isLogout, userController.resetPasswordPage)
;user_route.post('/resetPassword/:token', auth.isLogout, userController.resetPassword);

user_route.get("/activity", auth.isLogin, userController.loadActivity);         //open all posts
user_route.get("/post/:postId", auth.isLogin, userController.openPost);           //open post id
user_route.post("/activity", upload.single("image"), userController.createPost);// create post


user_route.get("/admin", auth.isLogin, userController.loadAllUsers);
user_route.get("/admin/:userId", auth.isLogin, userController.getUserById);
user_route.post("/admin/update/:userId", auth.isLogin, userController.updateUser);
user_route.delete("/admin/delete/:userId", auth.isLogin, userController.deleteUser);

user_route.get("/users", auth.isLogin, userController.loadUsers);

user_route.get("/profile/:userId", auth.isLogin, userController.openProfile);
user_route.post(
  "/profile",
  auth.isLogin,
  upload.single("image"),
  userController.uploadProfileImage
);
user_route.post(
  "/upload-music",
  auth.isLogin,
  upload.single("music"),
  userController.uploadMusic
);
user_route.post(
  "/delete-music/:userId/:musicIndex",
  userController.deleteMusic
);
user_route.post(
  "/updateUserProfile",
  auth.isLogin,
  userController.updateUserProfile
);

user_route.post(
  "/friend-request/:profId",
  auth.isLogin,
  userController.sendFriendRequest
);

user_route.get("/friends", auth.isLogin, userController.loadFriends);
user_route.post("/save-chat", userController.saveChat);
user_route.post(
  "/accept-request/:friendRequestId",
  auth.isLogin,
  userController.acceptRequest
);
user_route.post(
  "/decline-request/:friendRequestId",
  auth.isLogin,
  userController.declineRequest
);

user_route.get("*", function (req, res) {
  res.redirect("/");
});

module.exports = user_route;
