import jwt from "jsonwebtoken";
import User from "../models/User.js";

//here we will first get the token from the request, then we will verify the token and then we will get the user from the database using the id from the token

const protectRoute = async (req, res, next) => {
  try {
    //get the token, this token is sent in the header of the request
    const token = req.header("Authorization").replace ("Bearer", ""); //go under the authorization header and get the token
    if (!token) return res.status(401).json({ message: "No token provided, access denied" });

    //verify the token with secret key, this will return the userId, decoded means the token was encrypted and we are decrypting it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //find the user in the database using the id from the token
    const user = await User.findById(decoded.id).select("-password"); //select every field except the password from user object
    if (!user) return res.status(401).json({ message: "User not found, access denied" });

    //attach the user to the request object so we can use it in the next middleware or route handler
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ message: "Server error" });
  }
    res.status(401).json({ message: "Invalid token, access denied" });
  }

export default protectRoute;