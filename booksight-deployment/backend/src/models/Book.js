import mongoose from "mongoose";

//every recommendation (book) has a title, caption and a rating and an image, the user who is the owner of the post, we will connect a book to a user
const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    image: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId, //type object as this will refer to a different model, and user is the owner of the post
      ref: "User", //we need to have a ref so that we can fetch the username and profile image, anything that is related to this user
      required: true,
    },
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", bookSchema);

export default Book;
