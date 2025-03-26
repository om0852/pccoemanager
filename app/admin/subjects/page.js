'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Book, Search, Edit, Trash2, Filter, X, AlertTriangle, CheckCircle, PlusCircle, BookOpen, Layers, Building, UserPlus, Calendar, GraduationCap } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (err) {
    console.error('Date formatting error:', err);
    return 'Invalid Date';
  }
};

export default function AdminSubjectsPage() {
  const { user, status, isAdmin } = useAuth();
  const router = useRouter();
  
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Filters
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // For deletion functionality
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  
  // Redirect if not admin
  useEffect(() => {
    if (status !== 'loading' && (!user || !isAdmin())) {
      router.push('/dashboard');
    }
  }, [user, status, isAdmin, router]);
  
  // Load data when filters change
  useEffect(() => {
    if (user && isAdmin()) {
      fetchData();
    }
  }, [user, isAdmin, selectedDepartment, selectedYear, selectedSemester]);

  const fetchData = async () => {
    try {
      setDataLoading(true);
      setError('');
      
      // Fetch departments first
      const departmentsResponse = await fetch('/api/admin/departments');
      if (!departmentsResponse.ok) {
        if (departmentsResponse.status === 403) {
          throw new Error('You do not have permission to access departments');
        }
        throw new Error('Failed to fetch departments');
      }
      const departmentsData = await departmentsResponse.json();
      setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
      
      // Build query parameters for subjects
      const queryParams = new URLSearchParams();
      if (selectedDepartment) {
        queryParams.append('department', selectedDepartment);
      }
      if (selectedYear) {
        queryParams.append('year', selectedYear);
      }
      if (selectedSemester) {
        queryParams.append('semester', selectedSemester);
      }
      
      // Always request populated fields
      queryParams.append('populate', 'department,teachers');
      
      // Fetch subjects with filters
      const subjectsResponse = await fetch(`/api/subjects?${queryParams}`);
      if (!subjectsResponse.ok) {
        if (subjectsResponse.status === 403) {
          throw new Error('You do not have permission to access subjects');
        }
        throw new Error('Failed to fetch subjects');
      }
      const subjectsData = await subjectsResponse.json();
      
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Failed to load data. Please try again later.');
    } finally {
      setDataLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    const selectedSubject = subjects.find(s => s._id === id);
    setSubjectToDelete(selectedSubject);
    setDeleteId(id);
    setShowDeleteModal(true);
  };
  
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
    setSubjectToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    
    try {
      setDeleting(true);
      const response = await fetch(`/api/subjects/${deleteId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete subject');
      }
      
      // Remove the subject from state
      setSubjects(subjects.filter(subj => subj._id !== deleteId));
      setSuccessMessage('Subject deleted successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error deleting subject:', error);
      setError('Failed to delete subject. Please try again.');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setDeleteId(null);
      setSubjectToDelete(null);
    }
  };
  
  // Filter subjects based on search query
  const filteredSubjects = subjects.filter(subject => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase().trim();
    return (
      subject.name?.toLowerCase().includes(query) ||
      subject.code?.toLowerCase().includes(query) ||
      (subject.description && subject.description.toLowerCase().includes(query))
    );
  });
  
  // Generate year options (1-4)
  const yearOptions = [1, 2, 3, 4];
  
  // Generate semester options (1-8)
  const semesterOptions = [1, 2, 3, 4, 5, 6, 7, 8];
  
  // Reset all filters
  const resetFilters = () => {
    setSelectedDepartment('');
    setSelectedYear('');
    setSelectedSemester('');
    setSearchQuery('');
    setShowFilters(false);
  };
  
  // Get semester color
  const getSemesterColor = (semester) => {
    switch (semester % 4) {
      case 1: return 'bg-blue-100 text-blue-800 border-blue-200';
      case 2: return 'bg-purple-100 text-purple-800 border-purple-200';
      case 3: return 'bg-amber-100 text-amber-800 border-amber-200';
      case 0: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Get year color
  const getYearColor = (year) => {
    switch (year) {
      case 1: return 'bg-teal-100 text-teal-800 border-teal-200';
      case 2: return 'bg-violet-100 text-violet-800 border-violet-200';
      case 3: return 'bg-rose-100 text-rose-800 border-rose-200';
      case 4: return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Loading state
  if (status === 'loading' || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      {/* Page Header */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-indigo-600 mr-4" />
            <h1 className="text-2xl font-bold text-gray-900">Subject Management</h1>
          </div>
          <div className="mt-5 md:mt-0">
            <Link
              href="/admin/subjects/new"
              className="inline-flex items-center px-5 py-2.5 rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <PlusCircle className="h-4 w-4 mr-2.5" />
              Add New Subject
            </Link>
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-600">
          Create and manage subjects across departments
        </p>
      </div>

      {/* Success and Error Messages */}
      {successMessage && (
        <div className="mb-8 flex items-center p-5 text-sm text-green-800 border-l-4 border-green-500 bg-green-50 rounded-md shadow-sm">
          <CheckCircle className="h-5 w-5 mr-3 text-green-500" />
          <span>{successMessage}</span>
          <button 
            onClick={() => setSuccessMessage('')}
            className="ml-auto text-green-700 hover:text-green-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="mb-8 flex items-center p-5 text-sm text-red-800 border-l-4 border-red-500 bg-red-50 rounded-md shadow-sm">
          <AlertTriangle className="h-5 w-5 mr-3 text-red-500" />
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-700 hover:text-red-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-3 pl-12 pr-4 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex items-center space-x-5">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Filter className="h-4 w-4 mr-2.5" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              <div className="text-sm text-gray-500">
                {dataLoading ? (
                  <span>Loading subjects...</span>
                ) : (
                  <span>{filteredSubjects.length} subject{filteredSubjects.length !== 1 ? 's' : ''} found</span>
                )}
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="pt-5 border-t border-gray-200 mt-5">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                {/* Department Filter */}
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Department
                  </label>
                  <select
                    id="department"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2.5"
                  >
                    <option value="">All Departments</option>
                    {departments.map((department) => (
                      <option key={department._id} value={department._id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Year Filter */}
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Year
                  </label>
                  <select
                    id="year"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2.5"
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
                  <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Semester
                  </label>
                  <select
                    id="semester"
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2.5"
                  >
                    <option value="">All Semesters</option>
                    {semesterOptions.map((semester) => (
                      <option key={semester} value={semester}>
                        Semester {semester}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Reset Filters */}
                <div className="flex items-end">
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center px-4 py-2.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Subjects Table */}
      {dataLoading ? (
        <div className="flex justify-center my-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="bg-white shadow-sm border border-dashed border-gray-300 rounded-lg p-16 text-center">
          <BookOpen className="h-14 w-14 text-gray-400 mx-auto mb-5" />
          <h3 className="text-lg font-medium text-gray-900 mb-3">No subjects found</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            {searchQuery || selectedDepartment || selectedYear || selectedSemester
              ? 'No subjects match your search criteria. Try different filters.'
              : 'You haven\'t added any subjects yet. Start by adding your first subject.'}
          </p>
          {(!searchQuery && !selectedDepartment && !selectedYear && !selectedSemester) && (
            <Link 
              href="/admin/subjects/new" 
              className="inline-flex items-center px-5 py-2.5 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <PlusCircle className="h-4 w-4 mr-2.5" />
              Add Your First Subject
            </Link>
          )}
          {(searchQuery || selectedDepartment || selectedYear || selectedSemester) && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center px-5 py-2.5 rounded-md text-sm font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject Details
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Department
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Year / Semester
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Teachers
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubjects.map((subject) => (
                  <tr key={subject._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-5">
                      <div className="flex items-start">
                        <BookOpen className="h-5 w-5 text-indigo-500 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{subject.name}</div>
                          <div className="text-sm text-indigo-600 font-medium">{subject.code}</div>
                          <div className="text-xs text-gray-500 mt-1 max-w-xs line-clamp-2">{subject.description || 'No description available'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 hidden md:table-cell">
                      <div className="flex items-center text-sm text-gray-600">
                        <Building className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
                        <span className="truncate max-w-[150px]">{subject.department?.name || 'Unknown Department'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap hidden sm:table-cell">
                      <div className="flex flex-col space-y-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getYearColor(subject.year)} border`}>
                          <Layers className="h-3 w-3 mr-1.5" />
                          Year {subject.year}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getSemesterColor(subject.semester)} border`}>
                          <Calendar className="h-3 w-3 mr-1.5" />
                          Semester {subject.semester}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 hidden lg:table-cell">
                      <div className="flex items-start">
                        <GraduationCap className="h-4 w-4 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          {subject.teachers?.length > 0 ? (
                            <div className="text-sm text-gray-600">
                              {subject.teachers.slice(0, 2).map((teacher, index) => (
                                <div key={index} className="truncate max-w-[200px]">
                                  {teacher.name}
                                </div>
                              ))}
                              {subject.teachers.length > 2 && (
                                <div className="text-indigo-500 text-xs">
                                  +{subject.teachers.length - 2} more
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-amber-500 text-sm flex items-center">
                              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                              No teachers assigned
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center space-x-3">
                        <Link
                          href={`/admin/subjects/edit/${subject._id}`}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 transition-colors duration-200"
                        >
                          <Edit className="h-4 w-4 mr-1.5" />
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(subject._id)}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4 mr-1.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-6 pt-6 pb-5 sm:p-7 sm:pb-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-5 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Subject</h3>
                    <div className="mt-3">
                      {subjectToDelete && (
                        <p className="text-sm text-gray-800 font-medium mb-3">
                          Are you sure you want to delete &quot;{subjectToDelete.name}&quot;?
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        This action cannot be undone. All content and chapters associated with this subject will also be deleted.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 sm:px-7 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-5 py-2.5 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-4 sm:w-auto sm:text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Deleting...' : 'Delete Subject'}
                </button>
                <button 
                  type="button" 
                  onClick={handleDeleteCancel}
                  disabled={deleting}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-5 py-2.5 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 