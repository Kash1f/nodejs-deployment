import mongoose from "mongoose";
import bcrypt from "bcryptjs"; //for hashing the password

//we are gonna have our user model where every single user will have username, email, password and profile image
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    profileImage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, //this will create createdAt and updatedAt fields in the database
  }
);

//hash password before savving user to the database

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); //if the password hasn't been modified, skip hashing

  const salt = await bcrypt.genSalt(10); //if the password is modified, we will hash it
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//compare password function
userSchema.methods.comparePassword = async function (userPassword) {
  return await bcrypt.compare(userPassword, this.password); //userPassword is the password entered by the user and this.password is the stored and hashed password in the database, if the passwords match, the function will return true, otherwise false
};

const User = mongoose.model("User", userSchema); //users collection will be created in the database

export default User;
