'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import Link from 'next/link';

// Helper function to format dates safely
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    // Use ISO string format for consistent rendering between server and client
    // This avoids locale-specific formatting that can cause hydration errors
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
    const day = date.getDate();
    
    return `${month} ${day}, ${year}`;
  } catch (e) {
    console.error('Date formatting error:', e);
    return dateString || '';
  }
};

export default function ContentLibrary() {
  const [content, setContent] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { user } = useAuth();

  useEffect(() => {
    // Fetch subjects for filtering
    const fetchSubjects = async () => {
      try {
        const response = await fetch('/api/subjects');
        if (!response.ok) {
          throw new Error('Failed to fetch subjects');
        }
        const data = await response.json();
        setSubjects(data);
      } catch (err) {
        console.error('Error fetching subjects:', err);
      }
    };

    // Fetch content
    const fetchContent = async () => {
      try {
        let url = '/api/content';
        const params = new URLSearchParams();
        
        if (selectedSubject) {
          params.append('subject', selectedSubject);
        }
        
        if (selectedType) {
          params.append('type', selectedType);
        }
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch content');
        }
        const data = await response.json();
        setContent(data);
        setIsLoading(false);
      } catch (err) {
        setError('Error loading content: ' + err.message);
        setIsLoading(false);
      }
    };

    fetchSubjects();
    fetchContent();
  }, [selectedSubject, selectedType]);

  // Filter content based on search query
  const filteredContent = content.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get color for content type badge
  const getTypeColor = (type) => {
    switch (type) {
      case 'notes':
        return 'bg-blue-100 text-blue-800';
      case 'video':
        return 'bg-purple-100 text-purple-800';
      case 'assignment':
        return 'bg-yellow-100 text-yellow-800';
      case 'questionPaper':
        return 'bg-red-100 text-red-800';
      case 'answerPaper':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format content type for display
  const formatContentType = (type) => {
    switch (type) {
      case 'notes':
        return 'Notes';
      case 'video':
        return 'Video';
      case 'assignment':
        return 'Assignment';
      case 'questionPaper':
        return 'Question Paper';
      case 'answerPaper':
        return 'Answer Paper';
      default:
        return type;
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Library</h1>
          <p className="mt-1 text-sm text-gray-500">
            Browse and download educational content
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/content/new" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Upload Content
          </Link>
        </div>
      </div>

      {/* Filter section */}
      <div className="bg-white shadow p-4 rounded-lg mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Filter Content</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <select
              id="subject"
              name="subject"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Content Type
            </label>
            <select
              id="type"
              name="type"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="notes">Notes</option>
              <option value="video">Video</option>
              <option value="assignment">Assignment</option>
              <option value="questionPaper">Question Paper</option>
              <option value="answerPaper">Answer Paper</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                name="search"
                id="search"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Search by title or description"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => {
              setSelectedSubject('');
              setSelectedType('');
              setSearchQuery('');
            }}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredContent.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
          <p className="text-gray-500">
            {selectedSubject || selectedType || searchQuery
              ? 'No content matches your filters. Try adjusting your search or filters.'
              : 'No content available yet. Be the first to upload something!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredContent.map((item) => (
            <div key={item._id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-900 truncate">{item.title}</h3>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(item.type)}`}>
                    {formatContentType(item.type)}
                  </span>
                </div>
                
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">{item.description}</p>
                
                <div className="mt-4">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium text-gray-700">Subject:</span> {item.subject?.name || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium text-gray-700">Uploaded by:</span> {item.createdBy?.name || 'Unknown'}
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium text-gray-700">Date:</span> {formatDate(item.createdAt)}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="flex justify-between items-center">
                  <a
                    href={`/api/content/download/${item._id}`}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    download
                  >
                    Download
                    <svg className="ml-1.5 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>
                  {user && user._id === item.createdBy?._id && (
                    <Link
                      href={`/content/edit/${item._id}`}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Edit
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 