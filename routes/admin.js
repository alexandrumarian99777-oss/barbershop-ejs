const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');
const Barber = require('../models/Barber');
const { isAuthenticated } = require('../middlewares/auth');
const { sendAppointmentConfirmation, sendAppointmentCancellation } = require('../utils/mailer');
const upload = require('../middlewares/upload'); // Only declare once

/* ===========================
   LOGIN
=========================== */

// Login Page
router.get('/login', (req, res) => {
  if (req.session.adminId) return res.redirect('/admin/dashboard');

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

/* ===========================
   DASHBOARD
=========================== */

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

/* ===========================
   APPOINTMENT ACTIONS
=========================== */

// Confirm Appointment
router.post('/appointments/:id/confirm', isAuthenticated, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'confirmed' },
      { new: true }
    ).populate('barber');

    if (!appointment) {
      req.flash('error', 'Appointment not found');
      return res.redirect('/admin/dashboard');
    }

    // Send confirmation email ONLY when admin confirms
    await sendAppointmentConfirmation(appointment, appointment.barber);

    req.flash('success', 'Appointment confirmed and email sent!');
    res.redirect('/admin/dashboard');

  } catch (error) {
    console.error(error);
    req.flash('error', 'Error confirming appointment');
    res.redirect('/admin/dashboard');
  }
});

// Cancel Appointment + auto-delete
router.post('/appointments/:id/cancel', isAuthenticated, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    ).populate('barber');

    await sendAppointmentCancellation(appointment, appointment.barber);

    setTimeout(async () => {
      try {
        await Appointment.findByIdAndDelete(req.params.id);
        console.log(`Auto-deleted cancelled appointment ${req.params.id}`);
      } catch (err) {
        console.error('Auto-delete error:', err);
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

// Manual Delete Appointment
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

/* ===========================
   EDIT APPOINTMENT
=========================== */

router.get('/appointments/:id/edit', isAuthenticated, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).lean();
    const barbers = await Barber.find().lean();

    if (!appointment) {
      req.flash('error', 'Appointment not found');
      return res.redirect('/admin/dashboard');
    }

    res.render('admin/edit-appointment', {
      title: 'Edit Appointment',
      appointment,
      barbers,
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error loading appointment');
    res.redirect('/admin/dashboard');
  }
});

router.post('/appointments/:id/edit', isAuthenticated, async (req, res) => {
  const { customerName, customerEmail, customerPhone, barber, service, date, time, notes } = req.body;

  try {
    await Appointment.findByIdAndUpdate(req.params.id, {
      customerName,
      customerEmail,
      customerPhone,
      barber,
      service,
      date,
      time,
      notes
    });

    req.flash('success', 'Appointment updated successfully!');
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to update appointment');
    res.redirect(`/admin/appointments/${req.params.id}/edit`);
  }
});

/* ===========================
   REVIEWS
=========================== */

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

/* ===========================
   LOGOUT
=========================== */

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

/* ===========================
   BARBERS
=========================== */

// GET Add Barber page
router.get('/add-barber', isAuthenticated, (req, res) => {
  res.render('admin/add-barber', {
    title: 'Add Barber',
    success: req.flash('success'),
    error: req.flash('error')
  });
});

// POST Add Barber with image upload
router.post('/add-barber', isAuthenticated, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      req.flash('error', 'Image is required.');
      return res.redirect('/admin/add-barber');
    }

    const barber = new Barber({
      name: req.body.name,
      specialty: req.body.specialty,
      experience: req.body.experience,
      workingHours: req.body.workingHours,
      bio: req.body.bio,
      image: '/uploads/' + req.file.filename,
      available: true
    });

    await barber.save();
    req.flash('success', 'Barber added successfully!');
    res.redirect('/admin/dashboard');

  } catch (err) {
    console.error('Add Barber Error:', err);
    req.flash('error', 'Failed to add barber');
    res.redirect('/admin/add-barber');
  }
});

// DELETE Barber
router.post('/delete-barber/:id', isAuthenticated, async (req, res) => {
  try {
    await Barber.findByIdAndDelete(req.params.id);
    req.flash('success', 'Barber deleted!');
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error deleting barber');
    res.redirect('/admin/dashboard');
  }
});
// API to get booked times for a specific barber and date
router.get('/booked-times/:barberId/:date', async (req, res) => {
  try {
    const { barberId, date } = req.params;

    // Find all confirmed appointments for this barber and date
    const appointments = await Appointment.find({
      barber: barberId,
      date,
      status: 'confirmed'
    });

    // Map to array of times
    const times = appointments.map(a => a.time);

    res.json({ times }); // return array of booked times
  } catch (err) {
    console.error('Error fetching booked times:', err);
    res.status(500).json({ times: [] });
  }
});

module.exports = router;
