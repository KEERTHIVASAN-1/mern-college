import React, { useState } from 'react';
import { formatRelativeTime, getInitials } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, Heart, Reply, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { answersAPI } from '../utils/api';

const CommentSection = ({ answerId, comments = [], onCommentAdded }) => {
  const { user } = useAuth();
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    
    setIsSubmitting(true);
    try {
      await answersAPI.addComment(answerId, {
        content: commentContent.trim(),
        parentComment: replyingTo
      });
      
      setCommentContent('');
      setShowCommentForm(false);
      setReplyingTo(null);
      onCommentAdded?.();
      toast.success('Comment added successfully!');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = (commentId) => {
    setReplyingTo(commentId);
    setShowCommentForm(true);
  };

  // Group comments by parent
  const parentComments = comments.filter(comment => !comment.parentComment);
  const childComments = comments.filter(comment => comment.parentComment);
  
  const getChildComments = (parentId) => {
    return childComments.filter(comment => comment.parentComment === parentId);
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-100">
          Comments ({comments.length})
        </h4>
        <button
          onClick={() => {
            setReplyingTo(null);
            setShowCommentForm(!showCommentForm);
          }}
          className="text-sm text-gray-300 hover:text-green-400 flex items-center space-x-1"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Add Comment</span>
        </button>
      </div>

      {/* Comment Form */}
      {showCommentForm && (
        <form onSubmit={handleSubmitComment} className="space-y-3">
          {replyingTo && (
            <div className="text-xs text-gray-400 mb-1">
              Replying to a comment
              <button 
                onClick={() => setReplyingTo(null)} 
                className="ml-2 text-green-400 hover:text-green-500"
              >
                (cancel reply)
              </button>
            </div>
          )}
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Add your comment..."
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-100 resize-none text-sm"
            rows={3}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !commentContent.trim()}
              className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-3">
        {parentComments.length > 0 ? (
          parentComments.map((comment) => (
            <div key={comment._id} className="space-y-3">
              {/* Parent Comment */}
              <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0">
                    <div className="h-6 w-6 rounded-full bg-gray-700 flex items-center justify-center">
                      {comment.author?.avatar ? (
                        <img
                          className="h-6 w-6 rounded-full"
                          src={comment.author.avatar}
                          alt={comment.author.name}
                        />
                      ) : (
                        <span className="text-xs font-medium text-green-400">
                          {getInitials(comment.author?.name)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium text-gray-100">
                          {comment.author?.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatRelativeTime(comment.createdAt)}
                        </span>
                        {comment.isEdited && (
                          <span className="text-xs text-gray-500">(edited)</span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">{comment.content}</p>
                    <div className="mt-2 flex items-center space-x-3">
                      <button
                        onClick={() => handleReply(comment._id)}
                        className="text-xs text-gray-400 hover:text-green-400 flex items-center space-x-1"
                      >
                        <Reply className="w-3 h-3" />
                        <span>Reply</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Child Comments (Replies) */}
              {getChildComments(comment._id).length > 0 && (
                <div className="pl-6 space-y-2 border-l border-gray-700">
                  {getChildComments(comment._id).map((reply) => (
                    <div key={reply._id} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                      <div className="flex items-start space-x-2">
                        <div className="flex-shrink-0">
                          <div className="h-5 w-5 rounded-full bg-gray-700 flex items-center justify-center">
                            {reply.author?.avatar ? (
                              <img
                                className="h-5 w-5 rounded-full"
                                src={reply.author.avatar}
                                alt={reply.author.name}
                              />
                            ) : (
                              <span className="text-xs font-medium text-green-400">
                                {getInitials(reply.author?.name)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-medium text-gray-100">
                                {reply.author?.name}
                              </span>
                              <span className="text-xs text-gray-400">
                                {formatRelativeTime(reply.createdAt)}
                              </span>
                              {reply.isEdited && (
                                <span className="text-xs text-gray-500">(edited)</span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-300">{reply.content}</p>
                          <div className="mt-2 flex items-center space-x-3">
                            <button
                              onClick={() => handleReply(comment._id)}
                              className="text-xs text-gray-400 hover:text-green-400 flex items-center space-x-1"
                            >
                              <Reply className="w-3 h-3" />
                              <span>Reply</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-3">
            <p className="text-sm text-gray-400">No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;