require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const connectDB = require('./config/database');

const indexRouter = require('./routes/index');
const bookingRouter = require('./routes/booking');
const reviewsRouter = require('./routes/reviews');
const adminRouter = require('./routes/admin');

const app = express();

// Connect to Database
connectDB();

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session & Flash
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24*60*60*1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
}));
app.use(flash());

// Routes
app.use('/', indexRouter);
app.use('/booking', bookingRouter);
app.use('/reviews', reviewsRouter);
app.use('/admin', adminRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).send('Page Not Found');
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('=== SERVER ERROR ===');
  console.error(err && err.stack ? err.stack : err);

  const isDev = (process.env.NODE_ENV || 'development') === 'development';

  res.status(500).render('500', {
    message: isDev ? err.message : 'Something went wrong. Our team has been notified.',
    stack: isDev ? err.stack : '',
    title: 'Error'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Admin panel: http://localhost:${PORT}/admin/login`);
});
