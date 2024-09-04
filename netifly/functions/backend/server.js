import serverless from "serverless-http";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import bookRoutes from "./routes/books.js";
import transactionRoutes from "./routes/transactions.js";
import categoryRoutes from "./routes/categories.js";

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
export const handler = serverless(app);
