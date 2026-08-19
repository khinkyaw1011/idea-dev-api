
import mongoose from 'mongoose';

const ideaSchema = new mongoose.Schema(
  {
     user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    }, 
    title: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, // createdAt နှင့် updatedAt များကို အလိုအလျောက် ထည့်ပေးမည်
  }
);

const Idea = mongoose.model('Idea', ideaSchema);

export default Idea;