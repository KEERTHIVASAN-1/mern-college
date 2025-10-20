const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log('🔐 Auth check:', {
      hasAuthHeader: !!authHeader,
      hasToken: !!token,
      path: req.path,
      method: req.method
    });

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-__v');
    
    console.log('👤 User found:', {
      userId: user?._id,
      email: user?.email,
      role: user?.role,
      isActive: user?.isActive
    });
    
    if (!user || !user.isActive) {
      console.log('❌ Invalid or inactive user');
      return res.status(401).json({ message: 'Invalid or inactive user' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      console.log('❌ Invalid JWT token');
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      console.log('❌ Expired JWT token');
      return res.status(401).json({ message: 'Token expired' });
    }
    console.error('❌ Auth middleware error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};

// Middleware to check user roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};

// Middleware to check if user owns the resource
const checkOwnership = (resourceModel, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      const resource = await resourceModel.findById(resourceId);

      if (!resource) {
        return res.status(404).json({ message: 'Resource not found' });
      }

      // Admin and teachers can access any resource
      if (req.user.role === 'admin' || req.user.role === 'teacher') {
        req.resource = resource;
        return next();
      }

      // Check if user owns the resource
      if (resource.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({ message: 'Error checking resource ownership' });
    }
  };
};

module.exports = {
  authenticateToken,
  authorize,
  checkOwnership
};
