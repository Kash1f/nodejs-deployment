import express from 'express';
import "dotenv/config";
import cors from "cors";

import { connectDB } from "./lib/db.js"
import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); //middleware to parse JSON bodies
app.use(cors());

//mounts the authRoutes router as middleware to handle requests starting with "/api/auth"
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});