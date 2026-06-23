// src/services/authService.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - { name, email, password, role }
   * @returns {Promise<User>} - the saved user document
   */
  async register(userData) {
    // The User model's pre-save hook will hash the password automatically
    const user = new User(userData);
    await user.save();
    return user;
  }

  /**
   * Login a user and return a JWT token
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<{ token: string, user: User }>}
   * @throws {Error} if credentials invalid
   */
  async login(email, password) {
    // 1. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // 2. Compare password using the model's comparePassword method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // 3. Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key_here',
      { expiresIn: '7d' }
    );

    return { token, user };
  }

  /**
   * Verify a JWT token and return the decoded payload
   * @param {string} token 
   * @returns {Object} - decoded payload
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key_here');
    } catch (err) {
      throw new Error('Invalid or expired token');
    }
  }
}


module.exports = new AuthService();