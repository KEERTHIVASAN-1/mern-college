const express = require('express');
const Answer = require('../models/Answer');
const Comment = require('../models/Comment');
const Question = require('../models/Question');
const { authenticateToken, authorize, checkOwnership } = require('../middleware/auth');
const { validateAnswer, validateComment, validatePagination, validateObjectId } = require('../middleware/validation');
const { notifyTeachersNewAnswer } = require('../utils/notificationHelper');

const router = express.Router();

// Get answers for a question
router.get('/question/:questionId', validateObjectId('questionId'), validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const answers = await Answer.find({ question: req.params.questionId })
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
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Answer.countDocuments({ question: req.params.questionId });

    res.json({
      success: true,
      answers,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    console.error('Get answers error:', error);
    res.status(500).json({ message: 'Error fetching answers' });
  }
});

// Create new answer
router.post('/', authenticateToken, validateAnswer, async (req, res) => {
  try {
    const answerData = {
      ...req.body,
      author: req.user._id
    };

    const answer = new Answer(answerData);
    await answer.save();

    await answer.populate('author', 'name avatar role');
    
    // Send notification to teachers about the new answer
    await notifyTeachersNewAnswer(answer);

    res.status(201).json({
      success: true,
      message: 'Answer created successfully',
      answer
    });
  } catch (error) {
    console.error('Create answer error:', error);
    res.status(500).json({ message: 'Error creating answer' });
  }
});

// Update answer
router.put('/:id', authenticateToken, validateObjectId('id'), checkOwnership(Answer), async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim().length < 10) {
      return res.status(400).json({ message: 'Answer content must be at least 10 characters' });
    }

    const answer = await Answer.findByIdAndUpdate(
      req.params.id,
      { content: content.trim() },
      { new: true, runValidators: true }
    ).populate('author', 'name avatar role');

    res.json({
      success: true,
      message: 'Answer updated successfully',
      answer
    });
  } catch (error) {
    console.error('Update answer error:', error);
    res.status(500).json({ message: 'Error updating answer' });
  }
});

// Delete answer
router.delete('/:id', authenticateToken, validateObjectId('id'), checkOwnership(Answer), async (req, res) => {
  try {
    // Also delete associated comments
    await Comment.deleteMany({ answer: req.params.id });
    await Answer.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Answer deleted successfully'
    });
  } catch (error) {
    console.error('Delete answer error:', error);
    res.status(500).json({ message: 'Error deleting answer' });
  }
});

// Like/Unlike answer
router.post('/:id/like', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const userId = req.user._id;
    const isLiked = answer.likes.includes(userId);

    if (isLiked) {
      answer.likes.pull(userId);
    } else {
      answer.likes.push(userId);
    }

    await answer.save();

    res.json({
      success: true,
      message: isLiked ? 'Answer unliked' : 'Answer liked',
      likes: answer.likes.length,
      isLiked: !isLiked
    });
  } catch (error) {
    console.error('Like answer error:', error);
    res.status(500).json({ message: 'Error updating like status' });
  }
});

// Accept answer (only question author or admin/teacher)
router.patch('/:id/accept', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id).populate('question');
    
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Check if user can accept this answer
    const canAccept = req.user.role === 'admin' || 
                     req.user.role === 'teacher' || 
                     answer.question.author.toString() === req.user._id.toString();

    if (!canAccept) {
      return res.status(403).json({ message: 'Not authorized to accept this answer' });
    }

    // Unaccept all other answers for this question
    await Answer.updateMany(
      { question: answer.question._id, _id: { $ne: answer._id } },
      { isAccepted: false }
    );

    // Accept this answer
    answer.isAccepted = true;
    await answer.save();

    // Mark question as resolved
    await Question.findByIdAndUpdate(answer.question._id, { isResolved: true });

    res.json({
      success: true,
      message: 'Answer accepted successfully',
      answer
    });
  } catch (error) {
    console.error('Accept answer error:', error);
    res.status(500).json({ message: 'Error accepting answer' });
  }
});

// Verify answer (teachers only)
router.patch('/:id/verify', authenticateToken, authorize('teacher', 'admin'), validateObjectId('id'), async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Toggle verification status
    answer.isVerified = !answer.isVerified;
    
    if (answer.isVerified) {
      answer.verifiedBy = req.user._id;
      answer.verifiedAt = new Date();
    } else {
      answer.verifiedBy = undefined;
      answer.verifiedAt = undefined;
    }

    await answer.save();
    await answer.populate('verifiedBy', 'name role');

    res.json({
      success: true,
      message: answer.isVerified ? 'Answer verified successfully' : 'Answer verification removed',
      answer
    });
  } catch (error) {
    console.error('Verify answer error:', error);
    res.status(500).json({ message: 'Error verifying answer' });
  }
});

// Get comments for an answer
router.get('/:id/comments', validateObjectId('id'), validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ answer: req.params.id })
      .populate('author', 'name avatar role')
      .populate('likes', 'name')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Comment.countDocuments({ answer: req.params.id });

    res.json({
      success: true,
      comments,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
});

// Create comment on answer
router.post('/:id/comments', authenticateToken, validateObjectId('id'), validateComment, async (req, res) => {
  try {
    const commentData = {
      ...req.body,
      author: req.user._id,
      answer: req.params.id
    };

    const comment = new Comment(commentData);
    await comment.save();

    await comment.populate('author', 'name avatar role');

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      comment
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Error creating comment' });
  }
});

// Update comment
router.put('/comments/:commentId', authenticateToken, validateObjectId('commentId'), checkOwnership(Comment), async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim().length < 5) {
      return res.status(400).json({ message: 'Comment content must be at least 5 characters' });
    }

    const comment = await Comment.findByIdAndUpdate(
      req.params.commentId,
      { content: content.trim() },
      { new: true, runValidators: true }
    ).populate('author', 'name avatar role');

    res.json({
      success: true,
      message: 'Comment updated successfully',
      comment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Error updating comment' });
  }
});

// Delete comment
router.delete('/comments/:commentId', authenticateToken, validateObjectId('commentId'), checkOwnership(Comment), async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.commentId);

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Error deleting comment' });
  }
});

// Like/Unlike comment
router.post('/comments/:commentId/like', authenticateToken, validateObjectId('commentId'), async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const userId = req.user._id;
    const isLiked = comment.likes.includes(userId);

    if (isLiked) {
      comment.likes.pull(userId);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();

    res.json({
      success: true,
      message: isLiked ? 'Comment unliked' : 'Comment liked',
      likes: comment.likes.length,
      isLiked: !isLiked
    });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ message: 'Error updating like status' });
  }
});

module.exports = router;
