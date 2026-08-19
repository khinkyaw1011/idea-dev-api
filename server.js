import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ideaRouter from './routes/ideaRoutes.js';
import authRouter from './routes/authRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import connectDB from './config/db.js';

//call the Environment Variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
connectDB();
// Middleware 
app.use(cors());
// Body Parsing Middlewares
app.use(express.json()); // Raw JSON Data များ ဖတ်ရန်
app.use(express.urlencoded({ extended: true })); // Form Encoded Data များ ဖတ်ရန်
// Ideas Route ထည့်သွင်းခြင်း
app.use('/api/ideas', ideaRouter);
app.use('/api/auth', authRouter);
// 404 Fallback Middleware
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error); // Error Handler ဆီသို့ ဆက်လက် ပို့ဆောင်ပေးခြင်း
});
app.use(errorHandler);
// Server start run 
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
