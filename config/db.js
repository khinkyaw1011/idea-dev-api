// config/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    // Mongoose Connect ပြုလုပ်ခြင်း (Asynchronous Operation)
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    
    // Connection မရပါက Process ကို ရပ်တန့်ခြင်း (1 = Exit with failure)
    process.exit(1);
  }
};

export default connectDB;