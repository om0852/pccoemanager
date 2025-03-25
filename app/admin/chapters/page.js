'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';

// Format date safely to avoid hydration mismatches
const formatDate = (dateString) => {
  try {
    if (!dateString) return '';
    
    // Use a more stable date format that doesn't depend on locale
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
    const day = date.getDate();
    
    return `${month} ${day}, ${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

export default function ChaptersPage() {
  // Add a state to track if we're on the client
  const [isClient, setIsClient] = useState(false);
  
  // Data states
  const [chapters, setChapters] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);

  // Filter states
  const [filters, setFilters] = useState({
    department: '',
    year: '',
    semester: '',
    subject: ''
  });

  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Arrays for semester and year options
  const semesterOptions = [1, 2, 3, 4, 5, 6, 7, 8];
  const yearOptions = [1, 2, 3, 4];
  
  // Mark when component is mounted on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load departments on component mount - only on the client side
  useEffect(() => {
    if (isClient) {
      fetchDepartments();
    }
  }, [isClient]);

  // Filter subjects when department, year, or semester changes
  useEffect(() => {
    if (isClient) {
      filterSubjects();
    }
  }, [filters.department, filters.year, filters.semester, subjects, isClient]);

  // Fetch chapters when subject selection changes
  useEffect(() => {
    if (isClient && filters.subject) {
      fetchChapters();
    }
  }, [filters.subject, isClient]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/departments');
      
      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }
      
      const data = await response.json();
      setDepartments(data);
      
      // After fetching departments, fetch all subjects
      await fetchAllSubjects();
      
      setLoading(false);
    } catch (error) {
      setError('Error loading departments: ' + (error.message || 'Unknown error'));
      setLoading(false);
    }
  };

  const fetchAllSubjects = async () => {
    try {
      const response = await fetch('/api/subjects?populate=department');
      
      if (!response.ok) {
        throw new Error('Failed to fetch subjects');
      }
      
      const data = await response.json();
      setSubjects(data);
      setFilteredSubjects(data);
      
      // If there are subjects, pre-select filters based on first subject
      if (data.length > 0) {
        const firstSubject = data[0];
        const departmentId = typeof firstSubject.department === 'object' 
          ? firstSubject.department?._id 
          : firstSubject.department;
        
        setFilters(prev => ({
          department: departmentId,
          year: firstSubject.year,
          semester: firstSubject.semester,
          subject: firstSubject._id
        }));
      }
    } catch (error) {
      setError('Error loading subjects: ' + (error.message || 'Unknown error'));
    }
  };

  const filterSubjects = () => {
    // Start with all subjects
    let filtered = [...subjects];
    
    // Apply department filter if selected
    if (filters.department) {
      filtered = filtered.filter(subject => {
        // Handle both populated and non-populated department data
        const subjectDeptId = typeof subject.department === 'object' 
          ? subject.department?._id 
          : subject.department;
        return subjectDeptId === filters.department;
      });
    }
    
    // Apply year filter if selected
    if (filters.year) {
      const yearNumber = parseInt(filters.year);
      filtered = filtered.filter(subject => subject.year === yearNumber);
    }
    
    // Apply semester filter if selected
    if (filters.semester) {
      const semesterNumber = parseInt(filters.semester);
      filtered = filtered.filter(subject => subject.semester === semesterNumber);
    }
    
    setFilteredSubjects(filtered);
    
    // If there's no matching subject for the current filters, clear the subject selection or select the first available
    if (filtered.length > 0) {
      // If the current selected subject is not in the filtered list, select the first one
      if (!filtered.some(s => s._id === filters.subject)) {
        setFilters(prev => ({ ...prev, subject: filtered[0]._id }));
      }
    } else {
      // Clear subject selection if no subjects match the filters
      setFilters(prev => ({ ...prev, subject: '' }));
    }
  };

  const fetchChapters = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!filters.subject) {
        setChapters([]);
        setLoading(false);
        return;
      }
      
      const response = await fetch(`/api/chapters?subject=${filters.subject}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch chapters');
      }
      
      const data = await response.json();
      setChapters(data);
      setLoading(false);
    } catch (error) {
      setError('Error loading chapters: ' + (error.message || 'Unknown error'));
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    // Reset subsequent filters when changing a parent filter
    if (name === 'department') {
      setFilters({
        department: value,
        year: '',
        semester: '',
        subject: ''
      });
    } else if (name === 'year' || name === 'semester') {
      setFilters(prev => ({
        ...prev,
        [name]: value,
        subject: '' // Reset subject when year or semester changes
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteCancel = () => {
    setDeleteId(null);
    setShowDeleteModal(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/chapters/${deleteId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete chapter');
      }
      
      // Remove the deleted chapter from the list
      setChapters(chapters.filter(chapter => chapter._id !== deleteId));
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (error) {
      setError(error.message || 'An error occurred during deletion');
    }
  };

  const resetFilters = () => {
    setFilters({
      department: '',
      year: '',
      semester: '',
      subject: ''
    });
    setChapters([]);
  };

  // Initial loading state - show this during SSR and early client-side rendering
  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Chapters</h1>
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Chapters</h1>
        {filters.subject && (
          <Link
            href={`/admin/chapters/new?subject=${filters.subject}`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add New Chapter
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filter Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Department Filter */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              id="department"
              name="department"
              value={filters.department}
              onChange={handleFilterChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name} ({dept.code || ''})
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              id="year"
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              disabled={!filters.department}
            >
              <option value="">All Years</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  Year {year}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div>
            <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
              Semester
            </label>
            <select
              id="semester"
              name="semester"
              value={filters.semester}
              onChange={handleFilterChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              disabled={!filters.department}
            >
              <option value="">All Semesters</option>
              {semesterOptions.map((semester) => (
                <option key={semester} value={semester}>
                  Semester {semester}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <select
              id="subject"
              name="subject"
              value={filters.subject}
              onChange={handleFilterChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              disabled={filteredSubjects.length === 0}
            >
              <option value="">Select Subject</option>
              {filteredSubjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name} ({subject.code || ''})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset Filters Button */}
        <div className="mt-4 flex justify-end">
          <button 
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : !filters.subject ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Please select a subject to view its chapters</p>
        </div>
      ) : chapters.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No chapters found for this subject</p>
          <Link
            href={`/admin/chapters/new?subject=${filters.subject}`}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Create First Chapter
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chapters.map((chapter) => (
                <tr key={chapter._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {chapter.order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {chapter.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {chapter.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {chapter.createdBy?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(chapter.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      chapter.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {chapter.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/chapters/edit/${chapter._id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(chapter._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal - Only render on client */}
      {isClient && showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-md shadow-lg max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-500 mb-4">Are you sure you want to delete this chapter? This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 