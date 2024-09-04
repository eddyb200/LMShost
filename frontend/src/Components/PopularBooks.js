import React,{useState,useEffect} from "react";
import "./PopularBooks.css";
import axios from "axios";

function PopularBooks() {

  const API_URL = process.env.REACT_APP_API_URL
    const [popularBook,setpopularBook] = useState([])
  const [loading,setLoading] = useState(true)

  useEffect(()=>{
    const getPopularBooks = async ()=>{
        try{
            const response = await axios.get(API_URL+'api/books/allbooks');
            const sortedBooks = response.data.filter((book) => book.transactions.length > 0).sort((a, b) => b.transactions.length - a.transactions.length);
        setpopularBook(sortedBooks);
            setLoading(false)
            return
        }
        catch(error){
            console.log(error)
            setLoading(false)
        }
    }
    getPopularBooks()
},[API_URL])

  return (
    <div className="popularbooks-container">
      <h className="popularbooks-title">POPULAR BOOKS</h>
        {loading ? (
          <div className='loading-mini'></div>
        ) : popularBook.length > 0 ? (
      <div className="popularbooks">
          <div className='popularbook-images'>
            {popularBook.map((book) => (
              <img
                className="popular-book"
                key={book._id}
                src={book.bookCoverImageName? `/assets/coverImages/${book.bookCoverImageName}` : "assets/coverImages/default.png"}
                alt=''
              />
            ))}
          </div>
          <div className='popularbook-images'>
            {popularBook.map((book) => (
              <img
                className="popular-book"
                key={book._id}
                src={book.bookCoverImageName? `/assets/coverImages/${book.bookCoverImageName}` : "assets/coverImages/default.png"}
                alt=''
              />
            ))}
          </div>
          </div>
        ) : (
          <div className='no-books'>
            <img src='assets/images/empty.png' alt='No recent books' />
            <p className="popularbook">No popular books yet!</p>
          </div>
        )}
      </div>
  );
}

export default PopularBooks;
