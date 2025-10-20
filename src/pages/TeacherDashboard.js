import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Clock,
  UserCheck,
  UserX,
  Archive,
  Trash2,
  GraduationCap,
  BookOpen,
  Target
} from 'lucide-react';
import { adminAPI } from '../utils/api';
import { formatRole, formatDate, formatRelativeTime } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const TeacherDashboard = () => {
  const { isAdmin, isTeacher, user } = useAuth();
  const queryClient = useQueryClient();
  const location = useLocation();

  const { data: stats, isLoading: statsLoading } = useQuery(
    'teacher-stats',
    adminAPI.getStats,
    {
      enabled: isAdmin() || isTeacher(),
    }
  );

  const { data: users, isLoading: usersLoading } = useQuery(
    ['teacher-users', { page: 1, limit: 20 }],
    () => adminAPI.getUsers({ page: 1, limit: 20 }),
    {
      enabled: isAdmin() || isTeacher(),
    }
  );

  const { data: questions, isLoading: questionsLoading } = useQuery(
    ['teacher-questions', { page: 1, limit: 20, isResolved: false }],
    () => adminAPI.getQuestions({ page: 1, limit: 20, isResolved: false }),
    {
      enabled: isAdmin() || isTeacher(),
      refetchInterval: 30000, // Refetch every 30 seconds
      staleTime: 10000, // Consider data stale after 10 seconds
    }
  );

  const updateUserRoleMutation = useMutation(
    ({ userId, role }) => adminAPI.updateUserRole(userId, role),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('teacher-users');
        toast.success('User role updated successfully');
      },
      onError: () => {
        toast.error('Failed to update user role');
      }
    }
  );

  const toggleUserStatusMutation = useMutation(
    adminAPI.toggleUserStatus,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('teacher-users');
        toast.success('User status updated successfully');
      },
      onError: () => {
        toast.error('Failed to update user status');
      }
    }
  );

  const archiveQuestionMutation = useMutation(
    adminAPI.archiveQuestion,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('teacher-questions');
        toast.success('Question status updated');
      },
      onError: () => {
        toast.error('Failed to update question status');
      }
    }
  );

  const deleteQuestionMutation = useMutation(
    adminAPI.deleteQuestion,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('teacher-questions');
        toast.success('Question deleted successfully');
      },
      onError: () => {
        toast.error('Failed to delete question');
      }
    }
  );

  const handleRoleChange = (userId, newRole) => {
    updateUserRoleMutation.mutate({ userId, role: newRole });
  };

  const handleStatusToggle = (userId) => {
    toggleUserStatusMutation.mutate(userId);
  };

  const handleArchiveQuestion = (questionId) => {
    archiveQuestionMutation.mutate(questionId);
  };

  const handleDeleteQuestion = (questionId) => {
    if (window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      deleteQuestionMutation.mutate(questionId);
    }
  };

  if (!isAdmin() && !isTeacher()) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to access the teacher dashboard.</p>
        <a href="/login" className="text-blue-600 hover:text-blue-800 underline mt-4 inline-block">
          Go to Student Portal
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
            <p className="text-blue-100">Welcome back, {user?.name}! Manage your Q&A platform</p>
          </div>
          <GraduationCap className="w-12 h-12 text-blue-200" />
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <Link
            to="/teacher-dashboard"
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              location.pathname === '/teacher-dashboard'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </Link>
          <Link
            to="/teacher-dashboard/students"
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              location.pathname === '/teacher-dashboard/students'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Students
          </Link>
          <Link
            to="/teacher-dashboard/questions"
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              location.pathname === '/teacher-dashboard/questions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Questions
          </Link>
          <Link
            to="/teacher-dashboard/analytics"
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              location.pathname === '/teacher-dashboard/analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Analytics
          </Link>
        </nav>
      </div>

      {/* Content */}
      <Routes>
        <Route path="/" element={<TeacherOverview stats={stats} statsLoading={statsLoading} />} />
        <Route 
          path="/students" 
          element={
            <StudentsManagement 
              users={users} 
              usersLoading={usersLoading}
              onRoleChange={handleRoleChange}
              onStatusToggle={handleStatusToggle}
            />
          } 
        />
        <Route 
          path="/questions" 
          element={
            <QuestionsManagement 
              questions={questions} 
              questionsLoading={questionsLoading}
              onArchive={handleArchiveQuestion}
              onDelete={handleDeleteQuestion}
            />
          } 
        />
        <Route 
          path="/analytics" 
          element={<Analytics stats={stats} statsLoading={statsLoading} />} 
        />
      </Routes>
    </div>
  );
};

