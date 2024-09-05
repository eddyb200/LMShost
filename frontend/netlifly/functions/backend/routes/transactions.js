import express from "express"
import Book from "../models/Book.js"
import BookTransaction from "../models/BookTransaction.js"

const router = express.Router()

router.post("/add-transaction", async (req, res) => {
    try {
        if (req.body.isAdmin === true) {
            const newtransaction = await new BookTransaction({
                bookId: req.body.bookId,
                borrowerId: req.body.borrowerId,
                bookName: req.body.bookName,
                borrowerName: req.body.borrowerName,
                transactionType: req.body.transactionType,
                fromDate: req.body.fromDate,
                toDate: req.body.toDate,
                byAdmin:req.body.isAdmin
            })
            const transaction = await newtransaction.save()
            // Update bookReservedCopies field in Book model
            const book = await Book.findById(req.body.bookId);
            if (req.body.transactionType === "Reserved") {
            book.bookReservedCopies += 1;
            }
            if (req.body.transactionType === "Issued") {
            book.bookIssuedCopies += 1;
            }
            await book.save();
            const updatedBook = Book.findById(req.body.bookId)
            await updatedBook.updateOne({ $push: { transactions: transaction._id } })
            res.status(200).json(transaction)
        }
        else if (req.body.isAdmin === false) {
            res.status(500).json("You are not allowed to add a Transaction")
        }
    }
    catch (err) {
        res.status(504).json(err)
    }
})

// reservation endpoint
router.post("/add-reservation", async (req, res) => {
    try {
            const newtransaction = await new BookTransaction({
                bookId: req.body.bookId,
                borrowerId: req.body.borrowerId,
                bookName: req.body.bookName,
                borrowerName: req.body.borrowerName,
                transactionType: req.body.transactionType,
                fromDate: req.body.fromDate,
                toDate: req.body.toDate,
                byAdmin:req.body.byAdmin
            })
            const transaction = await newtransaction.save()
            // Update bookReservedCopies field in Book model
            const book = await Book.findById(req.body.bookId);
            if (req.body.transactionType === "Reserved") {
            book.bookReservedCopies += 1;
            }
            await book.save();
            const updatedBook = Book.findById(req.body.bookId)
            await updatedBook.updateOne({ $push: { transactions: transaction._id } })
            res.status(200).json(transaction)
        }
    catch (err) {
        res.status(504).json(err)
    }
})

router.get("/all-transactions", async (req, res) => {
    try {
        const transactions = await BookTransaction.find({}).sort({ _id: -1 })
        res.status(200).json(transactions)
    }
    catch (err) {
        return res.status(504).json(err)
    }
})

router.get("/reserved-transactions", async (req, res) => {
    try {
        const transactions = await BookTransaction.find({ transactionStatus: "Active" ,transactionType:"Issued"}).sort({ createdAt: -1 }).limit(10);
        res.status(200).json(transactions)
    }
    catch (err) {
        return res.status(504).json(err)
    }
})

router.get("/get-all-reservations", async (req, res) => {
    try {
        const transactions = await BookTransaction.find({ transactionStatus: "Active" ,transactionType:"Reserved"}).sort({ createdAt: -1 }).limit(10);
        res.status(200).json(transactions)
    }
    catch (err) {
        return res.status(504).json(err)
    }
})

router.get("/countTransactions", async (req, res) => {
    try {
        const transactionsCount = await BookTransaction.countDocuments({ transactionStatus: "Active" });
        // counts number of transactions
        res.status(200).json(transactionsCount)
    }
    catch (err) {
        return res.status(504).json(err)
    }
})

router.put("/update-transaction/:id", async (req, res) => {
    try {
        if (req.body.isAdmin) {
            const transaction = await BookTransaction.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            });

            if (transaction.transactionType === "Reserved" && req.body.transactionType === "Issued") {
                // Update the book's reserved and issued copies
                const book = await Book.findById(transaction.bookId);
                
                book.bookReservedCopies -= 1;
                book.bookIssuedCopies += 1;
                await book.save();
              }

              if (transaction.transactionType === "Issued" && req.body.transactionType === "Returned") {
                // Update the book's reserved and issued copies
                const book = await Book.findById(transaction.bookId);
                book.transactionType = "Returned"
                book.bookIssuedCopies -= 1;
                await book.save();
              }
            res.status(200).json("Transaction details updated successfully");
        }
    }
    catch (err) {
        res.status(504).json(err)
    }
})

router.delete("/remove-transaction/:id", async (req, res) => {
    try {
        const data = await BookTransaction.findByIdAndDelete(req.params.id);
        const book = await Book.findById(data.bookId);
        await book.updateOne({ $pull: { transactions: req.params.id } });
    
        
    if (data.transactionType === "Reserved") {
        if (book.bookReservedCopies > 0) {
          book.bookReservedCopies -= 1;
        }
      } else if (data.transactionType === "Issued") {
        if (book.bookIssuedCopies > 0) {
          book.bookIssuedCopies -= 1;
        }
      }
        await book.save();
    
        res.status(200).json("Transaction deleted successfully");
      } catch (err) {
        return res.status(504).json(err);
      }
    })

export default router