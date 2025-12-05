const express = require('express');
const router = express.Router();
const Barber = require('../models/Barber');
const Review = require('../models/Review');

router.get('/', async (req, res) => {
  try {
    const barbers = await Barber.find({ available: true }).limit(3);
    const reviews = await Review.find({ approved: true }).sort('-createdAt').limit(6);
    
    res.render('index', {
      title: 'Classic Cuts Barbershop',
      barbers,
      reviews,
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;