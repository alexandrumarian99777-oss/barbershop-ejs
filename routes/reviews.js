const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');

router.post('/', [
  body('customerName').trim().notEmpty().withMessage('Name is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Comment is required')
], async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    req.flash('error', 'Please fill all fields correctly');
    return res.redirect('/#reviews');
  }

  try {
    const review = new Review(req.body);
    await review.save();

    req.flash('success', 'Thank you for your review! It will be published after approval.');
    res.redirect('/#reviews');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error submitting review. Please try again.');
    res.redirect('/#reviews');
  }
});

module.exports = router;