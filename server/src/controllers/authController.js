const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/User');

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET ,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

// Cookie configuration options
const getCookieOptions = () => ({
  httpOnly: true,
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
sameSite:
    process.env.NODE_ENV === 'production'
      ? 'none'
      : 'lax'
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Basic request validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.'
      });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    // Create new user (password is automatically hashed by Mongoose pre-save hook)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password
    });

    const token = generateToken(user._id);

    // Store token in cookie
    res.cookie('token', token, getCookieOptions());

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
     
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token (stored in cookie)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    // Find user by email and explicitly include password field
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Verify password match
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user._id);

    // Store token in cookie
    res.cookie('token', token, getCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user & expire token cookie
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res) => {
  // Read token from req (cookie or headers)
  const token =
    (req.cookies && req.cookies.token) ||
    (req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ') &&
      req.headers.authorization.split(' ')[1]);

  // Expire and clear the token cookie immediately
  res.cookie('token', '', {
    ...getCookieOptions(),
    expires: new Date(0) // Expire immediately in the past
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully.'
  });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt
    }
  });
};

module.exports = {
  register,
  login,
  logout,
  getMe
};
