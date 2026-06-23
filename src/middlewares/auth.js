const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;
  // Get token from cookie or Authorization header
  if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    // If it's an API request, return JSON; if it's a view, redirect to login
    if (req.accepts('html')) {
      return res.redirect('/login');
    }
    return res.status(401).json({ success: false, error: 'Not authorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      throw new Error('User not found');
    }
    next();
  } catch (err) {
    if (req.accepts('html')) {
      return res.redirect('/login');
    }
    res.status(401).json({ success: false, error: 'Not authorized' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.redirect('/login');
    }
    if (!roles.includes(req.user.role)) {
      if (req.accepts('html')) {
        return res.status(403).send('Forbidden - insufficient permissions');
      }
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    next();
  };
};