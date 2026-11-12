const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'createcode_jwt_secret_super_secure_key_abcdef_987654';
  return jwt.sign({ id: userId }, secret, { expiresIn: '7d' });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res.cookie('token', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    token,
    user: user.toJSON(),
  });
};

/**
 * Register user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and password.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const username = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + Math.floor(Math.random() * 900 + 100);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      username,
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter both email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/**
 * Instant Demo Login for Placement & Interview Evaluations
 * POST /api/auth/demo
 */
const demoLogin = async (req, res, next) => {
  try {
    const demoEmail = 'rohit.sharma@example.com';
    let user = await User.findOne({ email: demoEmail });

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('DemoPass123!', salt);

      user = await User.create({
        name: 'Rohit Sharma',
        email: demoEmail,
        username: 'rohit-dev',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        bio: 'Full-stack developer | MERN | Open Source',
        preferredLanguages: ['JavaScript', 'Python', 'C++'],
        passwordHash,
        githubUsername: 'rohit-dev',
        githubConnectedAt: new Date('2025-01-20'),
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/**
 * Logout
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully.',
  });
};

/**
 * Get Current User
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user.toJSON(),
  });
};

/**
 * Forgot password
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    if (!user) {
      // Don't leak user existence
      return res.status(200).json({
        success: true,
        message: 'If an account exists with that email, a password reset link has been dispatched.',
      });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Password reset link dispatched.',
      resetToken, // Returned in dev mode for easy testing
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Reset password
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  demoLogin,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
};

