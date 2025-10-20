const express = require('express');
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Comment = require('../models/Comment');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateUser, validatePagination } = require('../middleware/validation');

const router = express.Router();

// All admin routes require admin or teacher role
router.use(authenticateToken);
router.use(authorize('admin', 'teacher'));

// Dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalQuestions,
      totalAnswers,
      totalComments,
      resolvedQuestions,
      activeUsers,
      recentQuestions,
      topContributors
    ] = await Promise.all([
      User.countDocuments(),
      Question.countDocuments(),
      Answer.countDocuments(),
      Comment.countDocuments(),
      Question.countDocuments({ isResolved: true }),
      User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
      Question.find().populate('author', 'name').sort({ createdAt: -1 }).limit(5).lean(),
      User.aggregate([
        {
          $lookup: {
            from: 'questions',
            localField: '_id',
            foreignField: 'author',
            as: 'questions'
          }
        },
        {
          $lookup: {
            from: 'answers',
            localField: '_id',
            foreignField: 'author',
            as: 'answers'
          }
        },
        {
          $addFields: {
            totalContributions: { $add: [{ $size: '$questions' }, { $size: '$answers' }] }
          }
        },
        { $sort: { totalContributions: -1 } },
        { $limit: 5 },
        { $project: { name: 1, email: 1, role: 1, totalContributions: 1 } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers
        },
        content: {
          questions: totalQuestions,
          answers: totalAnswers,
          comments: totalComments,
          resolved: resolvedQuestions
        },
        recentQuestions,
        topContributors
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
});

// Get all users with pagination
router.get('/users', validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Update user role
router.patch('/users/:userId/role', async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    ).select('-__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Error updating user role' });
  }
});

// Toggle user active status
router.patch('/users/:userId/status', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ message: 'Error updating user status' });
  }
});

// Get all questions (admin view)
router.get('/questions', validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.isResolved !== undefined) filter.isResolved = req.query.isResolved === 'true';
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const questions = await Question.find(filter)
      .populate('author', 'name email role')
      .populate('likes', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Question.countDocuments(filter);

    res.json({
      success: true,
      questions,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    console.error('Get admin questions error:', error);
    res.status(500).json({ message: 'Error fetching questions' });
  }
});

// Archive/Unarchive question
router.patch('/questions/:questionId/archive', async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    question.isArchived = !question.isArchived;
    await question.save();

    res.json({
      success: true,
      message: `Question ${question.isArchived ? 'archived' : 'unarchived'} successfully`,
      question
    });
  } catch (error) {
    console.error('Archive question error:', error);
    res.status(500).json({ message: 'Error archiving question' });
  }
});

// Delete any question (admin only)
router.delete('/questions/:questionId', authorize('admin'), async (req, res) => {
  try {
    // Delete associated answers and comments
    const answers = await Answer.find({ question: req.params.questionId });
    const answerIds = answers.map(answer => answer._id);
    
    await Comment.deleteMany({ answer: { $in: answerIds } });
    await Answer.deleteMany({ question: req.params.questionId });
    await Question.findByIdAndDelete(req.params.questionId);

    res.json({
      success: true,
      message: 'Question and all associated content deleted successfully'
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ message: 'Error deleting question' });
  }
});

// Delete any answer (admin only)
router.delete('/answers/:answerId', authorize('admin'), async (req, res) => {
  try {
    // Delete associated comments
    await Comment.deleteMany({ answer: req.params.answerId });
    await Answer.findByIdAndDelete(req.params.answerId);

    res.json({
      success: true,
      message: 'Answer and all associated comments deleted successfully'
    });
  } catch (error) {
    console.error('Delete answer error:', error);
    res.status(500).json({ message: 'Error deleting answer' });
  }
});

// Get system logs (placeholder for future implementation)
router.get('/logs', async (req, res) => {
  try {
    // This would typically connect to a logging system
    res.json({
      success: true,
      message: 'Logs endpoint - implement with your preferred logging solution',
      logs: []
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ message: 'Error fetching logs' });
  }
});

module.exports = router;
