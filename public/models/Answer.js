const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 3000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  isAccepted: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
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
answerSchema.index({ question: 1 });
answerSchema.index({ author: 1 });
answerSchema.index({ createdAt: -1 });

// Virtual for comment count
answerSchema.virtual('commentCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'answer',
  count: true
});

// Ensure virtual fields are serialized
answerSchema.set('toJSON', { virtuals: true });

// Pre-save middleware to update editedAt
answerSchema.pre('save', function(next) {
  if (this.isModified('content') && !this.isNew) {
    this.isEdited = true;
    this.editedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Answer', answerSchema);
