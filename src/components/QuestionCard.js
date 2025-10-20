import React, { useState } from 'react';
import { formatRelativeTime, getInitials } from '../utils/helpers';
import { answersAPI } from '../utils/api';
import toast from 'react-hot-toast';

const QuestionCard = ({ question, onLike, onView, showActions = true }) => {
  const [showAnswerBox, setShowAnswerBox] = useState(false);
  const [answerContent, setAnswerContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLike = (e) => {
    e.stopPropagation();
    onLike?.(question._id);
  };

  const handleView = () => {
    onView?.(question._id);
  };
  
  const toggleAnswerBox = (e) => {
    e.stopPropagation();
    setShowAnswerBox(!showAnswerBox);
  };
  
  const handleSubmitAnswer = async (e) => {
    e.stopPropagation();
    if (!answerContent.trim()) return;
    
    setIsSubmitting(true);
    try {
      await answersAPI.create({
        question: question._id,
        content: answerContent
      });
      setAnswerContent('');
      setShowAnswerBox(false);
      toast.success('Answer submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="card hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-start justify-between cursor-pointer" onClick={handleView}>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-100 mb-2 line-clamp-2">
            {question.title}
          </h3>
          <p className="text-gray-300 mb-3 line-clamp-3">
            {question.content}
          </p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-300 mb-3">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {question.views || 0} views
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {question.answerCount || 0} answers
            </span>
            <span>{formatRelativeTime(question.createdAt)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <div className="h-6 w-6 rounded-full bg-gray-700 flex items-center justify-center">
                  {question.author?.avatar ? (
                    <img
                      className="h-6 w-6 rounded-full"
                      src={question.author.avatar}
                      alt={question.author.name}
                    />
                  ) : (
                    <span className="text-xs font-medium text-green-400">
                      {getInitials(question.author?.name)}
                    </span>
                  )}
                </div>
                <span className="ml-2 text-sm text-gray-300">{question.author?.name}</span>
              </div>
              
              <span className={`badge ${question.category === 'academic' ? 'bg-green-900 text-green-100' : 'bg-gray-700 text-gray-300'}`}>
                {question.category}
              </span>
              
              {question.isResolved && (
                <span className="badge badge-success">Resolved</span>
              )}
            </div>

            <div className="flex space-x-2">
              {showActions && (
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                    question.likes?.some(like => like._id === question.author?._id)
                      ? 'bg-green-700 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <span>{question.likes?.length || 0}</span>
                </button>
              )}
              
              <button
                onClick={toggleAnswerBox}
                className="flex items-center space-x-1 px-3 py-1 rounded-full text-sm bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                <span>Reply</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Answer Box */}
      {showAnswerBox && (
        <div className="mt-4 border-t border-gray-700 pt-4" onClick={(e) => e.stopPropagation()}>
          <textarea
            value={answerContent}
            onChange={(e) => setAnswerContent(e.target.value)}
            placeholder="Write your answer here..."
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-100 resize-y min-h-[100px]"
          />
          <div className="flex justify-end mt-2 space-x-2">
            <button
              onClick={() => setShowAnswerBox(false)}
              className="px-4 py-2 text-sm bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitAnswer}
              disabled={isSubmitting || !answerContent.trim()}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Answer'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
