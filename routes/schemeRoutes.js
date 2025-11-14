import express from 'express';
import { body, validationResult } from 'express-validator';
import Scheme from '../models/Scheme.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/schemes
// @desc    Get all schemes with optional filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, status, page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    const schemes = await Scheme.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Scheme.countDocuments(query);

    res.json({
      schemes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/schemes/:id
// @desc    Get single scheme by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    res.json(scheme);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/schemes
// @desc    Create a new scheme
// @access  Private/Admin
router.post('/', protect, admin, [
  body('name').notEmpty().withMessage('Scheme name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('ministry').notEmpty().withMessage('Ministry is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const scheme = await Scheme.create(req.body);
    res.status(201).json(scheme);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/schemes/:id
// @desc    Update a scheme
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    res.json(scheme);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/schemes/:id
// @desc    Delete a scheme
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndDelete(req.params.id);

    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    res.json({ message: 'Scheme deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/schemes/categories/list
// @desc    Get all unique categories
// @access  Public
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Scheme.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

