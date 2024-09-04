import React, { useEffect, useState } from 'react'
import './RecentAddedBooks.css'
import axios from 'axios'

function RecentAddedBooks() {
    const API_URL = process.env.REACT_APP_API_URL
    const [recentBook,setrecentBook] = useState([])
    const [loading,setLoading] = useState(true)
    useEffect(()=>{
            const getRecentBooks = async ()=>{
                try{
                    const response = await axios.get(API_URL+'api/books/allbooks');
                    setrecentBook(response.data)
                    setLoading(false)
                    return
                }
                catch(error){
                    console.log(error)
                    setLoading(false)
                }
            }
            getRecentBooks()
    },[API_URL])

    return (
        <div className='recentaddedbooks-container'>
            <h className='recentbooks-title'>RECENT UPLOADS</h>
            {loading ? (
          <div className='loading-mini'></div>
        ) : recentBook.length > 0 ? (
            <div className='recentbooks'>
            <div className='images'>
              {recentBook.map((book) => (
                <img
                  className='recent-book'
                  key={book._id}
                  src={book.bookCoverImageName? `/assets/coverImages/${book.bookCoverImageName}` : "assets/coverImages/default.png"}
                  alt=''
                />
              ))}
            </div>
            <div className='images'>
              {recentBook.map((book) => (
                <img
                  className='recent-book'
                  key={book._id + '_duplicate'} // Add a suffix to the key
                  src={book.bookCoverImageName? `/assets/coverImages/${book.bookCoverImageName}` : "assets/coverImages/default.png"}
                  alt=''
                />
              ))}
            </div>
          </div>
        ) : (
          <div className='no-books'>
            <img src='assets/images/empty.png' alt='No recent books' />
            <p>No recent books</p>
          </div>
        )}
            </div>
    )
}

export default RecentAddedBooks