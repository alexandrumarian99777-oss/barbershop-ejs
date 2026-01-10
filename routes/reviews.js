import express from 'express';
import Review from '../models/Review.js';

const router = express.Router();

// GET all reviews (for homepage or admin can filter approved)
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ approved: true }).lean();
    res.render('reviews', {
      title: 'Customer Reviews',
      reviews,
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).send('Server error');
  }
});

// Optional: POST route to submit a review
router.post('/', async (req, res) => {
  try {
    const { customerName, comment, rating } = req.body;
    if (!customerName || !comment || !rating) {
      req.flash('error', 'All fields are required');
      return res.redirect('/reviews');
    }

    await Review.create({
      customerName,
      comment,
      rating: Number(rating),
      approved: false
    });

    req.flash('success', 'Review submitted for approval');
    res.redirect('/reviews');
  } catch (err) {
    console.error('Error submitting review:', err);
    req.flash('error', 'Something went wrong');
    res.redirect('/reviews');
  }
});

export default router;
