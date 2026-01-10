import express from 'express';
import bcrypt from 'bcryptjs';
import csrf from 'csurf';
import Barber from '../models/Barber.js';
import Appointment from '../models/Appointment.js';

const router = express.Router();
const csrfProtection = csrf({ cookie: false });

// Middleware to check if barber is logged in
export function isBarber(req, res, next) {
  if (req.session?.barberId) return next();
  req.flash('error', 'You must log in');
  res.redirect('/barber/login');
}

// ===== BARBER LOGIN =====
router.get('/login', csrfProtection, (req, res) => {
  res.render('barber/login', {
    csrfToken: req.csrfToken(),
    error: req.flash('error'),
    title: 'Barber Login'
  });
});

router.post('/login', csrfProtection, async (req, res) => {
  const { email, password } = req.body;
  const barber = await Barber.findOne({ email });
  if (!barber || !(await bcrypt.compare(password, barber.password))) {
    req.flash('error', 'Invalid credentials');
    return res.redirect('/barber/login');
  }

  req.session.barberId = barber._id; // store barber ID in session
  res.redirect('/barber/dashboard');
});

// ===== BARBER LOGOUT =====
router.get('/logout', isBarber, (req, res) => {
  req.session.destroy(() => res.redirect('/barber/login'));
});

// ===== BARBER DASHBOARD =====
router.get('/dashboard', isBarber, csrfProtection, async (req, res) => {
  try {
    const barber = await Barber.findById(req.session.barberId).lean();
    const appointments = await Appointment.find({ barber: req.session.barberId }).populate('barber').lean();

    const stats = {
      pending: appointments.filter(a => a.status === 'pending').length,
      confirmed: appointments.filter(a => a.status === 'confirmed').length,
      total: appointments.length
    };

    res.render('barber/dashboard', {
      barber,
      appointments,
      stats,
      csrfToken: req.csrfToken(),
      success: req.flash('success'),
      error: req.flash('error'),
      title: 'Barber Dashboard'
    });
  } catch (err) {
    console.error('Barber dashboard error:', err);
    res.status(500).render('500', { message: 'Server error', stack: err.stack });
  }
});

export default router;
