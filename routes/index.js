import express from 'express';
const router = express.Router();

import Barber from '../models/Barber.js';
import Review from '../models/Review.js'; // make sure the filename matches exactly

router.get('/', async (req, res) => {
  try {
    // Fetch all barbers and approved reviews
    const [barbers, reviews] = await Promise.all([
      Barber.find(),                   // or Barber.find({ available: true }) if you want only active barbers
      Review.find({ approved: true })  // only approved reviews
    ]);

    res.render('index', {
      title: 'Classic Cuts Barbershop', // or 'Home'
      barbers,
      reviews,
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (err) {
    console.error('Error fetching homepage data:', err);
    res.status(500).send('Server error');
  }
});

export default router;
