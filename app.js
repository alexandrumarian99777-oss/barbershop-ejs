// app.js
import 'dotenv/config';
import express from 'express';
import path from 'path';
import session from 'express-session';
import flash from 'connect-flash';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';

// Import routes (ESM)
import indexRouter from './routes/index.js';
import bookingRouter from './routes/booking.js';
import reviewsRouter from './routes/reviews.js';
import adminRouter from './routes/admin.js';
import barberRouter from './routes/barber.js';

const app = express();

// __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use('/barber', barberRouter);

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
