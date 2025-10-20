import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

// Format date for display
export const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  if (isToday(dateObj)) {
    return `Today at ${format(dateObj, 'h:mm a')}`;
  } else if (isYesterday(dateObj)) {
    return `Yesterday at ${format(dateObj, 'h:mm a')}`;
  } else {
    return format(dateObj, 'MMM d, yyyy');
  }
};

// Format relative time
export const formatRelativeTime = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

// Format date for forms
export const formatDateForInput = (date) => {
  if (!date) return '';
  return format(new Date(date), 'yyyy-MM-dd');
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Format role display
export const formatRole = (role) => {
  const roleMap = {
    student: 'Student',
    teacher: 'Teacher',
    admin: 'Administrator'
  };
  return roleMap[role] || capitalize(role);
};

// Get role color
export const getRoleColor = (role) => {
  const colorMap = {
    student: 'blue',
    teacher: 'green',
    admin: 'purple'
  };
  return colorMap[role] || 'gray';
};

// Format priority
export const formatPriority = (priority) => {
  const priorityMap = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent'
  };
  return priorityMap[priority] || capitalize(priority);
};

// Get priority color
export const getPriorityColor = (priority) => {
  const colorMap = {
    low: 'gray',
    medium: 'blue',
    high: 'orange',
    urgent: 'red'
  };
  return colorMap[priority] || 'gray';
};

// Format category
export const formatCategory = (category) => {
  const categoryMap = {
    academic: 'Academic',
    general: 'General',
    technical: 'Technical',
    administrative: 'Administrative',
    other: 'Other'
  };
  return categoryMap[category] || capitalize(category);
};

// Get category color
export const getCategoryColor = (category) => {
  const colorMap = {
    academic: 'blue',
    general: 'gray',
    technical: 'green',
    administrative: 'purple',
    other: 'orange'
  };
  return colorMap[category] || 'gray';
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Generate avatar initials
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Check if user can edit resource
export const canEdit = (resource, user) => {
  if (!user || !resource) return false;
  
  // Admin and teachers can edit anything
  if (user.role === 'admin' || user.role === 'teacher') return true;
  
  // Users can edit their own resources
  return resource.author?._id === user.id || resource.author === user.id;
};

// Check if user can delete resource
export const canDelete = (resource, user) => {
  if (!user || !resource) return false;
  
  // Only admins can delete anything
  if (user.role === 'admin') return true;
  
  // Users can delete their own resources
  return resource.author?._id === user.id || resource.author === user.id;
};
