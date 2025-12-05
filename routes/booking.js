// routes/booking.js
const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Barber = require('../models/Barber');
const { sendAppointmentConfirmation } = require('../utils/mailer');

// Allowed time slots (00 and 30 minutes only)
function isValidTimeSlot(time) {
  const regex = /^([01]\d|2[0-3]):(00|30)$/;
  return regex.test(time);
}

// GET /booking
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

// POST /booking
router.post('/', async (req, res) => {
  const { customerName, customerEmail, customerPhone, date, time, service, barber, notes } = req.body;
  const barbers = await Barber.find().lean(); // always load for re-render

  const errors = [];
  if (!customerName || !customerName.trim()) errors.push({ msg: 'Name is required' });
  if (!customerEmail || !customerEmail.trim()) errors.push({ msg: 'Email is required' });
  if (!customerPhone || !customerPhone.trim()) errors.push({ msg: 'Phone is required' });
  if (!date) errors.push({ msg: 'Date is required' });
  if (!time) errors.push({ msg: 'Time is required' });
  if (time && !isValidTimeSlot(time)) errors.push({ msg: 'Invalid time — choose a :00 or :30 slot' });
  if (!service) errors.push({ msg: 'Service is required' });
  if (!barber) errors.push({ msg: 'Please select a barber' });

  if (errors.length > 0) {
    // Render the form with errors and previously entered values
    return res.status(400).render('booking', {
      title: 'Book Appointment',
      barbers,
      errors,
      oldInput: { customerName, customerEmail, customerPhone, date, time, service, barber, notes },
      success: req.flash('success'),
      error: req.flash('error')
    });
  }

  try {
    const appointment = await Appointment.create({
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

    // find barber for email content (if exists)
    const barberDoc = await Barber.findById(barber).lean();

    // send confirmation email (wrap in try/catch so email failure doesn't block)
    try {
      await sendAppointmentConfirmation(appointment, barberDoc);
    } catch (mailErr) {
      console.error('Email send error (non-fatal):', mailErr);
      // do not fail the whole request just because email failed
    }

    req.flash('success', 'Appointment booked successfully! Check your email for confirmation.');
    return res.redirect('/booking');
  } catch (err) {
    console.error('POST /booking unexpected error:', err);
    return res.status(500).render('booking', {
      title: 'Book Appointment',
      barbers,
      errors: [{ msg: 'Unexpected server error — please try again later.' }],
      oldInput: { customerName, customerEmail, customerPhone, date, time, service, barber, notes },
      success: req.flash('success'),
      error: req.flash('error')
    });
  }
});

module.exports = router;
