import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ArrowLeft, Heart, MessageCircle, Check, Plus } from 'lucide-react';
import { questionsAPI, answersAPI } from '../utils/api';
import { formatRelativeTime, getInitials, canEdit, canDelete } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import AnswerCard from '../components/AnswerCard';
import toast from 'react-hot-toast';

const QuestionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isTeacher, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  
  const [newAnswer, setNewAnswer] = useState('');
  const [showAnswerForm, setShowAnswerForm] = useState(false);

  const { data: questionData, isLoading, error } = useQuery(
    ['question', id],
    () => questionsAPI.getById(id),
    {
      enabled: !!id,
    }
  );

  const createAnswerMutation = useMutation(answersAPI.create, {
    onSuccess: () => {
      setNewAnswer('');
      setShowAnswerForm(false);
      queryClient.invalidateQueries(['question', id]);
      toast.success('Answer posted successfully!');
    },
    onError: () => {
      toast.error('Failed to post answer');
    }
  });

  const likeQuestionMutation = useMutation(
    () => questionsAPI.like(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['question', id]);
      },
      onError: () => {
        toast.error('Failed to like question');
      }
    }
  );

  const resolveQuestionMutation = useMutation(
    () => questionsAPI.resolve(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['question', id]);
        toast.success('Question marked as resolved');
      },
      onError: () => {
        toast.error('Failed to resolve question');
      }
    }
  );

  const handleSubmitAnswer = (e) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;
    
    createAnswerMutation.mutate({
      content: newAnswer.trim(),
      question: id
    });
  };

  const handleLikeQuestion = () => {
    likeQuestionMutation.mutate();
  };

  const handleResolveQuestion = () => {
    resolveQuestionMutation.mutate();
  };

  const handleLikeAnswer = async (answerId) => {
    try {
      await answersAPI.like(answerId);
      queryClient.invalidateQueries(['question', id]);
    } catch (error) {
      toast.error('Failed to like answer');
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    try {
      await answersAPI.accept(answerId);
      queryClient.invalidateQueries(['question', id]);
      toast.success('Answer accepted!');
    } catch (error) {
      toast.error('Failed to accept answer');
    }
  };

  const handleEditAnswer = async (answerId, content) => {
    try {
      await answersAPI.update(answerId, { content });
      queryClient.invalidateQueries(['question', id]);
      toast.success('Answer updated!');
    } catch (error) {
      toast.error('Failed to update answer');
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    try {
      await answersAPI.delete(answerId);
      queryClient.invalidateQueries(['question', id]);
      toast.success('Answer deleted!');
    } catch (error) {
      toast.error('Failed to delete answer');
    }
  };

  const handleVerifyAnswer = async (answerId) => {
    try {
      await answersAPI.verify(answerId);
      queryClient.invalidateQueries(['question', id]);
      toast.success('Answer verification updated!');
    } catch (error) {
      toast.error('Failed to verify answer');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="card">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !questionData?.question) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Question not found</h2>
        <p className="text-gray-600 mb-6">The question you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Go Home
        </button>
      </div>
    );
  }

  const { question, answers = [] } = questionData;
  const isLiked = question.likes?.some(like => like._id === user?.id || like === user?.id);
  const canEditQuestion = canEdit(question, user);
  const canDeleteQuestion = canDelete(question, user);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{question.title}</h1>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
            <span>{formatRelativeTime(question.createdAt)}</span>
            <span>•</span>
            <span>{question.views || 0} views</span>
            <span>•</span>
            <span>{answers.length} answers</span>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="card">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              {question.author?.avatar ? (
                <img
                  className="h-10 w-10 rounded-full"
                  src={question.author.avatar}
                  alt={question.author.name}
                />
              ) : (
                <span className="text-sm font-medium text-primary-600">
                  {getInitials(question.author?.name)}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">{question.author?.name}</span>
                <span className="text-sm text-gray-500">{question.author?.role}</span>
                {question.isResolved && (
                  <span className="badge badge-success">Resolved</span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {(isTeacher() || isAdmin()) && !question.isResolved && (
                  <button
                    onClick={handleResolveQuestion}
                    className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                  >
                    Mark as Resolved
                  </button>
                )}

                <button
                  onClick={handleLikeQuestion}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                    isLiked
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{question.likes?.length || 0}</span>
                </button>
              </div>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{question.content}</p>
            </div>

            {question.tags && question.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {question.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Answers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Answers ({answers.length})
          </h2>
          <button
            onClick={() => setShowAnswerForm(!showAnswerForm)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Answer</span>
          </button>
        </div>

        {/* Answer Form */}
        {showAnswerForm && (
          <div className="card">
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <div>
                <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Answer
                </label>
                <textarea
                  id="answer"
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="Share your knowledge and help others..."
                  className="textarea-field"
                  rows={6}
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAnswerForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAnswerMutation.isLoading || !newAnswer.trim()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createAnswerMutation.isLoading ? 'Posting...' : 'Post Answer'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Answers List */}
        {answers.length > 0 ? (
          <div className="space-y-4">
            {answers.map((answer) => (
              <AnswerCard
                key={answer._id}
                answer={answer}
                onLike={handleLikeAnswer}
                onAccept={handleAcceptAnswer}
                onVerify={handleVerifyAnswer}
                onEdit={handleEditAnswer}
                onDelete={handleDeleteAnswer}
                showComments={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No answers yet</h3>
            <p className="text-gray-600 mb-4">Be the first to answer this question!</p>
            <button
              onClick={() => setShowAnswerForm(true)}
              className="btn-primary"
            >
              Add Answer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionDetails;
