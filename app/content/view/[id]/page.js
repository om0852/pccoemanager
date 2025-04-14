'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import Link from 'next/link';

// Helper function to format dates
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Helper function to check if file is PDF
const isPDF = (fileUrl) => {
  return fileUrl?.toLowerCase().endsWith('.pdf');
};

// Helper function to get badge color based on content type
const getContentTypeColor = (contentType) => {
  const colors = {
    'notes': 'bg-blue-100 text-blue-800',
    'video': 'bg-purple-100 text-purple-800',
    'assignment': 'bg-green-100 text-green-800',
    'question-paper': 'bg-yellow-100 text-yellow-800',
    'answer-paper': 'bg-red-100 text-red-800',
  };
  return colors[contentType] || 'bg-gray-100 text-gray-800';
};

// Helper function to get the content type label
const getContentTypeLabel = (contentType) => {
  const labels = {
    'notes': 'Notes',
    'video': 'Video',
    'assignment': 'Assignment',
    'question-paper': 'Question Paper',
    'answer-paper': 'Answer Paper',
  };
  return labels[contentType] || contentType;
};

export default function ViewContent({ params }) {
  const contentId = params.id;
  const { user } = useAuth();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/content/${contentId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch content');
        }
        
        const data = await response.json();
        setContent(data);
      } catch (error) {
        console.error('Error fetching content:', error);
        setError('Failed to load content details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (contentId) {
      fetchContent();
    }
  }, [contentId]);

  // Check if user is authorized to edit (content creator or admin)
  const canEdit = () => {
    if (!user || !content) return false;
    
    // User is the content creator
    if (content.createdBy?._id === user.id) return true;
    
    // User is admin or master admin
    return user.role === 'admin' || user.role === 'master-admin';
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-8.414l2.293-2.293a1 1 0 011.414 1.414L11.414 10l2.293 2.293a1 1 0 11-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 011.414-1.414L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error || 'Content not found or has been deleted.'}</p>
            </div>
          </div>
        </div>
        <Link
          href="/content"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back to Content Library
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Link
            href={user?.role === 'student' ? '/student' : '/content'}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            {user?.role === 'student' ? 'Back to Student Portal' : 'Back to Content Library'}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{content.title}</h1>
        </div>
        
        <div className="flex space-x-3">
          {canEdit() && (
            <Link
              href={`/content/edit/${content._id}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit
            </Link>
          )}
          
          <a
            href={content.fileUrl}
            download
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download
          </a>
        </div>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</h3>
              <p className="mt-1 text-sm text-gray-900">
                {content.subject?.name || 'Unknown Subject'}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {content.subject?.department?.name || 'Unknown Department'}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Content Type</h3>
              <p className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getContentTypeColor(content.contentType)}`}>
                  {getContentTypeLabel(content.contentType)}
                </span>
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded By</h3>
              <p className="mt-1 text-sm text-gray-900">
                {content.createdBy?.name || 'Unknown User'}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {formatDate(content.createdAt)}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">File</h3>
              <p className="mt-1 text-sm text-gray-900 truncate">
                {content.fileName || content.fileUrl.split('/').pop() || 'Download File'}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {content.fileSize ? `${Math.round(content.fileSize / 1024)} KB` : ''}
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-5">
            <h3 className="text-lg font-medium text-gray-900">Description</h3>
            <div className="mt-3 prose prose-blue prose-sm max-w-none text-gray-700">
              <p>{content.description}</p>
            </div>
          </div>
          
          {content.fileUrl && (
            <div className="border-t border-gray-200 pt-5 mt-5">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Preview</h3>
              {content.contentType === 'video' ? (
                <div className="aspect-w-16 aspect-h-9">
                  <video 
                    controls 
                    className="w-full h-full rounded-lg object-cover" 
                    src={content.fileUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : isPDF(content.fileUrl) ? (
                <div className="aspect-w-16 aspect-h-9 min-h-[600px]">
                  <iframe
                    src={content.fileUrl}
                    className="w-full h-full rounded-lg border border-gray-200"
                    title="PDF Viewer"
                  >
                    This browser does not support PDFs. Please download to view.
                  </iframe>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 