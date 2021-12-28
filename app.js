

const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");

const errorController = require("./controllers/error");
const User = require("./models/user");

const port = process.env.PORT || 4000;
const MONGODB_URI =
  "mongodb+srv://NovaAnn:kwmwBi9wmLJ0nYBw@cluster0.nn0w8.mongodb.net/myNodeDatabase?retryWrites=true&w=majority";

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});
const csrfProtection = csrf();
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Inside fileStorage");
    cb(null, "images");
  },

  filename: (req, file, cb) => {
    console.log("Inside filename");
    cb(null, file.originalname);
    console.log("After filename");
  },
});

const fileFilter = (req, file, cb) => {
  console.log("Inside filefilter");
  console.log(file);
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    console.log("Inside filefilter-yes");
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use("/admin/add-product",
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image"));

  app.use("/admin/edit-product",
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image"));

  app.use("/admin/save-profile",
  multer({ storage: fileStorage, fileFilter: fileFilter }).fields([{ name: 'profImage', maxCount: 1 }, { name: 'backImage', maxCount: 1 }]));

app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  console.log("Check 1");
  console.log(req.session.isLoggedIn);
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  // throw new Error('Sync Dummy');
  if (!req.session.user) {
    return next();
  }
  console.log("Inside app.use");
  console.log(req.session.user._id);
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});
app.use("/admin", adminRoutes);

app.use(shopRoutes);

app.use(authRoutes);

app.get("/500", errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {

  res.status(500);
});

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(port);
  })
  .catch((err) => {
    console.log(err);
  });
