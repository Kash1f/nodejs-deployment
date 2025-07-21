import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";


//creating a new router instance
const router = express.Router();

//to create a token, we will define a sign method and this sign method will have different arguments, payload, secret key and options, in the token we need to have a unique identifier so that we know which user has this token, so we have added userId to understand which user has this token, to create this token we need to add a secret

const generateToken = (userId) => {
  return jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: "15d"}) //return the generated token,so it can be stored & sent to client
}

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    if (password.length < 3) {
      return res.status(400).json({ message: "Password must be at least 3 characters long" });
    }
    
    //check if user already exists, check it by email or username, here User is our model, this code will check in User collection in the db using findOne method

    const existingEmail = await User.findOne({ email });
    if(existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const existingUsername = await User.findOne({ username });
    if(existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    //random profile image generation with user creation
    const profileImage =  `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

    const user = new User({
      username,
      email,
      password,
      profileImage
    });
    await user.save(); //save the user to the database

    //once the user has been created, we will generate a token using a userid and send it to the client
    const token = generateToken(user._id); 

    //201 means resource(user) is created in the backend, we will not send the user completely, instead we will send userid, username, email
    res.status(201).json({
      token,
      user: {
        id: user._id, //mongodb creates an id with _id
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      }
    })

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server error" });
  }
});

router.post("/login", async (req, res) => {
try {

  const { email, password } = req.body;

  if(!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  //check if user exists
  const user = await User.findOne({ email });
  if(!user) return res.status(400).json({ message : "Invalid Credentials" });
  
  //check if the password is correct
  const isMatch = await user.comparePassword(password); //compare the password with the hashed password in the database
  if(!isMatch) return res.status(400).json({ message: "Invalid Credentials" });
  
  const token = generateToken(user._id);

  res.status(200).json({
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
    }
  })

} catch (error){
  console.error(error);
  res.status(500).json({ message: "Internal Server error" });
}
});

export default router;

