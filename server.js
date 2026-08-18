import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

//call the Environment Variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware 
app.use(cors());

// Server start run 
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});