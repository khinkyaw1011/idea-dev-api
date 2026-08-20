import express from 'express';
import Idea from '../models/Idea.js';
import mongoose from 'mongoose';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/ideas
// @desc    Get all ideas
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const limit = parseInt(req.query._limit);

    const query = Idea.find().sort({ createdAt: -1 });

    if (!isNaN(limit)) {
      query.limit(limit);
    }

    const ideas = await query.exec();

    res.json(ideas);
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/ideas
// @desc    Create new idea
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const { title, summary, description, tags } = req.body || {};

    // Validate required fields
    if (!title?.trim() || !summary?.trim() || !description?.trim()) {
      res.status(400);
      throw new Error(
        'Title, summary, and description are required'
      );
    }

    // Format tags
    let formattedTags = [];

    if (typeof tags === 'string') {
      formattedTags = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
    } else if (Array.isArray(tags)) {
      formattedTags = tags;
    }

    // Create idea
    const newIdea = new Idea({
      title: title.trim(),
      summary: summary.trim(),
      description: description.trim(),
      tags: formattedTags,
      user: req.user._id,
    });

    // Save to MongoDB
    const savedIdea = await newIdea.save();

    res.status(201).json(savedIdea);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/ideas/:id
// @desc    Get single idea
// @access  Public
router.get('/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    // Check ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error('Idea not found');
    }

    // Find idea
    const idea = await Idea.findById(id);

    if (!idea) {
      res.status(404);
      throw new Error('Idea not found');
    }

    res.json(idea);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/ideas/:id
// @desc    Update idea
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
  const { id } = req.params;

  try {
    // Check ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error('Idea not found');
    }

    // Find idea
    const idea = await Idea.findById(id);

    if (!idea) {
      res.status(404);
      throw new Error('Idea not found');
    }

    // Check ownership
    if (idea.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error(
        'Not authorized to update this idea'
      );
    }

    const { title, summary, description, tags } = req.body || {};

    // Validate required fields
    if (
      !title?.trim() ||
      !summary?.trim() ||
      !description?.trim()
    ) {
      res.status(400);
      throw new Error(
        'Title, summary, and description are required'
      );
    }

    // Format tags
    let formattedTags = [];

    if (Array.isArray(tags)) {
      formattedTags = tags;
    } else if (typeof tags === 'string') {
      formattedTags = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
    }

    // Update idea
    idea.title = title.trim();
    idea.summary = summary.trim();
    idea.description = description.trim();
    idea.tags = formattedTags;

    const updatedIdea = await idea.save();

    res.json(updatedIdea);
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/ideas/:id
// @desc    Delete idea
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  const { id } = req.params;

  try {
    // Check ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error('Idea not found');
    }

    // Find idea
    const idea = await Idea.findById(id);

    if (!idea) {
      res.status(404);
      throw new Error('Idea not found');
    }

    // Check ownership
    if (idea.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error(
        'Not authorized to delete this idea'
      );
    }

    // Delete idea
    await idea.deleteOne();

    res.json({
      message: 'Idea deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;