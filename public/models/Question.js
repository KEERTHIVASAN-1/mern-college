const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  category: {
    type: String,
    enum: ['academic', 'general', 'technical', 'administrative', 'other'],
    default: 'general'
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isArchived: {
    type: Boolean,
    default: false
  },
  attachments: [{
    filename: String,
    url: String,
    mimetype: String,
    size: Number
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
questionSchema.index({ author: 1 });
questionSchema.index({ category: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ isResolved: 1 });
questionSchema.index({ createdAt: -1 });

// Virtual for answer count
questionSchema.virtual('answerCount', {
  ref: 'Answer',
  localField: '_id',
  foreignField: 'question',
  count: true
});

// Ensure virtual fields are serialized
questionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Question', questionSchema);
