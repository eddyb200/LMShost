const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();
const DevEmail = process.env.DevEmail;
const DevPass = process.env.DevPass;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: DevEmail,
        pass: DevPass
    }
});

const router = express.Router();

/* User Registration */
router.post("/register", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);

    const newuser = new User({
      userType: req.body.userType,
      userFullName: req.body.userFullName,
      admissionId: req.body.admissionId,
      employeeId: req.body.employeeId,
      age: req.body.age,
      dob: req.body.dob,
      gender: req.body.gender,
      address: req.body.address,
      mobileNumber: req.body.mobileNumber,
      email: req.body.email,
      password: hashedPass,
      isAdmin: req.body.isAdmin,
    });

    const user = await newuser.save();
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

/* User Login */
router.post("/signin", async (req, res) => {
  try {
    const user = req.body.admissionId
      ? await User.findOne({ admissionId: req.body.admissionId })
      : await User.findOne({ employeeId: req.body.employeeId });

    if (!user) {
      return res.status(404).json("User not found");
    }

    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) {
      return res.status(400).json("Wrong Password");
    }

    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// User Forgot Password Endpoints

// Sends code to user email
router.get("/sendCode/:email", async (req, res) => {
  const generatedCode = Math.floor(Math.random() * 9000) + 1000;
  const email = req.params.email;
  const message = `
  <div style="text-align: left;">
      <p>Hello,</br>
          Use the code below to reset your password for KNUST Library System Account
      </p>
      <h1 style="letter-spacing: 1px; color: rgb(0, 194, 0);">${generatedCode}</h1>
      <p style="font-size: 15px;">
          If you didn't make this request, kindly ignore this email.
      </p>
      <span style="font-size: 12px; opacity: .4;">
          KLS Support
      </span>
  </div>
  `;
  const mailOptions = {
    from: `KLS Support <${DevEmail}>`,
    to: email,
    subject: 'Reset Password Code for KLS',
    html: message
  };

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'Account does not exist' });
    }
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending mail", error);
        return res.json({ message: 'Error sending mail' });
      }
      user.passCode = generatedCode;
      user.save();
      return res.json({ message: 'Code sent successfully' });
    });
  } catch (err) {
    console.log('Error executing query', err);
    return res.json({ message: 'Error executing query' });
  }
});

// Verifies code sent by user
router.post('/verifyCode', async (req, res) => {
  const { email, code } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'User not found' });
    }
    if (code != user.passCode) {
      return res.json({ message: 'Code does not match' });
    } else {
      return res.json({ message: "Code match" });
    }
  } catch (error) {
    console.error('Error verifying code:', error);
    return res.json({ message: 'Error executing query' });
  }
});

// Resets password
router.post("/resetPassword", async (req, res) => {
  const { email, password } = req.body;
  try {
    const encrypted = await bcrypt.hash(password, 13);
    const user = await User.findOneAndUpdate({ email }, { password: encrypted }, { new: true });
    if (!user) {
      return res.json({ message: 'No user found' });
    }
    return res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.log('Error resetting password', err);
    return res.json({ message: 'Error resetting password' });
  }
});

module.exports = { transporter, router };
