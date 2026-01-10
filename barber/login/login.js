const Barber = require('../models/Barber');
const bcrypt = require('bcryptjs'); // optional if you store passwords

router.post('/barber/login', async (req, res) => {
  const { email } = req.body;

  const barber = await Barber.findOne({ email });
  if (!barber) return res.render('barber/login', { error: 'Invalid credentials' });

  // if using passwords:
  // const match = await bcrypt.compare(password, barber.password);
  // if (!match) return res.render('barber/login', { error: 'Invalid credentials' });

  req.session.barber = {
    id: barber._id,
    role: barber.role
  };

  res.redirect('/barber/dashboard');
});
