import express from "express";
import Book from "../models/Book.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

//this will be a protected route, we will show the server our identity means we are authenticated, req has the user object, this will now be used to create the post
router.post("/", protectRoute, async (req, res) => {
  try {
    const { title, caption, rating, image } = req.body;
    if (!title || !caption || !rating || !image)
      return res.status(400).json({ message: "All fields are required" });

    //upload the image to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;

    //save the book to the database
    const newBook = new Book({
      title,
      caption,
      rating,
      image: imageUrl,
      user: req.user._id, //this is the user id from the token, req of this route has the user object
    });

    await newBook.save();

    //201 means the book has been created and newBook object has been returned back to the client
    res.status(201).json(newBook);
  } catch (error) {
    console.log("Error creating book", error);
    res.status(500).json({ message: error.message });
  }
});

//get all books with pagination
router.get("/", async (req, res) => {
  try {
    const page = req.query.page || 1; //get the page number from the query string, if not undefined, set it to 1
    const limit = req.query.limit || 5; //get the limit from the query string, if not undefined, set it to 10
    const skip = (page - 1) * limit;

    //sort the books by createdAt in descending order, latest postsfirst
    const books = await Book.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage");

    const totalBooks = await Book.countDocuments(); //get the total number of books in the database

    res.send({
      books,
      currentPage: page,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limit), //total number of pages
    });
  } catch (error) {
    console.log("Error getting books", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//get recommended books by the logged in user
router.get("/user", protectRoute, async (req, res)=>{
  try {
    //find all the books posted by the current user
    const books = await Book.findOne({user: req.user._id}).sort({createdAt: -1})
    res.send(books)
  } catch (error) {
    console.error("Error getting recommended books", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
})

router.delete("/:id", protectRoute, async (req, res) => {
  //delete a book if the user is authenticated
  try {
    const book = await Book.findById(req.params.id); //find the book in the db using the id provided in the URL
    if (!book) return res.status(404).json({ message: "Book not found" });

    //check if the user is the owner of the book
    if (book.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "You are not authorized to delete this book" });
    }

    //delete the image from cloudinary
    if (book.image && book.image.includes("cloudinary")) {
      try {
        const publicId = book.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (deleteError) {
        console.log("Error deleting image", deleteError);
      }
    }

    await book.deleteOne(); //delete the book from the database
    res.status(200).json({ message: "Book deleted successfully" });

  } catch (error) {
    console.log("Error deleting book", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;

//When we try to create a post, we need to save an image, we will have all the string values like title, caption, rating etc but we also want to store the images and we are going to upload these images to cloudinary
