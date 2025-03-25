import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with Tailwind CSS classes
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string into a human-readable format
 * @param {string|Date} dateString - The date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export function formatDate(dateString, options = {}) {
  if (!dateString) {
    return 'N/A';
  }
  
  try {
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    // Default options
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options
    };
    
    // Format the date using Intl.DateTimeFormat
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Error formatting date';
  }
}

/**
 * Format a date to show elapsed time (e.g., "2 days ago")
 * @param {string|Date} dateString - The date to format
 * @returns {string} Human-readable elapsed time
 */
export function timeAgo(dateString) {
  if (!dateString) {
    return 'N/A';
  }
  
  try {
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    // Time intervals in seconds
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1
    };
    
    // Check each interval
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      
      if (interval >= 1) {
        return interval === 1 
          ? `1 ${unit} ago` 
          : `${interval} ${unit}s ago`;
      }
    }
    
    return 'Just now';
  } catch (error) {
    console.error('Error calculating time ago:', error);
    return 'Error calculating time';
  }
}

/**
 * Format a MongoDB ObjectId to a shorter string
 */
export function formatId(id) {
  return id.toString().substring(0, 8);
}

/**
 * Get initials from a name
 */
export function getInitials(name) {
  if (!name) return 'U';
  
  const names = name.trim().split(' ');
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

/**
 * Truncate text to a specific length with ellipsis
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
}

/**
 * Validate file type for upload
 * @param {string} fileType - The MIME type of the file
 * @param {string} contentType - The type of content being uploaded
 * @returns {boolean} Whether the file type is valid
 */
export function validateFileType(fileType, contentType) {
  // For notes and papers, allow PDFs, Word docs, etc.
  if (['notes', 'assignment', 'question-paper', 'answer-paper'].includes(contentType)) {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ];
    return allowedTypes.includes(fileType);
  }
  
  // For videos, allow video formats
  if (contentType === 'video') {
    const allowedTypes = [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-ms-wmv',
      'video/webm'
    ];
    return allowedTypes.includes(fileType);
  }
  
  return false;
}

/**
 * Generate a unique filename
 * @param {string} originalFilename - The original filename
 * @returns {string} A unique filename
 */
export function generateUniqueFilename(originalFilename) {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 12);
  const extension = originalFilename.split('.').pop();
  
  return `${timestamp}-${randomString}.${extension}`;
}

/**
 * Get file extension from filename
 * @param {string} filename - The filename
 * @returns {string} The file extension
 */
export function getFileExtension(filename) {
  return filename.split('.').pop().toLowerCase();
}

/**
 * Truncate a string to a specified length
 * @param {string} str - The string to truncate
 * @param {number} length - The maximum length
 * @returns {string} The truncated string
 */
export function truncateString(str, length = 50) {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

/**
 * Capitalize first letter of each word in a string
 * @param {string} str - The string to capitalize
 * @returns {string} The capitalized string
 */
export function capitalizeWords(str) {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Convert bytes to a human-readable file size
 * @param {number} bytes - The number of bytes
 * @returns {string} Human-readable file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  if (!bytes || isNaN(bytes)) return 'N/A';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Basic email validation
 * @param {string} email - The email to validate
 * @returns {boolean} Whether the email is valid
 */
export function isValidEmail(email) {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Generate random hex color based on a string
 * @param {string} str - Input string
 * @returns {string} Hex color code
 */
export function stringToColor(str) {
  if (!str) return '#6B7280'; // Default gray
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substring(-2);
  }
  
  return color;
} 