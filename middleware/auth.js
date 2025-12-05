const isAuthenticated = (req, res, next) => {
  if (req.session.adminId) {
    return next();
  }
  req.flash('error', 'Please log in to access this page');
  res.redirect('/admin/login');
};

module.exports = { isAuthenticated };