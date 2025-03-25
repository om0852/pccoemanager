'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditContent({ params }) {
  const { id } = params;
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    contentType: '',
  });
  const [subjects, setSubjects] = useState([]);
  const [originalContent, setOriginalContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login');
      } else {
        fetchData();
      }
    }
  }, [user, loading, router, id]);

  const fetchData = async () => {
    try {
      // Fetch content data
      const contentResponse = await fetch(`/api/content/${id}`);
      if (!contentResponse.ok) {
        throw new Error('Failed to fetch content');
      }
      const contentData = await contentResponse.json();
      setOriginalContent(contentData);
      
      // Check if user is authorized to edit this content
      if (!isAuthorized(contentData)) {
        router.push('/content');
        return;
      }
      
      // Set form data
      setFormData({
        title: contentData.title || '',
        description: contentData.description || '',
        subject: contentData.subject?._id || '',
        contentType: contentData.contentType || '',
      });
      
      // Fetch subjects
      const subjectsResponse = await fetch('/api/subjects');
      if (!subjectsResponse.ok) {
        throw new Error('Failed to fetch subjects');
      }
      const subjectsData = await subjectsResponse.json();
      setSubjects(subjectsData);
      
      setIsLoading(false);
    } catch (err) {
      setError('Error loading content: ' + err.message);
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setValidationErrors({ ...validationErrors, [name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.subject) errors.subject = 'Subject is required';
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch(`/api/content/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update content');
      }
      
      setSuccessMessage('Content updated successfully!');
      
      // Redirect after delay
      setTimeout(() => {
        router.push('/content/manage');
      }, 2000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if user is authorized to edit this content
  const isAuthorized = (content) => {
    if (!user || !content) return false;
    
    // Only content creator or admin can edit
    if (content.createdBy?._id === user.id) {
      return true;
    }
    
    // Admins can edit any content
    if (user.role === 'admin' || user.role === 'master-admin') {
      return true;
    }
    
    return false;
  };

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthorized(originalContent)) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Content</h1>
          <p className="mt-1 text-sm text-gray-500">
            Update information for your educational content
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Link href="/content/manage" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Back to My Content
          </Link>
          <a 
            href={originalContent?.fileUrl} 
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            download
            target="_blank"
            rel="noopener noreferrer"
          >
            Download File
          </a>
        </div>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 text-sm text-green-700 bg-green-100 rounded-lg">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${validationErrors.title ? 'border-red-300' : ''}`}
                placeholder="Enter a descriptive title"
              />
              {validationErrors.title && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${validationErrors.description ? 'border-red-300' : ''}`}
                placeholder="Provide a brief description of the content"
              />
              {validationErrors.description && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
              )}
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${validationErrors.subject ? 'border-red-300' : ''}`}
              >
                <option value="">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name} {subject.department?.name ? `(${subject.department.name})` : ''}
                  </option>
                ))}
              </select>
              {validationErrors.subject && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.subject}</p>
              )}
            </div>

            <div>
              <label htmlFor="contentType" className="block text-sm font-medium text-gray-700">
                Content Type
              </label>
              <input
                type="text"
                id="contentType"
                value={formData.contentType === 'questionPaper' ? 'Question Paper' : 
                       formData.contentType === 'answerPaper' ? 'Answer Paper' : 
                       formData.contentType.charAt(0).toUpperCase() + formData.contentType.slice(1)}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm cursor-not-allowed"
              />
              <p className="mt-1 text-sm text-gray-500">Content type cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                File
              </label>
              <p className="mt-1 text-sm text-gray-500">
                {originalContent?.fileUrl.split('/').pop()}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                To replace the file, delete this content and upload a new one.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                'Update Content'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 