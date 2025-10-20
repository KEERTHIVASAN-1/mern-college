const { body, param, query, validationResult } = require('express-validator');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUser = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('role')
    .optional()
    .isIn(['student', 'teacher', 'admin'])
    .withMessage('Role must be student, teacher, or admin'),
  handleValidationErrors
];

// Question validation rules
const validateQuestion = [
  body('title')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Content must be between 20 and 2000 characters'),
  body('category')
    .optional()
    .isIn(['academic', 'general', 'technical', 'administrative', 'other'])
    .withMessage('Invalid category'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  handleValidationErrors
];

// Answer validation rules
const validateAnswer = [
  body('content')
    .trim()
    .isLength({ min: 10, max: 3000 })
    .withMessage('Content must be between 10 and 3000 characters'),
  body('question')
    .isMongoId()
    .withMessage('Valid question ID is required'),
  handleValidationErrors
];

// Comment validation rules
const validateComment = [
  body('content')
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('Content must be between 5 and 1000 characters'),
  body('answer')
    .isMongoId()
    .withMessage('Valid answer ID is required'),
  handleValidationErrors
];

// MongoDB ObjectId validation
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} ID`),
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

module.exports = {
  validateUser,
  validateQuestion,
  validateAnswer,
  validateComment,
  validateObjectId,
  validatePagination,
  handleValidationErrors
};
