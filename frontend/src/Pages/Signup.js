import React, {  useState } from "react";
import "./Signup.css";
import axios from "axios";

const Signup = () => {
  const [user, setUser] = useState({
    userType: "Staff",
    userFullName: "",
    admissionId: null,
    employeeId: "",
    age: "",
    dob: "",
    gender: "",
    address: "",
    mobileNumber: "",
    email: "",
    password: "",
    isAdmin: true,
  });

  const [error, setError] = useState();
  const [loading,setLoading]= useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const API_URL = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    try {
      const res = await axios.post(API_URL+"api/auth/register", user);
      if (res.status === 200) {
        setLoading(false)
        alert("User created successfully!");
        window.location.href = "/signin"; // Redirect to signin page
      }
    } catch (err) {
      setError("An error occured please try again later.");
      console.log(err);
      setLoading(false)
    }
  };

  

  return (
    <div className="signup-container">
      <div className="signup-card">
        <form onSubmit={handleSubmit}>
          <h2 className="signup-title"> Sign Up</h2>
          <p className="line"></p>

          <div className="error-message">
            <p>{error}</p>
          </div>

          <div className="signup-fields">
            <label>Full Name</label>
            <input
            className='signup-textbox'
              type="text"
              name="userFullName"
              placeholder="Enter Full Name"
              value={user.userFullName}
              onChange={handleChange}
            />
            <br />
            <label>Employee ID</label>
            <input
            className='signup-textbox'
              type="text"
              name="employeeId"
              placeholder="Enter Employee ID"
              value={user.employeeId}
              onChange={handleChange}
            />
            <br />
            <label>Age</label>
            <input
            className='signup-textbox'
              type="number"
              name="age"
              placeholder="Enter Age"
              value={user.age}
              onChange={handleChange}
            />
            <br />
            <label>Date of Birth</label>
            <input
            className='signup-textbox'
              type="date"
              name="dob"
              value={user.dob}
              onChange={handleChange}
            />
            <br />
            <label>Gender</label>
            <input
            className='signup-textbox'
              type="text"
              name="gender"
              placeholder="Enter Gender"
              value={user.gender}
              onChange={handleChange}
            />
            <br />
            <label>Address</label>
            <input
            className='signup-textbox'
              type="text"
              name="address"
              placeholder="Enter Residential Address"
              value={user.address}
              onChange={handleChange}
            />
            <br />
            <label>Mobile Number</label>
            <input
            className='signup-textbox'
              type="number"
              name="mobileNumber"
              placeholder="Enter Phone Number"
              value={user.mobileNumber}
              onChange={handleChange}
            />
            <br />
            <label>Email</label>
            <input
            className='signup-textbox'
              type="email"
              name="email"
              placeholder="Enter Email Address"
              value={user.email}
              onChange={handleChange}
            />
            <br />
            <label>Password</label>
            <input
            className='signup-textbox'
              type="password" minLength='6' placeholder="Create Password"
              name="password"
              value={user.password}
              onChange={handleChange}
            />
            <br />
          </div>

          <button className="signup-button" type="submit">{loading?(<div className="loading-mini"></div>):"Sign Up"}</button>

        </form>
      </div>
    </div>
  );
};

export default Signup;
