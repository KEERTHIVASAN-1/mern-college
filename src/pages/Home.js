import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, MessageSquare, CheckCircle, Clock, User, Tag } from 'lucide-react';
import { questionsAPI } from '../utils/api';
import QuestionCard from '../components/QuestionCard';
import toast from 'react-hot-toast';

const Home = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    isResolved: '',
    priority: '',
    page: 1,
    limit: 10
  });

  // Update filters based on active tab
  useEffect(() => {
    if (activeTab === 'unanswered') {
      setFilters(prev => ({ ...prev, isResolved: 'false', page: 1 }));
    } else if (activeTab === 'answered') {
      setFilters(prev => ({ ...prev, isResolved: 'true', page: 1 }));
    } else {
      setFilters(prev => ({ ...prev, isResolved: '', page: 1 }));
    }
  }, [activeTab]);

  const { data, isLoading, error, refetch } = useQuery(
    ['questions', filters],
    () => questionsAPI.getAll(filters),
    {
      keepPreviousData: true,
      refetchInterval: 30000, // Refetch every 30 seconds
      staleTime: 10000, // Consider data stale after 10 seconds
    }
  );

  const handleSearch = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleLike = async (questionId) => {
    try {
      await questionsAPI.like(questionId);
      refetch();
      toast.success('Question liked!');
    } catch (error) {
      toast.error('Failed to like question');
    }
  };

  const handleView = (questionId) => {
    // Navigation is handled by QuestionCard onClick
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Failed to load questions</div>
        <button onClick={() => refetch()} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Questions & Answers</h1>
          <p className="text-gray-600">Ask questions and get help from your peers and teachers</p>
        </div>
        <Link to="/ask" className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Ask Question</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-2" />
            All Questions
          </button>
          <button
            onClick={() => setActiveTab('unanswered')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'unanswered'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            Unanswered
          </button>
          <button
            onClick={() => setActiveTab('answered')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'answered'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CheckCircle className="w-4 h-4 inline mr-2" />
            Answered
          </button>
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative flex items-center">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search questions..."
              value={filters.search}
              onChange={handleSearch}
              className="input-field pl-10 w-full"
            />
            <button 
              onClick={() => refetch()}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white p-1 rounded-md"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="input-field"
              >
                <option value="">All Categories</option>
                <option value="academic">Academic</option>
                <option value="general">General</option>
                <option value="technical">Technical</option>
                <option value="administrative">Administrative</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="input-field"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilters({
                    search: '',
                    category: '',
                    isResolved: '',
                    priority: '',
                    page: 1,
                    limit: 10
                  });
                  setActiveTab('all');
                }}
                className="btn-secondary w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : data?.questions?.length > 0 ? (
          <>
            {data.questions.map((question) => (
              <QuestionCard
                key={question._id}
                question={question}
                onLike={handleLike}
                onView={handleView}
              />
            ))}

            {/* Pagination */}
            {data.pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <div className="text-sm text-gray-700">
                  Showing {((data.pagination.current - 1) * data.pagination.limit) + 1} to{' '}
                  {Math.min(data.pagination.current * data.pagination.limit, data.pagination.total)} of{' '}
                  {data.pagination.total} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(data.pagination.current - 1)}
                    disabled={data.pagination.current === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2 text-sm text-gray-700">
                    Page {data.pagination.current} of {data.pagination.pages}
                  </span>
                  <button
                    onClick={() => handlePageChange(data.pagination.current + 1)}
                    disabled={data.pagination.current === data.pagination.pages}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
            <p className="text-gray-600 mb-6">
              {filters.search || filters.category || filters.isResolved || filters.priority
                ? 'Try adjusting your search criteria'
                : 'Be the first to ask a question!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
