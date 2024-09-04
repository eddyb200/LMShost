import React from 'react'
import './About.css'

function About() {
    return (
        <div className='about-box'>
            <h2 className="about-title">About the Library</h2>
            <div className="about-data">
                <div className="about-img">
                    <img src={`assets/image3.jpg`} alt="" />
                </div>
                <div>
                    <p className="about-text" style={{fontSize:20}}>
                        Welcome to KNUST Library System (KLS), the school library dedicated to supporting students, staff and faculty with a wide range of resources. Our collection includes books, academic journals, theses and digital media, all regularly updated to ensure relevance.<br/>
                        <br/>
                        At KLS, you can easily reserve books, theses and project works online and then pick them up from the librarian for a hassle-free borrowing experience. This feature simplifies the process of accessing books by allowing reservations to be made conveniently from anywhere. We aim to make borrowing books a seamsless and effiecient process for all our libary users.<br/>
                        <br/>
                        Dive into the a world of books with just a few clicks and a librarian visit. Enjoy the convenience and happy reading.<br/>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default About
