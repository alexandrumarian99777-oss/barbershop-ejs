const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Barber = require('../models/Barber');

// Allowed time slots (00 and 30 minutes only)
function isValidTimeSlot(time) {
  const regex = /^([01]\d|2[0-3]):(00|30)$/;
  return regex.test(time);
}

// GET /booking - show booking form
router.get('/', async (req, res) => {
  try {
    const barbers = await Barber.find().lean();
    res.render('booking', {
      title: 'Book Appointment',
      barbers,
      errors: [],
      oldInput: {},
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (err) {
    console.error('GET /booking error:', err);
    res.status(500).render('500', { message: 'Server error loading booking page', stack: err.stack });
  }
});

// POST /booking - create appointment
router.post('/', async (req, res) => {
  const { customerName, customerEmail, customerPhone, date, time, service, barber, notes } = req.body;
  const barbers = await Barber.find().lean(); 
  const errors = [];

  if (!customerName) errors.push({ msg: 'Name is required' });
  if (!customerEmail) errors.push({ msg: 'Email is required' });
  if (!customerPhone) errors.push({ msg: 'Phone is required' });
  if (!date) errors.push({ msg: 'Date is required' });
  if (!time) errors.push({ msg: 'Time is required' });
  if (time && !isValidTimeSlot(time)) errors.push({ msg: 'Invalid time — choose a :00 or :30 slot' });
  if (!service) errors.push({ msg: 'Service is required' });
  if (!barber) errors.push({ msg: 'Please select a barber' });

  // Check if slot is already booked (confirmed appointments only)
  const existing = await Appointment.findOne({
    barber,
    date,
    time,
    status: 'confirmed'
  });

  if (existing) {
    errors.push({ msg: 'This barber is already booked at the selected date and time. Please choose another slot.' });
  }

  if (errors.length > 0) {
    return res.status(400).render('booking', {
      title: 'Book Appointment',
      barbers,
      errors,
      oldInput: req.body,
      success: req.flash('success'),
      error: req.flash('error')
    });
  }

  try {
    await Appointment.create({
      customerName,
      customerEmail,
      customerPhone,
      barber,
      service,
      date,
      time,
      notes,
      status: 'pending'
    });

    return res.redirect('/booking/success');
  } catch (err) {
    console.error('POST /booking unexpected error:', err);
    return res.status(500).render('booking', {
      title: 'Book Appointment',
      barbers,
      errors: [{ msg: 'Unexpected server error — please try again later.' }],
      oldInput: req.body,
      success: req.flash('success'),
      error: req.flash('error')
    });
  }
});

// GET booked times for a specific barber on a specific date
router.get('/booked-times/:barberId/:date', async (req, res) => {
  try {
    const { barberId, date } = req.params;

    // Only confirmed appointments block the slot
    const appointments = await Appointment.find({
      barber: barberId,
      date,
      status: 'confirmed'
    }).lean();

    const bookedTimes = appointments.map(a => a.time);
    return res.json({ times: bookedTimes });
  } catch (err) {
    console.error('Error fetching booked times:', err);
    return res.status(500).json({ times: [] });
  }
});

// GET booking success page
router.get('/success', (req, res) => {
  res.render('success', { title: 'Booking Successful' });
});

module.exports = router;
