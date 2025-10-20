import React, { useState } from 'react';
import { formatRelativeTime, getInitials, canEdit, canDelete } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { Edit, Trash2, Check, Heart, MessageCircle, Shield } from 'lucide-react';
import CommentSection from './CommentSection';

const AnswerCard = ({ 
  answer, 
  onLike, 
  onAccept, 
  onVerify,
  onEdit, 
  onDelete, 
  onComment,
  showComments = true 
}) => {
  const { user } = useAuth();
  const [showEditForm, setShowEditForm] = useState(false);
  const [editContent, setEditContent] = useState(answer.content);

  const handleLike = () => {
    onLike?.(answer._id);
  };

  const handleAccept = () => {
    onAccept?.(answer._id);
  };

  const handleVerify = () => {
    onVerify?.(answer._id);
  };

  const handleEdit = () => {
    setShowEditForm(true);
  };

  const handleSaveEdit = () => {
    onEdit?.(answer._id, editContent);
    setShowEditForm(false);
  };

  const handleCancelEdit = () => {
    setEditContent(answer.content);
    setShowEditForm(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this answer?')) {
      onDelete?.(answer._id);
    }
  };

  const handleComment = () => {
    onComment?.(answer._id);
  };

  const isLiked = answer.likes?.some(like => like._id === user?.id || like === user?.id);
  const canEditAnswer = canEdit(answer, user);
  const canDeleteAnswer = canDelete(answer, user);
  const canVerifyAnswer = user?.role === 'teacher' || user?.role === 'admin';

  return (
    <div className={`card ${answer.isAccepted ? 'border-green-200 bg-green-50' : ''} ${answer.isVerified ? 'border-blue-200 bg-blue-50' : ''}`}>
      {answer.isAccepted && (
        <div className="flex items-center mb-3 text-green-700">
          <Check className="w-5 h-5 mr-2" />
          <span className="font-medium">Accepted Answer</span>
        </div>
      )}

      {answer.isVerified && (
        <div className="flex items-center mb-3 text-blue-700">
          <Shield className="w-5 h-5 mr-2" />
          <span className="font-medium">Verified by Teacher</span>
          {answer.verifiedBy && (
            <span className="text-sm text-blue-600 ml-2">
              ({answer.verifiedBy.name})
            </span>
          )}
        </div>
      )}

      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
            {answer.author?.avatar ? (
              <img
                className="h-8 w-8 rounded-full"
                src={answer.author.avatar}
                alt={answer.author.name}
              />
            ) : (
              <span className="text-sm font-medium text-primary-600">
                {getInitials(answer.author?.name)}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
                {answer.author?.name}
              </span>
              <span className="text-xs text-gray-500">
                {formatRelativeTime(answer.createdAt)}
              </span>
              {answer.isEdited && (
                <span className="text-xs text-gray-400">(edited)</span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {canVerifyAnswer && (
                <button
                  onClick={handleVerify}
                  className={`text-sm px-2 py-1 rounded ${
                    answer.isVerified
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={answer.isVerified ? 'Remove verification' : 'Verify answer'}
                >
                  <Shield className="w-4 h-4 inline mr-1" />
                  {answer.isVerified ? 'Verified' : 'Verify'}
                </button>
              )}

              {user?.role === 'admin' || user?.role === 'teacher' ? (
                <button
                  onClick={handleAccept}
                  className={`text-sm px-2 py-1 rounded ${
                    answer.isAccepted
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {answer.isAccepted ? 'Accepted' : 'Accept'}
                </button>
              ) : null}

              {canEditAnswer && (
                <button
                  onClick={handleEdit}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}

              {canDeleteAnswer && (
                <button
                  onClick={handleDelete}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {showEditForm ? (
            <div className="space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="textarea-field"
                rows="4"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveEdit}
                  className="btn-primary text-sm"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{answer.content}</p>
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 text-sm ${
                  isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{answer.likes?.length || 0}</span>
              </button>

              {showComments && (
                <button
                  onClick={handleComment}
                  className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{answer.commentCount || 0}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Thread-style Comments Section */}
      {showComments && answer.comments && (
        <CommentSection 
          answerId={answer._id} 
          comments={answer.comments || []} 
          onCommentAdded={() => onComment?.(answer._id)}
        />
      )}
    </div>
  );
};

export default AnswerCard;
