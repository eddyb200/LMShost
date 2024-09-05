const serverless = require("serverless-http");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const bookRoutes = require("./routes/books");
const transactionRoutes = require("./routes/transactions");
const categoryRoutes = require("./routes/categories");

/* App Config */
dotenv.config();
const app = express();

/* Middlewares */
app.use(express.json());
app.use(cors());

/* API Routes */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/categories", categoryRoutes);

/* MongoDB connection */
mongoose.connect(
  process.env.MONGO_URL,
  {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
  },
  () => {
    console.log("MONGODB CONNECTED");
  }
);

app.get("/test", (req, res) => {
  res.send('Hello');
});

app.get("/", (req, res) => {
  res.status(200).send("Welcome to LibraryApp");
});

// Export the app to be used by the Netlify function
module.exports.handler = serverless(app);
