import React, { useContext, useEffect, useState } from "react";
import "../AdminDashboard.css";
import axios from "axios";
import { AuthContext } from "../../../../Context/AuthContext";
import { Dropdown } from "semantic-ui-react";

function AddBook() {
  const API_URL = process.env.REACT_APP_API_URL;
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const [bookName, setBookName] = useState("");
  const [alternateTitle, setAlternateTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [bookCountAvailable, setBookCountAvailable] = useState(null);
  const [language, setLanguage] = useState("");
  const [bookCoverImage, setBookCoverImage] = useState(null);
  const [publisher, setPublisher] = useState("");
  const [allCategories, setAllCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [recentAddedBooks, setRecentAddedBooks] = useState([]);
  const [showEditBook,setShowEditBook] = useState(false)
  const [bookInfo,setBookInfo] = useState([])

  /* Fetch all the Categories */
  useEffect(() => {
    const getAllCategories = async () => {
      try {
        const response = await axios.get(
          API_URL + "api/categories/allcategories"
        );
        const all_categories = await response.data.map((category) => ({
          value: `${category._id}`,
          text: `${category.categoryName}`,
        }));
        setAllCategories(all_categories);
      } catch (err) {
        console.log(err);
      }
    };
    getAllCategories();
  }, [API_URL]);

  /* Adding book function */
  const addBook = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append("bookName", bookName);
    formData.append("alternateTitle", alternateTitle);
    formData.append("author", author);
    formData.append("bookCountAvailable", bookCountAvailable);
    formData.append("language", language);
    formData.append("publisher", publisher);
    formData.append("categories", JSON.stringify(selectedCategories));
    formData.append("isAdmin", user.isAdmin);

    if (bookCoverImage) {
      formData.append("bookCoverImage", bookCoverImage);
    }
    try {
      const response = await axios.post(
        API_URL + "api/books/addbook",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (recentAddedBooks.length >= 5) {
        recentAddedBooks.splice(-1);
      }
      setRecentAddedBooks([...recentAddedBooks, response.data]);
      setBookName("");
      setAlternateTitle("");
      setAuthor("");
      setBookCountAvailable("");
      setLanguage("");
      setBookCoverImage(null);
      setPublisher("");
      setSelectedCategories([]);
      setIsLoading(false);
      alert("Book Added Successfully 🎉");
    } catch (error) {
      if (error.response && error.response.status === 413) {
        alert("File size too large, File should be less than 1 MB");
      } else {
        console.log(error);
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getallBooks = async () => {
      const response = await axios.get(API_URL + "api/books/allbooks");
      setRecentAddedBooks(response.data);
    };
    getallBooks();
  }, [API_URL]);

  
  // Add Category 
  const handleCategory = async () => {

    await axios.post(API_URL + 'api/categories/addcategory', {
        categoryName: newCategory,
      }).then((response) => {
        setAllCategories([
          ...allCategories,
          { value: response.data._id, text: response.data.categoryName },
        ]);
        setNewCategory("");
        alert("Category Added")
      })
      .catch((error) => console.error(error));
  };

  // Delete Book Function
  const handleDelete = async (bookid) => {
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
  };

  // Edit Book Functions
  const openEditModule = async (bookid) => {
    setShowEditBook(true)

    const getBookInfo = await axios.get(API_URL+`api/books/getbook/${bookid}`)
    setBookInfo(getBookInfo.data)
    return
  };
  

  const editBook = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    const data = {
      bookName: bookInfo.bookName,
      alternateTitle: bookInfo.alternateTitle,
      author: bookInfo.author,
      bookCountAvailable: bookInfo.bookCountAvailable,
      language: bookInfo.language,
      publisher: bookInfo.publisher,
      categories: JSON.stringify(bookInfo.categories),
      isAdmin: user.isAdmin,
    };
  
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));
    if (bookCoverImage) {
      formData.append("bookCoverImage", bookCoverImage);
    }
  
    try {
      const response = await axios.put(
        API_URL + `api/books/updatebook/${bookInfo._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data === "Book details updated successfully") {
        setBookInfo([]);
        alert("Book details updated successfully");
        setShowEditBook(false);
        setIsLoading(false);
      } else {
        alert("Book details update failed");
        setShowEditBook(false);
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };
  
  const closeEdit = ()=>{
    setShowEditBook(false);
  }
  
  return (
    <div>
      <p className="dashboard-option-title">{showEditBook ? 'Edit Book Information' : 'Add a Book'}</p>
      <div className="dashboard-title-line"></div>
        <div className="category-dropdown">
        <input
          type="text"
          placeholder="Type in a new category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button type="button"
          onClick={() => {
            handleCategory();
          }}
        >
          Add Category
        </button>
        </div>

        {/* Form for New Book Entry */}
        {!showEditBook && (
      <form className="addbook-form" onSubmit={addBook}>
        <label className="addbook-form-label" htmlFor="bookName">
          Book Name<span className="required-field">*</span>
        </label>
        <br />
        <input
          className="addbook-form-input"
          type="text"
          name="bookName"
          value={bookName}
          onChange={(e) => {
            setBookName(e.target.value);
          }}
          required
        ></input>
        <br />

        <label className="addbook-form-label" htmlFor="alternateTitle">
          AlternateTitle
        </label>
        <br />
        <input
          className="addbook-form-input"
          type="text"
          name="alternateTitle"
          value={alternateTitle}
          onChange={(e) => {
            setAlternateTitle(e.target.value);
          }}
        ></input>
        <br />

        <label className="addbook-form-label" htmlFor="author">
          Author Name<span className="required-field">*</span>
        </label>
        <br />
        <input
          className="addbook-form-input"
          type="text"
          name="author"
          value={author}
          onChange={(e) => {
            setAuthor(e.target.value);
          }}
          required
        ></input>
        <br />

        <label className="addbook-form-label" htmlFor="language">
          Language
        </label>
        <br />
        <input
          className="addbook-form-input"
          type="text"
          name="language"
          value={language}
          onChange={(e) => {
            setLanguage(e.target.value);
          }}
        ></input>
        <br />
        <label className="addbook-form-label" htmlFor="bookCoverImage">
          Book Cover Image
        </label>
        <br />
        <input
          type="file"
          name="bookCoverImage"
          onChange={(e) => {
            const file = e.target.files[0];
            const fileSizeInMB = file.size / (1024 * 1024);
            if (fileSizeInMB > 1.5) {
              alert("File size exceeds 1MB");
              setBookCoverImage(null);
            } else {
              setBookCoverImage(file);
            }
          }}
        />
        <br />
        <label className="addbook-form-label" htmlFor="publisher">
          Publisher
        </label>
        <br />
        <input
          className="addbook-form-input"
          type="text"
          name="publisher"
          value={publisher}
          onChange={(e) => {
            setPublisher(e.target.value);
          }}
        ></input>
        <br />

        <label className="addbook-form-label" htmlFor="copies">
          No.of Copies Available<span className="required-field">*</span>
        </label>
        <br />
        <input
          className="addbook-form-input"
          type="text"
          name="copies"
          value={bookCountAvailable}
          onChange={(e) => {
            setBookCountAvailable(e.target.value);
          }}
          required
        ></input>
        <br />

        <label className="addbook-form-label" htmlFor="categories">
          Categories<span className="required-field">*</span>
        </label>
        <br />
        <div className="semanticdropdown">
        <Dropdown
          placeholder="Category"
          fluid
          multiple
          search
          selection
          options={allCategories}
          value={selectedCategories}
          onChange={(event, value) => setSelectedCategories(value.value)}
        />
      </div>

        <button className="addbook-submit" onClick={(e) => addBook(e)}>
          {isLoading ? <div className="loading-mini"></div> : "SUBMIT"}
        </button>
      </form>
    )}
        {/* Form for existing book editing */}
        {showEditBook && (
          <form className="editbook-form" onSubmit={editBook}>
          <button onClick={()=>{closeEdit()}}>Close Edit</button>
          <br/>
            <label className="addbook-form-label" htmlFor="bookName">
              Book Name<span className="required-field">*</span>
            </label>
            <br />
            <input
              className="addbook-form-input"
              type="text"
              name="bookName"
              value={bookInfo.bookName}
              onChange={(e) => {
                setBookInfo({...bookInfo, bookName: e.target.value });
              }}
              required
            ></input>
            <br />

            <label className="addbook-form-label" htmlFor="alternateTitle">
              AlternateTitle
            </label>
            <br />
            <input
              className="addbook-form-input"
              type="text"
              name="alternateTitle"
              value={bookInfo.alternateTitle}
              onChange={(e) => {
                setBookInfo({...bookInfo, alternateTitle: e.target.value });
              }}
            ></input>
            <br />

            <label className="addbook-form-label" htmlFor="author">
              Author Name<span className="required-field">*</span>
            </label>
            <br />
            <input
              className="addbook-form-input"
              type="text"
              name="author"
              value={bookInfo.author}
              onChange={(e) => {
                setBookInfo({...bookInfo, author: e.target.value });
              }}
              required
            ></input>
            <br />

            <label className="addbook-form-label" htmlFor="language">
              Language
            </label>
            <br />
            <input
              className="addbook-form-input"
              type="text"
              name="language"
              value={bookInfo.language}
              onChange={(e) => {
                setBookInfo({...bookInfo, language: e.target.value });
              }}
            ></input>
            <br />
            <label className="addbook-form-label" htmlFor="bookCoverImage">
              Book Cover Image
            </label>
            <br />
            {bookInfo.bookCoverImageName? (
    <div>
        <input
            type="file"
            name="bookCoverImage"
            onChange={(e) => {
                const file = e.target.files[0];
                const fileSizeInMB = file.size / (1024 * 1024);
                if (fileSizeInMB > 1.5) {
                    alert("File size exceeds 2MB");
                    setBookCoverImage(null);
                } else {
                    setBookCoverImage(file);
                }
            }}
        />
        <span>Current image: {bookInfo.bookCoverImageName}</span>
    </div>
) : (
    <input
        type="file"
        name="bookCoverImage"
        onChange={(e) => {
            const file = e.target.files[0];
            const fileSizeInMB = file.size / (1024 * 1024);
            if (fileSizeInMB > 3) {
                alert("File size exceeds 2MB");
                setBookCoverImage(null);
            } else {
                setBookCoverImage(file);
            }
        }}
    />
)}
            <br />
            <label className="addbook-form-label" htmlFor="publisher">
              Publisher
            </label>
            <br />
            <input
              className="addbook-form-input"
              type="text"
              name="publisher"
              value={bookInfo.publisher}
              onChange={(e) => {
                setBookInfo({...bookInfo, publisher: e.target.value });
              }}
            ></input>
            <br />

            <label className="addbook-form-label" htmlFor="copies">
              No.of Copies Available<span className="required-field">*</span>
            </label>
            <br />
            <input
              className="addbook-form-input"
              type="text"
              name="copies"
              value={bookInfo.bookCountAvailable}
              onChange={(e) => {
                setBookInfo({...bookInfo, bookCountAvailable: e.target.value });
              }}
              required
            ></input>
            <br />

            <label className="addbook-form-label" htmlFor="categories">
              Categories<span className="required-field">*</span>
            </label>
            <br />
            <div className="semanticdropdown">
              <Dropdown
                placeholder="Category"
                fluid
                multiple
                search
                selection
                options={allCategories}
                value={bookInfo.categories}
                onChange={(event, value) => setBookInfo({...bookInfo, categories: value.value })}
              />
            </div>

            <button className="addbook-submit" onClick={(e) => editBook(e)}>
              {isLoading? <div className="loading-mini"></div> : "SUBMIT"}
            </button>
          </form>
        )}

      <div>
        <p className="dashboard-option-title">All Books</p>
        <div className="dashboard-title-line"></div>
        <table className="admindashboard-table">
          <tr>
            <th>S.No</th>
            <th>Book Name</th>
            <th>Added Date</th>
            <th>No. of Copies</th>
            <th></th>
            <th></th>
          </tr>
          {recentAddedBooks.map((book, index) => {
            return (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{book.bookName}</td>
                <td>{book.createdAt.substring(0, 10)}</td>
                <td>{book.bookCountAvailable}</td>
                <td>
                  {
                    <button
                      class="editbtn"
                      onClick={() => openEditModule(`${book._id}`)}
                    >
                      Edit
                    </button>
                  }
                </td>
                <td>
                  {
                    <button
                      class="deletebtn"
                      onClick={() => handleDelete(`${book._id}`)}
                    >
                      Delete
                    </button>
                  }
                </td>
              </tr>
            );
          })}
        </table>
      </div>
    </div>
  );
}

export default AddBook;
