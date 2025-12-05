const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');
const Barber = require('../models/Barber');
const { isAuthenticated } = require('../middleware/auth');
const { sendAppointmentConfirmation, sendAppointmentCancellation } = require('../utils/mailer');

// Login Page
router.get('/login', (req, res) => {
  if (req.session.adminId) {
    return res.redirect('/admin/dashboard');
  }
  res.render('admin/login', {
    title: 'Admin Login',
    error: req.flash('error')
  });
});

// Login Handler
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    
    if (!admin || !(await admin.comparePassword(password))) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/admin/login');
    }

    req.session.adminId = admin._id;
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Login error. Please try again.');
    res.redirect('/admin/login');
  }
});

// Dashboard
router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('barber')
      .sort('-createdAt');
    const reviews = await Review.find().sort('-createdAt');
    const barbers = await Barber.find();

    const stats = {
      pending: await Appointment.countDocuments({ status: 'pending' }),
      confirmed: await Appointment.countDocuments({ status: 'confirmed' }),
      total: await Appointment.countDocuments(),
      reviews: await Review.countDocuments({ approved: false })
    };

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      appointments,
      reviews,
      barbers,
      stats,
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Confirm Appointment
router.post('/appointments/:id/confirm', isAuthenticated, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'confirmed' },
      { new: true }
    ).populate('barber');

    await sendAppointmentConfirmation(appointment, appointment.barber);

    req.flash('success', 'Appointment confirmed and email sent!');
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error confirming appointment');
    res.redirect('/admin/dashboard');
  }
});

// Cancel Appointment
// Cancel Appointment
router.post('/appointments/:id/cancel', isAuthenticated, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    ).populate('barber');

    await sendAppointmentCancellation(appointment, appointment.barber);

    req.flash('success', 'Appointment cancelled and email sent!');
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error cancelling appointment');
    res.redirect('/admin/dashboard');
  }
});

// Cancel Appointment (delete after 5 seconds)
router.post('/appointments/:id/cancel', isAuthenticated, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    ).populate('barber');

    // Send cancellation email
    await sendAppointmentCancellation(appointment, appointment.barber);

    // Schedule deletion in 5 seconds
    setTimeout(async () => {
      try {
        await Appointment.findByIdAndDelete(req.params.id);
        console.log(`Appointment ${req.params.id} deleted after cancellation`);
      } catch (deleteErr) {
        console.error("Delete error:", deleteErr);
      }
    }, 5000);

    req.flash('success', 'Appointment cancelled. It will be removed in 5 seconds.');
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error cancelling appointment');
    res.redirect('/admin/dashboard');
  }
});
// Delete Appointment Permanently
router.post('/appointments/:id/delete', isAuthenticated, async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);

    req.flash('success', 'Appointment deleted permanently.');
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error deleting appointment');
    res.redirect('/admin/dashboard');
  }
});


// Update Appointment
router.post('/appointments/:id/update', isAuthenticated, async (req, res) => {
  try {
    await Appointment.findByIdAndUpdate(req.params.id, {
      date: req.body.date,
      time: req.body.time,
      notes: req.body.notes
    });

    req.flash('success', 'Appointment updated successfully!');
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error updating appointment');
    res.redirect('/admin/dashboard');
  }
});

// Approve Review
router.post('/reviews/:id/approve', isAuthenticated, async (req, res) => {
  try {
    await Review.findByIdAndUpdate(req.params.id, { approved: true });
    req.flash('success', 'Review approved!');
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error approving review');
    res.redirect('/admin/dashboard');
  }
});

// Delete Review
router.post('/reviews/:id/delete', isAuthenticated, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    req.flash('success', 'Review deleted!');
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error deleting review');
    res.redirect('/admin/dashboard');
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

module.exports = router;