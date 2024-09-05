const express = require("express");
const Book = require("../models/Book");
const BookCategory = require("../models/BookCategory");
const multer = require("multer");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const router = express.Router();

let uploadedFileName



// Use memory storage instead of disk storage
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory
  fileFilter(req, file, cb) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only JPG and PNG images are allowed'));
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 2, // 2MB
  },
});

upload.error = (err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'File too large, should be below 2MB' });
  } else {
    next(err);
  }
};


// get total number of books
router.get("/booksTotal", async (req, res) => {
    try {
      const totalBookCount = await Book.aggregate([
        {
          $group: {
            _id: null,
            totalBookCount: { $sum: "$bookCountAvailable" }
          }
        }
      ]);
      res.status(200).json({ totalBookCount: totalBookCount[0].totalBookCount });
    } catch (err) {
      return res.status(504).json(err);
    }
  });


/* Get all books in the db */
router.get("/allbooks", async (req, res) => {
    try {
        const books = await Book.find({}).populate("transactions").sort({ _id: -1 })
        res.status(200).json(books)
    }
    catch (err) {
        return res.status(504).json(err);
    }
})

/* Get Book by book Id */
router.get("/getbook/:id", async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate("transactions")
        res.status(200).json(book)
    }
    catch(err) {
        return res.status(500).json(err)
    }
})

// search function
router.get("/search", async (req, res) => {
  const { query } = req.query;
  let categoryId;

  // Check if the query matches a category name
  const category = await BookCategory.find({ categoryName: query });
  
  if (category.length > 0) {
    categoryId = category[0]._id;
  }

  const books = await Book.aggregate([
    {
      $match: {
        $or: [
          { bookName: { $regex: query, $options: 'i' } },
          { alternateTitle: { $regex: query, $options: 'i' } },
          { author: { $regex: query, $options: 'i' } },
          { publisher: { $regex: query, $options: 'i' } },
          { bookStatus: { $regex: query, $options: 'i' } },
          { language: { $regex: query, $options: 'i' } },
          { categoryNames: { $regex: query, $options: 'i' } },
          { categories: { $in: [categoryId] } }
        ]
      }
    }
  ]);

  res.json(books);
});



/* Get books by category name*/
router.get("/", async (req, res) => {
    const category = req.query.category
    try {
        const books = await BookCategory.findOne({ categoryName: category }).populate("books")
        res.status(200).json(books)
    }
    catch (err) {
        return res.status(504).json(err)
    }
})

/* Adding book */
router.post('/addbook', upload.single('bookCoverImage'), async (req, res) => {
    if (!req.body.isAdmin) {
        return res.status(403).json("You don't have permission to add a book!");
      }         
        let categories = [];
        if (req.body.categories) {
          categories = JSON.parse(req.body.categories);
          categories = categories.map(category => mongoose.Types.ObjectId(category));
        }
          if (req.file) {
            try {
              const bookCoverImageName = uploadedFileName;

              const newbook = await new Book({
                bookName: req.body.bookName,
                alternateTitle: req.body.alternateTitle,
                author: req.body.author,
                bookCountAvailable: req.body.bookCountAvailable,
                language: req.body.language,
                bookCoverImageName,
                publisher: req.body.publisher,
                bookStatus: req.body.bookStatus,
                categories,
            })
            const book = await newbook.save()
             await Promise.all(categories.map((categoryId) => BookCategory.updateOne({ _id: categoryId }, { $push: { books: book._id } })));
            return res.status(200).json(book)
            } catch (err) {
              console.error(err);
              return res.json({message:"Error adding book,please try again later"})
            }
          } else {
            
            const newbook = await new Book({
              bookName: req.body.bookName,
              alternateTitle: req.body.alternateTitle,
              author: req.body.author,
              bookCountAvailable: req.body.bookCountAvailable,
              language: req.body.language,
              publisher: req.body.publisher,
              bookStatus: req.body.bookStatus,
              categories,
          })
          const book = await newbook.save()
           await Promise.all(categories.map((categoryId) => BookCategory.updateOne({ _id: categoryId }, { $push: { books: book._id } })));
          return res.status(200).json(book)
          }
    }
)

/* update book */
router.put("/updatebook/:id", upload.single('bookCoverImage'), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);
    let bookCoverImageName = null;
    if (req.file) {
      bookCoverImageName = uploadedFileName;
    }
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json("Book not found");
    }
    if(req.body.bookIssuedCopies){
      book.bookIssuedCopies = req.body.bookIssuedCopies
    }
    book.bookName = data.bookName;
    book.alternateTitle = data.alternateTitle;
    book.author = data.author;
    book.bookCountAvailable = data.bookCountAvailable;
    book.language = data.language;
    book.publisher = data.publisher;
    book.categories = JSON.parse(data.categories);
    
    if (req.file) {
      // book.bookCoverImage = bookCoverImage;
      book.bookCoverImageName = bookCoverImageName;
    }
    await book.save();
    res.status(200).json("Book details updated successfully");
  } catch (err) {
    res.status(504).json(err);
  }
});


/* Remove book  */
router.delete("/removebook/:id", async (req, res) => {
        try {
            const _id = req.params.id
            const book = await Book.findOne({ _id })
            await book.remove()
            await BookCategory.updateMany({ '_id': book.categories }, { $pull: { books: book._id } });
            res.status(200).json("Book has been deleted");
        } catch (err) {
            return res.status(504).json(err);
        }
})

module.exports = router;