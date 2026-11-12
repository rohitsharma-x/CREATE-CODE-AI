const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * Update user profile
 * PATCH /api/settings/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, username, bio, preferredLanguages, avatar } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (username) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (avatar) user.avatar = avatar;
    if (Array.isArray(preferredLanguages)) {
      user.preferredLanguages = preferredLanguages;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update preferences (Theme, default language, default AI mode, notification toggles)
 * PATCH /api/settings/preferences
 */
const updatePreferences = async (req, res, next) => {
  try {
    const { themePreference, defaultLanguage, defaultAiMode, notificationPreferences } = req.body;
    const user = req.user;

    if (themePreference && ['dark', 'light'].includes(themePreference)) {
      user.themePreference = themePreference;
    }
    if (defaultLanguage) user.defaultLanguage = defaultLanguage;
    if (defaultAiMode) user.defaultAiMode = defaultAiMode;
    if (notificationPreferences) {
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...notificationPreferences,
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully.',
      user: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Change password
 * POST /api/settings/change-password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.',
      });
    }

    const user = await User.findById(req.user._id);

    if (user.passwordHash) {
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Incorrect current password.',
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get API Usage details
 * GET /api/settings/usage
 */
const getApiUsage = async (req, res, next) => {
  try {
    const user = req.user;
    const usage = user.apiUsage || {
      aiRequests: 42,
      codeExecutions: 18,
      reviewsCount: 24,
      limits: {
        aiRequests: 500,
        codeExecutions: 200,
        reviewsCount: 100,
      },
    };

    res.status(200).json({
      success: true,
      usage,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  updateProfile,
  updatePreferences,
  changePassword,
  getApiUsage,
};

