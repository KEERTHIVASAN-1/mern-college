const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { validateUser } = require('../middleware/validation');

const router = express.Router();

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      // Generate JWT token
      const token = jwt.sign(
        { userId: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Update last login
      await User.findByIdAndUpdate(req.user._id, { lastLogin: new Date() });

      // Redirect to frontend with token and role
      const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/callback?token=${token}&role=${req.user.role}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=auth_failed`);
    }
  }
);

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-__v')
      .populate('department', 'name')
      .lean();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        department: user.department,
        studentId: user.studentId,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, validateUser, async (req, res) => {
  try {
    const { name, department, studentId } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (department) updateData.department = department;
    if (studentId) updateData.studentId = studentId;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        department: user.department,
        studentId: user.studentId
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Logout (client-side token removal)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
});

// Check if user exists by email (for admin purposes)
router.get('/check-email/:email', authenticateToken, async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('name email role isActive');

    if (!user) {
      return res.json({ exists: false });
    }

    res.json({
      exists: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({ message: 'Error checking email' });
  }
});

// Manual role update for testing (admin only)
router.patch('/update-role/:email', authenticateToken, async (req, res) => {
  try {
    // Check if current user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { email } = req.params;
    const { role } = req.body;

    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role },
      { new: true }
    ).select('name email role');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`✅ Manually updated user ${user.email} role to ${user.role}`);

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: 'Error updating role' });
  }
});

module.exports = router;
