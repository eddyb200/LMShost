import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import nodemailer from 'nodemailer';
import dotenv from "dotenv";
const router = express.Router();

dotenv.config();
const DevEmail = process.env.DevEmail ;
const DevPass =  process.env.DevPass;

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: DevEmail,
        pass: DevPass
    }
});

/* User Registration */
router.post("/register", async (req, res) => {
  try {
    /* Salting and Hashing the Password */
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
  

    /* Create a new user */
    const newuser = await new User({
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

    /* Save User and Return */
    const user = await newuser.save();
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
  }
});

/* User Login */
router.post("/signin", async (req, res) => {
  try {
    console.log(req.body, "req");
    const user = req.body.admissionId
      ? await User.findOne({
          admissionId: req.body.admissionId,
        })
      : await User.findOne({
          employeeId: req.body.employeeId,
        });

    console.log(user, "user");

    if (!user) {
      return res.status(404).json("User not found");
    };

    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) {
      return res.status(400).json("Wrong Password");
    }

    res.status(200).json(user);
  } catch (err) {
    console.log(err);
  }
});

// User Forgot Password Endpoints

// sends code to user email
router.get("/sendCode/:email", async (req, res) => {
  const generatedCode = Math.floor(Math.random() * 9000) + 1000;
  const email = req.params.email;
  const message = `
  <div style="text-align: left;">
      <p>Hello,</br>
          Use the code below to reset to reset your password for KNUST Library System Account
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

// verifies code sent by user
router.post('/verifyCode', async (req, res) => {
  const { email, code } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'User not found' });
    }
    if (code!= user.passCode) {
      return res.json({ message: 'Code does not match' });
    } else {
      return res.json({ message: "Code match" });
    }
  } catch (error) {
    console.error('Error verifying code:', error);
    return res.json({ message: 'Error executing query' });
  }
});

// resets password

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


export default router;
