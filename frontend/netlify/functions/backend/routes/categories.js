const express = require("express");
const BookCategory = require("../models/BookCategory");

const router = express.Router();

router.get("/allcategories", async (req, res) => {
  try {
    const categories = await BookCategory.find({});
    res.status(200).json(categories);
  } catch (err) {
    return res.status(504).json(err);
  }
});

router.post("/addcategory", async (req, res) => {
  try {
    const newcategory = await new BookCategory({
      categoryName: req.body.categoryName,
    });
    const category = await newcategory.save();
    res.status(200).json(category);
  } catch (err) {
    return res.status(504).json(err);
  }
});

router.get("/getcategory/:id",async (req,res)=>{
  try {
    const categoryId = req.params.id
    const category = await BookCategory.findById(categoryId)
    return res.json(category)
  } catch (error) {
    return res.status(504).json(error);
  }
})

module.exports = router;
