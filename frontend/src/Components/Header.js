import { React, useState } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useContext } from "react";
import { SearchContext } from "../Context/searchContext.js";
import "./Header.css";

import MenuIcon from "@material-ui/icons/Menu";
import ClearIcon from "@material-ui/icons/Clear";
import axios from "axios";

function Header() {
  const [menutoggle, setMenutoggle] = useState(false);
  const [searchValue, setsearchValue] = useState([]);
  const { setSearchResult } = useContext(SearchContext);
  const location = useLocation();
  const user = localStorage.getItem("user");

  const Toggle = () => {
    setMenutoggle(!menutoggle);
  };

  const closeMenu = () => {
    setMenutoggle(false);
  };
  const API_URL = process.env.REACT_APP_API_URL;

  const handleSearch = async (e) => {
    e.preventDefault();
    const response = await axios.get(`${API_URL}api/books/search`, {
      params: { query: searchValue },
    });
    setSearchResult(response.data);
  };

  return (
    <div className="header">
      <div className="logo-nav">
        <Link to="/">
          <a href="#home"><img src={`/assets/images/library-Logo.png`} alt="Logo"/>KLS</a>
        </Link>
      </div>
      <div className="nav-right">
        {location.pathname === "/books" && (
          <input
            className="search-input"
            type="text"
            placeholder="Search a Book"
            value={searchValue}
            style={{ visibility: "visible" }}
            onChange={(e) => setsearchValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearch(e);
              }
            }}
          />
        )}
        <ul className={menutoggle ? "nav-options active" : "nav-options"}>
          <li
            className="option"
            onClick={() => {
              closeMenu();
            }}
          >
            <Link to="/">
              <a href="#home">Home</a>
            </Link>
          </li>
          <li
            className="option"
            onClick={() => {
              closeMenu();
            }}
          >
            <Link to="/books">
              <a href="#books">Resources</a>
            </Link>
          </li>
          <li
            className="option"
            onClick={() => {
              closeMenu();
            }}
          >
            <Link to="/signin">
              <a href="signin">{user === "null" ? "Sign In" : "Dashboard"}</a>
            </Link>
          </li>
        </ul>
      </div>

      <div
        className="mobile-menu"
        onClick={() => {
          Toggle();
        }}
      >
        {menutoggle ? (
          <ClearIcon className="menu-icon" style={{ fontSize: 40 }} />
        ) : (
          <MenuIcon className="menu-icon" style={{ fontSize: 40 }} />
        )}
      </div>
    </div>
  );
}

export default Header;
