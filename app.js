const express = require("express");
const cookieParser = require("cookie-parser");
const userModel = require("./model/user");
const postModel = require("./model/post");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const { hash } = require("crypto");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require('mongoose')
const crypto = require('crypto');
const multer = require('multer');



app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.get("/", (req, res) => {
  res.send("hello");
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/upload')
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(12,(err,bytes)=>{
      const uniqueSuffix = crypto.randomBytes(20).toString('hex').path.extname(file.originalname);
      cb(null, uniqueSuffix)
    })
  }
})

const upload = multer({ storage: storage })

app.post("/create", upload.single('image'), async (req, res) => {
  let { name, password, email, image, discription, } = req.body;
  let user = await userModel.findOne({ email})
  if (user) return res.status(500).json("email already exists");
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let createUser = await userModel.create({
        name,
        password: hash,
        email,
        image,
        discription,
      });
      const token = jwt.sign({ email }, "secret");
      // res.json(token)
      res.cookie("token", token, { httpOnly: true });
      // res.json(createUser)
      res.status(200).json({ createUser, redirectTo: "/profile" });
    });
  });
});
app.post("/login", async (req, res) => {
  let user = await userModel.findOne({ email: req.body.email });
  if (!user) return res.json("cant find user");

  bcrypt.compare(req.body.password, user.password, (err, result) => {
    if (result) {
      const token = jwt.sign({ emeil: user.email }, "secret");
      res.cookie("token", token, { httpOnly: true });
      res.status(200).json({ message: "login", redirectTo: "/profile" });
    } else return res.json("cant find");
  });
});
app.post("/logout", async (req, res) => {
   res.cookie("token", '', { httpOnly: true });
   res.status(200).json({ message: "logout", redirectTo: "/" });
});

const isLoggedIn = (req, res, next) => {
   const token = req.cookies.token;
   if (!token) {
     return res.status(401).json("login first");
   }
   try {
     const data = jwt.verify(token, "secret");
     req.user = data;
     next();
   } catch {
     return res.status(401).json("login first");
   }
 };

app.post("/profile",isLoggedIn, async (req,res)=>{
   const user = await userModel.findOne({email:req.user.email})
   res.json(user)
})


app.post("/post/create", isLoggedIn, async (req, res) => {
   let user = await userModel.findOne({ email: req.user.email });
   let{title,discription,thumbnail,video}=req.body
   let post= await postModel.create({
      user: user._id,
      title,
      discription,
      thumbnail,
      video,
   })
   user.posts.push(post._id);
   await user.save();
   res.status(200).json({ message: "Post Created",post, redirectTo: "/post" });
});

// app.post("/post", isLoggedIn, async (req, res) => {
//    const user = await userModel.findOne({ email: req.user.email }).populate('posts');
//    if (!user) {
//      return res.status(404).json({ message: "User not found" });
//    }
//    res.status(200).json(user.posts);
//  });

// app.post("/post",isLoggedIn, async (req,res)=>{
//    const user = await userModel.findOne({email:req.user.email}).populate('posts')
//    console.log(user);
//    res.json(user)
   
// })

app.listen(3000);



