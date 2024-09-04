import React, { useEffect, useState ,useCallback} from "react";
import "./Allbooks.css";
import axios from "axios";
import { useContext } from 'react';
import { SearchContext } from '../Context/searchContext.js';
import { AuthContext } from "../Context/AuthContext.js";

function Allbooks() {
  const API_URL = process.env.REACT_APP_API_URL;
  const { searchResult } = useContext(SearchContext);
  const [books,setBooks] = useState([]);
  const [loading,setLoading] = useState(false);
  const [isloading,setisLoading] = useState(false);
  const [loadingBook,setLoadingBook] = useState(false);
  const [error, setError] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [intervalId, setIntervalId] = useState(null);
  const {user} = useContext(AuthContext)

  useEffect(() => {
    const getBooks = async () => {
      try {
        setLoading(true)
        const result = await axios.get(API_URL + "api/books/allbooks");
        setBooks(result.data);
        setLoading(false)
      } catch (error) {
        console.log(error);
        setError(true);
        setLoading(false);
      }
      
    };

    getBooks(); // call getBooks function when component mounts
  }, [API_URL]); //  dependency array

  useEffect(() => {
    if (!searchResult) {

    } else {
      setBooks(searchResult);
    }
  }, [searchResult]);

  const handleBookOptions = async (book) =>{
    
    if(user && (user.userType === "Student" || user.userType === "Staff")) {
      setLoadingBook(true)
      const response = await axios.get(`${API_URL}api/books/getbook/${book._id}`);
    const updatedBook = response.data;
    const categories = updatedBook.categories;
    const categoryNames = await Promise.all(categories.map(async (categoryId) => {
      const response = await axios.get(`${API_URL}api/categories/getcategory/${categoryId}`);
      return response.data.categoryName;
    }));
    updatedBook.categoryNames = categoryNames;
    setLoadingBook(false)
    setSelectedBook(updatedBook);

    }
  }
  //close options code 
  const handleCancel = () => {
    setSelectedBook(null);
  }
  // reserve book functions
  const reserveBook = async (bookId) => {
    try {
      setLoading(true)
      const toDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      const toDateStr = toDate.toLocaleDateString("en-US"); // format: "MM/dd/yyyy"
  
      const reserveData = {
        bookId,
        borrowerId: user._id,
        bookName: selectedBook.bookName,
        borrowerName: user.userFullName,
        transactionType: "Reserved",
        fromDate: new Date().toLocaleDateString("en-US"), // format: "MM/dd/yyyy"
        toDate: toDateStr,
        byAdmin:user.isAdmin
      };

      const response = await axios.post(`${API_URL}api/transactions/add-reservation`, reserveData);
      const transactionId = response.data._id;

      await axios.put(
        API_URL +
          `api/users/${transactionId}/reserve-to-activetransactions`,
        {
          userId: user._id
        }
      );
    
      setSelectedBook({...selectedBook, bookReservedCopies: selectedBook.bookReservedCopies + 1}); // Update selectedBook state

      setLoading(false)
      alert("Book Reserved Successfully For 7 days.")
    } catch (error) {
      console.log(error);
      setLoading(false)
    }
  };

  // cancel reservation
  const cancelReserve = useCallback(async (bookId) =>{
    try {
      setisLoading(true)
      const book = await axios.get(`${API_URL}api/books/getbook/${bookId}`);
      const transaction = book.data.transactions.find((transaction) => {
        return transaction.bookId === bookId && transaction.borrowerId === user._id && transaction.byAdmin === user.isAdmin && transaction.transactionType === "Reserved" && transaction.transactionStatus==="Active";
      });
      if (!transaction) {
        alert("No transaction ID found for this book");
        setisLoading(false)
        return;
      }
      const transactionId = transaction._id;
      const deleteTransaction = await axios.delete(
        API_URL + `api/transactions/remove-transaction/${transactionId}`
      );
      
      setSelectedBook({...selectedBook, bookReservedCopies: selectedBook.bookReservedCopies - 1}); // Update selectedBook state
      
      if (deleteTransaction.data === "Transaction deleted successfully") {
        alert("Transaction deleted successfully");
        // window.location.reload();
        setisLoading(false)
        return;
      } else {
        setisLoading(false)
        alert("An error occured please refresh and try again");
      }
    } catch (error) {
      setisLoading(false)
      console.log(error);
    }
  });


  // Function to automatically check reservations and delete if reservations exceed 7 days
  useEffect(() => {
    const cancelExpiredReservations = async () => {
      try {
        const transactions = await axios.get(`${API_URL}api/transactions/get-all-reservations`);
        const currentDate = new Date();
        const expiredReservations = transactions.data.filter((transaction) => {
          const toDate = new Date(transaction.toDate);
          const fromDate = new Date(transaction.fromDate);
          const diffInDays = Math.abs((toDate - fromDate) / (1000 * 3600 * 24));
          return currentDate > toDate && diffInDays === 1 && transaction.borrowerId === user._id && transaction.byAdmin === user.isAdmin && transaction.transactionType === "Reserved" && transaction.transactionStatus === "Active";
      });
  
        expiredReservations.forEach((transaction) => {
          cancelReserve(transaction.bookId);
        });
      } catch (error) {
        console.log(error);
      }
    };
    cancelExpiredReservations()

    const id = setInterval(cancelExpiredReservations, 1200000); // 1200000 milliseconds = 20 minutes
    setIntervalId(id);

    

    return () => {
      clearInterval(intervalId);
    };
  }, [API_URL,user,cancelReserve,intervalId]);

// admin delete function
  const handleDeleteBook = async (bookid)=>{
    try {
      const deletebook = await axios.delete(
        API_URL + `api/books/removebook/${bookid}`
      );
      if (deletebook.data === "Book has been deleted") {
        alert("Book Has Been Deleted");
        window.location.reload();
        return;
      } else {
        alert("An error occured please refresh and try again");
      }
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div className="books-page">
      <div className="books">
        {loading? (
          <div className="loading"></div>
        ) : (
          error || books.length === 0 ? (
            <div className="no-books-container">
            <img src='assets/images/empty.png' alt='No books' />
              <h2 className="no-books">No books found. Please again later</h2>
            </div>
          ) : (
            books.map((book)=>(
              <div className="book-card" key={book._Id} onClick={()=>{handleBookOptions(book)}}>
                <img
                  src={book.bookCoverImageName ? `assets/coverImages/${book.bookCoverImageName}` : "assets/coverImages/default.png"}
                  alt=""
                ></img>
                <p className="bookcard-title">{book.bookName}</p>
                <p className="bookcard-author">{book.author}</p>
                <div className="bookcard-category">
                  <p>{book.language}</p>
                  <span>Available Copies : {book.bookCountAvailable - book.bookReservedCopies -book.bookIssuedCopies}</span>
                </div>
                <div className="bookcard-emptybox"></div>
              </div>
            ))
          )
        )}
      </div>
      
      {loadingBook && <div className="loading"></div>}
      {selectedBook && (
  <div>
    <div className="overlay" />
    {user.isAdmin ? (
      <div className={`bookoptions ${selectedBook ? 'show' : ''}`}>
        <div className="bookoptions-info">
          <p>Issued Copies :{selectedBook.bookIssuedCopies}</p>
          <span>Reserved Copies :{selectedBook.bookReservedCopies}</span>
          <span className="category">Category: {selectedBook.categoryNames.join(", ")}</span>
        </div>
        <div className="reserve-options">
          <button className="delete" onClick={() => handleDeleteBook(selectedBook._id)}>Delete Book</button>
          <button className="reserve" onClick={() => reserveBook(selectedBook._id)}>{loading?(<div className="loading-mini"></div>):("Reserve Book")}</button>
          <button className="cancelreserve" onClick={() => cancelReserve(selectedBook._id)}>{isloading?(<div className="loading-mini"></div>):("Cancel Reservation")}</button>
        </div>
        <button className="closeOptions" onClick={handleCancel}>Close</button>
      </div>
    ) : (
      <div className={`bookoptions ${selectedBook ? 'show' : ''}`}>
        <div className="bookoptions-info">
          <p>Issued Copies :{selectedBook.bookIssuedCopies}</p>
          <span>Reserved Copies :{selectedBook.bookReservedCopies}</span>
          <span className="category">Category: {selectedBook.categoryNames.join(", ")}</span>
        </div>
        <div className="reserve-options">
          <button className="reserve" onClick={() => reserveBook(selectedBook._id)}>{loading?(<div className="loading-mini"></div>):("Reserve Book")}</button>
          <button className="cancelreserve" onClick={() => cancelReserve(selectedBook._id)}>{isloading?(<div className="loading-mini"></div>):("Cancel Reservation")}</button>
        </div>
        <button className="closeOptions" onClick={handleCancel}>Close</button>
      </div>
    )}
  </div>
)}
    </div>
  );
}

export default Allbooks;