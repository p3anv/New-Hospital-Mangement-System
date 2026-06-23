// src/controllers/authController.js
const authService = require('../services/authService');

exports.showLogin = (req, res) => {
  res.render('login', { 
    error: null, 
    success: null 
  });
};

exports.showRegister = (req, res) => {
  res.render('register', { 
    error: null, 
    success: null 
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;
    
    // 1. Check if passwords match
    if (password !== confirmPassword) {
      return res.render('register', { 
        error: 'Passwords do not match!', 
        success: null 
      });
    }
    
    // 2. Check if user already exists
    const User = require('../models/User');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('register', { 
        error: 'Email already registered!', 
        success: null 
      });
    }
    
    // 3. SECURITY: Only allow patient & receptionist to self-register
    const allowedRoles = ['patient', 'receptionist'];
    if (!allowedRoles.includes(role)) {
      return res.render('register', { 
        error: 'Invalid role selection.', 
        success: null 
      });
    }
    
    // 4. Create user
    const user = await authService.register({ name, email, password, role });
    
    // 5. Auto-login after registration
    const { token } = await authService.login(email, password);
    res.cookie('token', token, { httpOnly: true });
    
    // 6. Flash success message and redirect
    req.flash('success', 'Registration successful! Welcome aboard.');
    res.redirect('/dashboard');
    
  } catch (err) {
    console.error('Registration error:', err);
    res.render('register', { 
      error: err.message || 'Registration failed. Please try again.', 
      success: null 
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.login(email, password);
    res.cookie('token', token, { httpOnly: true });
    req.flash('success', `Welcome back, ${user.name}!`);
    res.redirect('/dashboard');
  } catch (err) {
    res.render('login', { 
      error: err.message || 'Invalid email or password.', 
      success: null 
    });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  req.flash('success', 'Logged out successfully.');
  res.redirect('/login');
};