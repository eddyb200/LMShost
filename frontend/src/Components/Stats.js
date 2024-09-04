import React, { useEffect, useState } from 'react'
import './Stats.css';
import axios from "axios";
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
import LocalLibraryIcon from '@material-ui/icons/LocalLibrary';
import BookIcon from '@material-ui/icons/Book';

function Stats() {
    const API_URL = process.env.REACT_APP_API_URL;

    const [totalBooks,setTotalbooks] = useState([]);
    const [totalMembers,setTotalMembers] = useState([]);
    const [totalReservations,setTotalReservations] = useState([]);
    const [isLoading,setisLoading] = useState(true);

    

    useEffect(()=>{
        const getTotalBooks = async ()=>{
            try {
                const res = await axios.get(API_URL+'api/books/booksTotal');
                setTotalbooks(res.data.totalBookCount)
                setisLoading(false)  
            } catch (error) {
                console.log(error);
                setisLoading(false);
            } 
        }
        getTotalBooks()
    },[API_URL])

    useEffect(()=>{
        const getTotalMembers = async ()=>{
            try {
                const res = await axios.get(API_URL+'api/users/countmembers');
                setTotalMembers(res.data.usercount)
                setisLoading(false)  
            } catch (error) {
                console.log(error);
                setisLoading(false);
            } 
        }
        getTotalMembers()
    },[API_URL])

    useEffect(()=>{
        const getTotalTransactions = async ()=>{
            try {
                const res = await axios.get(API_URL+'api/transactions/countTransactions');
                setTotalReservations(res.data)
                setisLoading(false)  
            } catch (error) {
                console.log(error);
                setisLoading(false);
            } 
        }
        getTotalTransactions()
    },[API_URL])

    return (
        <div className='stats'>
            <div className='stats-block'>
                <LibraryBooksIcon className='stats-icon' style={{ fontSize:80 }}/>
                <p className='stats-title'>Total Books</p>
               {isLoading ? (<div className='loading-mini'></div>): <p className='stats-count'>{totalBooks}</p>}
            </div>
            <div className='stats-block'>
                <LocalLibraryIcon className='stats-icon' style={{ fontSize:80 }}/>
                <p className='stats-title'>Total Members</p>
                {isLoading ? (<div className='loading-mini'></div>): <p className='stats-count'>{totalMembers}</p>}
            </div>
            <div className='stats-block'>
                <BookIcon className='stats-icon' style={{ fontSize:80 }}/>
                <p className='stats-title'>Reservations</p>
                {isLoading ? (<div className='loading-mini'></div>): <p className='stats-count'>{totalReservations}</p>}
            </div>
        </div>
    )
}

export default Stats