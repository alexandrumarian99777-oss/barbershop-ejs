module.exports = (req, res, next) => {
  if (!req.session.barber) {
    return res.redirect('/barber/login');
  }
  next();
};
