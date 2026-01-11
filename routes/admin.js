// routes/admin.js
import express from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import csrf from 'csurf';
import fs from 'fs';

import Admin from '../models/Admin.js';
import Barber from '../models/Barber.js';
import Appointment from '../models/Appointment.js';
import Review from '../models/Review.js';

const router = express.Router();
const csrfProtection = csrf({ cookie: false });

// Multer config for barber images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'public/uploads/barbers';
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Admin authentication middleware
function isAdmin(req, res, next) {
  if (req.session?.adminId) return next();
  req.flash('error', 'You must log in');
  res.redirect('/admin/login');
}

// ===== LOGIN =====
router.get('/login', csrfProtection, (req, res) => {
  res.render('admin/login', {
    csrfToken: req.csrfToken(),
    error: req.flash('error'),
    title: 'Admin Login'
  });
});

router.post('/login', csrfProtection, async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin || !(await admin.comparePassword(password))) {
    req.flash('error', 'Invalid credentials');
    return res.redirect('/admin/login');
  }
  req.session.adminId = admin._id;
  res.redirect('/admin/dashboard');
});

// ===== LOGOUT =====
router.get('/logout', isAdmin, (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

// ===== DASHBOARD =====
router.get('/dashboard', isAdmin, csrfProtection, async (req, res) => {
  const [reviews, barbers] = await Promise.all([
    Review.find(),
    Barber.find()
  ]);

  let appointments;

  if (req.session.barberId) {
    // Barber login: show only their appointments
    appointments = await Appointment.find({ barber: req.session.barberId }).populate('barber');
  } else {
    // Admin login: show all
    appointments = await Appointment.find().populate('barber');
  }

  const stats = {
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    total: appointments.length,
    reviews: reviews.filter(r => !r.approved).length
  };

  res.render('admin/dashboard', {
    appointments,
    reviews,
    barbers,
    stats,
    csrfToken: req.csrfToken(),
    success: req.flash('success'),
    error: req.flash('error'),
    title: 'Admin Dashboard'
  });
});


// ===== ADD BARBER =====
router.post('/add-barber', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, specialty, experience, bio, workingHours } = req.body;
    if (!name) {
      req.flash('error', 'Name is required');
      return res.redirect('/admin/dashboard');
    }

    const newBarber = new Barber({
      name,
      specialty: specialty || '',
      experience: experience ? Number(experience) : 0,
      bio: bio || '',
      workingHours: workingHours || '',
      image: req.file?.filename || 'default.jpg'
    });

    await newBarber.save();
    req.flash('success', 'Barber added successfully');
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error('💥 Barber creation error:', err);
    req.flash('error', 'Something went wrong while adding the barber.');
    res.redirect('/admin/dashboard');
  }
});


// ===== DELETE BARBER =====
router.post('/delete-barber/:id', isAdmin, csrfProtection, async (req, res) => {
  await Barber.findByIdAndDelete(req.params.id);
  req.flash('success', 'Barber deleted successfully');
  res.redirect('/admin/dashboard');
});

// ===== APPOINTMENTS =====
router.post('/appointments/:id/confirm', isAdmin, csrfProtection, async (req, res) => {
  await Appointment.findByIdAndUpdate(req.params.id, { status: 'confirmed' });
  req.flash('success', 'Appointment confirmed');
  res.redirect('/admin/dashboard');
});

router.post('/appointments/:id/cancel', isAdmin, csrfProtection, async (req, res) => {
  await Appointment.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
  req.flash('success', 'Appointment cancelled');
  res.redirect('/admin/dashboard');
});

router.post('/appointments/:id/delete', isAdmin, csrfProtection, async (req, res) => {
  await Appointment.findByIdAndDelete(req.params.id);
  req.flash('success', 'Appointment deleted');
  res.redirect('/admin/dashboard');
});

// ===== REVIEWS =====
router.post('/reviews/:id/approve', isAdmin, csrfProtection, async (req, res) => {
  await Review.findByIdAndUpdate(req.params.id, { approved: true });
  req.flash('success', 'Review approved');
  res.redirect('/admin/dashboard');
});

router.post('/reviews/:id/delete', isAdmin, csrfProtection, async (req, res) => {
  await Review.findByIdAndDelete(req.params.id);
  req.flash('success', 'Review deleted');
  res.redirect('/admin/dashboard');
});

export default router;
