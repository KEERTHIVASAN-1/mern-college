import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Users, BookOpen, Shield, AlertCircle } from 'lucide-react';

const TeacherLogin = () => {
  const { login, user, loading } = useAuth();

  useEffect(() => {
    // Check for OAuth error in URL
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    
    if (error === 'auth_failed') {
      // Show error message
      console.error('Authentication failed');
    }
  }, []);

  // Redirect if already logged in
  if (user) {
    if (user.role === 'teacher' || user.role === 'admin') {
      window.location.href = '/teacher-dashboard';
    } else {
      window.location.href = '/';
    }
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <GraduationCap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Teacher Portal</h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your teaching dashboard and manage Q&A sessions
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Teacher Sign In
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Use your authorized teacher email to access the portal
              </p>
            </div>

            {/* Teacher Email Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Teacher Access Required</p>
                  <p>Only emails from the authorized teacher list can access this portal. If you're a student, please use the <a href="/login" className="underline hover:text-blue-900">student login</a>.</p>
                </div>
              </div>
            </div>

            <button
              onClick={login}
              className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Teacher Features</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="text-sm font-medium text-gray-900">Manage Students</h4>
                  <p className="text-xs text-gray-600">View and moderate student activity</p>
                </div>
                <div className="text-center">
                  <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="text-sm font-medium text-gray-900">Answer Questions</h4>
                  <p className="text-xs text-gray-600">Provide expert answers and guidance</p>
                </div>
                <div className="text-center">
                  <GraduationCap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="text-sm font-medium text-gray-900">Analytics</h4>
                  <p className="text-xs text-gray-600">Track engagement and progress</p>
                </div>
                <div className="text-center">
                  <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="text-sm font-medium text-gray-900">Moderation</h4>
                  <p className="text-xs text-gray-600">Maintain quality discussions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          <a href="/login" className="text-blue-600 hover:text-blue-800 underline">
            Student? Click here to access the student portal
          </a>
        </p>
        <p className="text-xs text-gray-500 mt-2">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default TeacherLogin;