// Teacher Overview Component
const TeacherOverview = ({ stats, statsLoading }) => {
  if (statsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-blue-700 truncate">Total Students</dt>
                <dd className="text-lg font-medium text-blue-900">{stats?.stats?.users?.total || 0}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MessageSquare className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-green-700 truncate">Questions Asked</dt>
                <dd className="text-lg font-medium text-green-900">{stats?.stats?.content?.questions || 0}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-purple-700 truncate">Resolved</dt>
                <dd className="text-lg font-medium text-purple-900">{stats?.stats?.content?.resolved || 0}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-orange-700 truncate">Active Students</dt>
                <dd className="text-lg font-medium text-orange-900">{stats?.stats?.users?.active || 0}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Questions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Questions</h3>
          <BookOpen className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-3">
          {stats?.stats?.recentQuestions?.map((question) => (
            <div key={question._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 rounded-lg px-3 -mx-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{question.title}</p>
                <p className="text-xs text-gray-500">by {question.author?.name}</p>
              </div>
              <div className="flex-shrink-0 ml-4">
                <span className="text-xs text-gray-500">{formatRelativeTime(question.createdAt)}</span>
              </div>
            </div>
          )) || (
            <p className="text-gray-500 text-center py-4">No recent questions</p>
          )}
        </div>
      </div>

      {/* Top Contributors */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Top Contributors</h3>
          <Target className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-3">
          {stats?.stats?.topContributors?.map((user, index) => (
            <div key={user._id} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{formatRole(user.role)}</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {user.totalContributions} contributions
              </div>
            </div>
          )) || (
            <p className="text-gray-500 text-center py-4">No contributors data</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Students Management Component
const StudentsManagement = ({ users, usersLoading, onRoleChange, onStatusToggle }) => {
  if (usersLoading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Student Management</h3>
        <Users className="w-5 h-5 text-gray-400" />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users?.users?.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {user.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => onRoleChange(user._id, e.target.value)}
                    className="text-sm border-gray-300 rounded-md"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onStatusToggle(user._id)}
                    className={`${
                      user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                    }`}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Questions Management Component
const QuestionsManagement = ({ questions, questionsLoading, onArchive, onDelete }) => {
  if (questionsLoading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Question Management</h3>
        <MessageSquare className="w-5 h-5 text-gray-400" />
      </div>
      {questions?.questions?.map((question) => (
        <div key={question._id} className="card">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{question.title}</h3>
              <p className="text-gray-600 mb-3 line-clamp-2">{question.content}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>by {question.author?.name}</span>
                <span>•</span>
                <span>{formatRelativeTime(question.createdAt)}</span>
                <span>•</span>
                <span>{question.views || 0} views</span>
                {question.isResolved && (
                  <>
                    <span>•</span>
                    <span className="text-green-600">Resolved</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => onArchive(question._id)}
                className="text-gray-400 hover:text-gray-600"
                title={question.isArchived ? 'Unarchive' : 'Archive'}
              >
                <Archive className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(question._id)}
                className="text-gray-400 hover:text-red-600"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Analytics Component
const Analytics = ({ stats, statsLoading }) => {
  if (statsLoading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Engagement Metrics</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-blue-700">Total Questions:</span>
                <span className="font-medium text-blue-900">{stats?.stats?.content?.questions || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Total Answers:</span>
                <span className="font-medium text-blue-900">{stats?.stats?.content?.answers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Resolved Questions:</span>
                <span className="font-medium text-blue-900">{stats?.stats?.content?.resolved || 0}</span>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">User Activity</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-green-700">Total Users:</span>
                <span className="font-medium text-green-900">{stats?.stats?.users?.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Active Users (7d):</span>
                <span className="font-medium text-green-900">{stats?.stats?.users?.active || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Resolution Rate:</span>
                <span className="font-medium text-green-900">
                  {stats?.stats?.content?.questions > 0 
                    ? Math.round((stats.stats.content.resolved / stats.stats.content.questions) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;




















