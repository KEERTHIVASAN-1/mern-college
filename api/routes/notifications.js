const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Get all notifications for the current user
router.get('/', authenticateToken, function(req, res) {
  try {
    User.findById(req.user.id)
      .then(user => {
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        res.json({ notifications: user.notifications });
      })
      .catch(err => {
        console.error('Error fetching notifications:', err);
        res.status(500).json({ message: 'Server error' });
      });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/:notificationId/read', authenticateToken, function(req, res) {
  try {
    User.findById(req.user.id)
      .then(user => {
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        const notification = user.notifications.id(req.params.notificationId);
        if (!notification) {
          return res.status(404).json({ message: 'Notification not found' });
        }
        
        notification.isRead = true;
        return user.save();
      })
      .then(updatedUser => {
        const notification = updatedUser.notifications.id(req.params.notificationId);
        res.json({ notification });
      })
      .catch(err => {
        console.error('Error marking notification as read:', err);
        res.status(500).json({ message: 'Server error' });
      });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticateToken, function(req, res) {
  try {
    User.findById(req.user.id)
      .then(user => {
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        user.notifications.forEach(notification => {
          notification.isRead = true;
        });
        
        return user.save();
      })
      .then(() => {
        res.json({ message: 'All notifications marked as read' });
      })
      .catch(err => {
        console.error('Error marking all notifications as read:', err);
        res.status(500).json({ message: 'Server error' });
      });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a notification
router.delete('/:notificationId', authenticateToken, function(req, res) {
  try {
    User.findById(req.user.id)
      .then(user => {
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        user.notifications.pull(req.params.notificationId);
        return user.save();
      })
      .then(() => {
        res.json({ message: 'Notification deleted' });
      })
      .catch(err => {
        console.error('Error deleting notification:', err);
        res.status(500).json({ message: 'Server error' });
      });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;