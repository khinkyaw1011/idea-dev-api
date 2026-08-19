import express from 'express';
import Idea from '../models/Idea.js';
import mongoose from 'mongoose';
const router = express.Router()
//@route          GET /api/ideas
//@description    Get all ideas
//@access         Public
router.get('/', async (req, res, next) => {
  try {
    const limit= parseInt(req.query._limit);
    const query=Idea.find().sort({createdAt: -1});
    if(!isNaN(limit)){
      query.limit(limit)
    }
    const ideas = await query.exec();
    res.json(ideas);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/ideas
 * @desc    Create new idea
 * @access  Public
 */
router.post('/', async (req, res, next) => {
  try {
    const { title, summary, description, tags } = req.body;

    // 1. Server-side Data Validation ပြုလုပ်ခြင်း
    if (!title?.trim() || !summary?.trim() || !description?.trim()) {
      res.status(400);
      throw new Error('Title, summary, and description are required');
    }

    // 2. Tags ကို Array ပုံစံသို့ ပြောင်းလဲ သန့်စင်ခြင်း
    let formattedTags = [];
    if (typeof tags === 'string') {
      formattedTags = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean); // Empty String များကို ဖယ်ထုတ်ခြင်း
    } else if (Array.isArray(tags)) {
      formattedTags = tags;
    }

    // 3. Idea Object အသစ် ဖန်တီးခြင်း
    const newIdea = new Idea({
      title,
      summary,
      description,
      tags: formattedTags,
    });

    // 4. Database တွင် သိမ်းဆည်းခြင်း
    const savedIdea = await newIdea.save();

    // 5. 201 Created Status Code နှင့်အတူ တုံ့ပြန်ပေးခြင်း
    res.status(201).json(savedIdea);
  } catch (error) {
    next(error);
  }
});
/**
 * @route   GET /api/ideas/:id
 * @desc    Get single idea
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    // 1. Invalid MongoDB ObjectId ဖြစ်နေပါက စစ်ဆေးခြင်း
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error('Idea not found');
    }

    // 2. Database တွင် ID ဖြင့် ရှာဖွေခြင်း
    const idea = await Idea.findById(id);

    // 3. ID Format မှန်သော်လည်း Data မရှိပါက စစ်ဆေးခြင်း
    if (!idea) {
      res.status(404);
      throw new Error('Idea not found');
    }

    res.json(idea);
  } catch (error) {
    next(error);
  }
});
/**
 * @route   DELETE /api/ideas/:id
 * @desc    Delete idea
 * @access  Public
 */
router.delete('/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    // 1. Invalid MongoDB ObjectId ဖြစ်နေပါက စစ်ဆေးခြင်း
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error('Idea not found');
    }

    // 2. Database တွင် ID ဖြင့် ရှာဖွေပြီး ဖျက်ထုတ်ခြင်း
    const idea = await Idea.findByIdAndDelete(id);

    // 3. Idea ရှာမတွေ့ပါက Error ပြန်ပေးခြင်း
    if (!idea) {
      res.status(404);
      throw new Error('Idea not found');
    }

    // 4. အောင်မြင်ကြောင်း Success Message ပြန်ပေးခြင်း
    res.json({ message: 'Idea deleted successfully' });
  } catch (error) {
    next(error);
  }
});
/**
 * @route   PUT /api/ideas/:id
 * @desc    Update idea
 * @access  Public
 */
router.put('/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    // 1. Invalid ObjectId စစ်ဆေးခြင်း
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error('Idea not found');
    }

    const { title, summary, description, tags } = req.body;

    // 2. Validation ပြုလုပ်ခြင်း
    if (!title?.trim() || !summary?.trim() || !description?.trim()) {
      res.status(400);
      throw new Error('Title, summary, and description are required');
    }

    // 3. Tags ကို Array ပုံစံသို့ ပြောင်းလဲခြင်း
    let formattedTags = [];
    if (Array.isArray(tags)) {
      formattedTags = tags;
    } else if (typeof tags === 'string') {
      formattedTags = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
    }

    // 4. Database တွင် ရှာဖွေ၍ Data ပြင်ဆင်ခြင်း
    const updatedIdea = await Idea.findByIdAndUpdate(
      id,
      {
        title,
        summary,
        description,
        tags: formattedTags,
      },
      {
        new: true, // ပြင်ဆင်ပြီးသား Data အသစ်ကို တုံ့ပြန်ပေးမည်
        runValidators: true, // Model ရဲ့ Validation Rule များကို ပြန်စစ်မည်
      }
    );

    if (!updatedIdea) {
      res.status(404);
      throw new Error('Idea not found');
    }

    res.json(updatedIdea);
  } catch (error) {
    next(error);
  }
});

export default router;