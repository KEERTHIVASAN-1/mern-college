const express = require('express');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const User = require('../models/User');
const { authenticateToken, authorize, checkOwnership } = require('../middleware/auth');
const { validateQuestion, validatePagination, validateObjectId } = require('../middleware/validation');
const { notifyTeachersNewQuestion } = require('../utils/notificationHelper');

const router = express.Router();

// Get all questions with pagination and filtering
router.get('/', validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Apply filters
    if (req.query.category) filter.category = req.query.category;
    if (req.query.isResolved !== undefined) filter.isResolved = req.query.isResolved === 'true';
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.tags) filter.tags = { $in: req.query.tags.split(',') };
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const questions = await Question.find(filter)
      .populate('author', 'name avatar role')
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
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Error fetching questions' });
  }
});

// Get single question with answers
router.get('/:id', validateObjectId('id'), async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'name avatar role department')
      .populate('likes', 'name')
      .lean();

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Increment view count
    await Question.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    // Get answers with comments
    const answers = await Answer.find({ question: req.params.id })
      .populate('author', 'name avatar role')
      .populate('likes', 'name')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'name avatar role'
        }
      })
      .sort({ createdAt: 1 })
      .lean();

    res.json({
      success: true,
      question,
      answers
    });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ message: 'Error fetching question' });
  }
});

// Create new question
router.post('/', authenticateToken, validateQuestion, async (req, res) => {
  try {
    console.log('📝 Creating question:', {
      title: req.body.title,
      author: req.user._id,
      userRole: req.user.role
    });

    const questionData = {
      ...req.body,
      author: req.user._id
    };

    const question = new Question(questionData);
    await question.save();

    console.log('✅ Question saved successfully:', question._id);

    await question.populate('author', 'name avatar role');
    
    // Send notification to all teachers about the new question
    await notifyTeachersNewQuestion(question);

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      question
    });
  } catch (error) {
    console.error('❌ Create question error:', error);
    res.status(500).json({ message: 'Error creating question' });
  }
});

// Update question
router.put('/:id', authenticateToken, validateObjectId('id'), checkOwnership(Question), validateQuestion, async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'name avatar role');

    res.json({
      success: true,
      message: 'Question updated successfully',
      question
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ message: 'Error updating question' });
  }
});

// Delete question
router.delete('/:id', authenticateToken, validateObjectId('id'), checkOwnership(Question), async (req, res) => {
  try {
    // Also delete associated answers and comments
    await Answer.deleteMany({ question: req.params.id });
    await Question.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ message: 'Error deleting question' });
  }
});

// Like/Unlike question
router.post('/:id/like', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const userId = req.user._id;
    const isLiked = question.likes.includes(userId);

    if (isLiked) {
      question.likes.pull(userId);
    } else {
      question.likes.push(userId);
    }

    await question.save();

    res.json({
      success: true,
      message: isLiked ? 'Question unliked' : 'Question liked',
      likes: question.likes.length,
      isLiked: !isLiked
    });
  } catch (error) {
    console.error('Like question error:', error);
    res.status(500).json({ message: 'Error updating like status' });
  }
});

// Mark question as resolved
router.patch('/:id/resolve', authenticateToken, validateObjectId('id'), checkOwnership(Question), async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { isResolved: true },
      { new: true }
    ).populate('author', 'name avatar role');

    res.json({
      success: true,
      message: 'Question marked as resolved',
      question
    });
  } catch (error) {
    console.error('Resolve question error:', error);
    res.status(500).json({ message: 'Error resolving question' });
  }
});

// Get user's questions
router.get('/user/:userId', validateObjectId('userId'), validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const questions = await Question.find({ author: req.params.userId })
      .populate('author', 'name avatar role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Question.countDocuments({ author: req.params.userId });

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
    console.error('Get user questions error:', error);
    res.status(500).json({ message: 'Error fetching user questions' });
  }
});

module.exports = router;
