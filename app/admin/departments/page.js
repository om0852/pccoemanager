'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Info, X, AlertTriangle, CheckCircle, Building } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminDepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  
  const { user, status, isAdmin } = useAuth();
  const router = useRouter();

  // Filter departments based on search query
  const filteredDepartments = departments.filter(
    dept => dept.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            dept.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    // Check if user is admin
    if (status !== 'loading') {
      if (!user) {
        router.push('/auth/login');
      } else if (!isAdmin()) {
        router.push('/dashboard');
      } else {
        fetchDepartments();
      }
    }
  }, [user, status, router, isAdmin]);

  const fetchDepartments = async () => {
    try {
      // For admins, we only fetch departments they are associated with
      const response = await fetch('/api/admin/departments');
      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }
      const data = await response.json();
      setDepartments(data);
      setIsLoading(false);
    } catch (err) {
      setError('Error loading departments: ' + err.message);
      setIsLoading(false);
    }
  };

  const confirmDelete = (id) => {
    const deptToDelete = departments.find(dept => dept._id === id);
    setDepartmentToDelete(deptToDelete);
    setDeleteId(id);
    setShowDeleteModal(true);
    setDeleteError('');
  };

  const cancelDelete = () => {
    setDeleteId(null);
    setShowDeleteModal(false);
    setDepartmentToDelete(null);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/departments/${deleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete department');
      }

      // Remove the deleted department from state
      setDepartments(departments.filter(dept => dept._id !== deleteId));
      setSuccessMessage('Department deleted successfully');
      setShowDeleteModal(false);
      setDepartmentToDelete(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setDeleteError(err.message);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user || !isAdmin()) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="py-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Department Management</h1>
          </div>
          <div className="mt-4 md:mt-0">
            <Link 
              href="/admin/departments/new" 
              className="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Link>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Create and manage academic departments in your institution
        </p>
      </div>

      {/* Success and Error Messages */}
      {successMessage && (
        <div className="mb-6 flex items-center p-4 text-sm text-green-800 border-l-4 border-green-500 bg-green-50 rounded-md shadow-sm">
          <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
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
        <div className="mb-6 flex items-center p-4 text-sm text-red-800 border-l-4 border-red-500 bg-red-50 rounded-md shadow-sm">
          <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-700 hover:text-red-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search and Controls */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-2 pl-10 pr-4 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {isLoading ? (
              <span>Loading departments...</span>
            ) : (
              <span>{filteredDepartments.length} department{filteredDepartments.length !== 1 ? 's' : ''} found</span>
            )}
          </div>
        </div>
      </div>

      {/* Department Listing */}
      {isLoading ? (
        <div className="flex justify-center my-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredDepartments.length === 0 ? (
        <div className="bg-white shadow-sm border border-dashed border-gray-300 rounded-lg p-12 text-center">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            {searchQuery 
              ? 'No departments match your search criteria. Try a different search term.'
              : 'You haven\'t created any departments yet. Start by adding your first department.'}
          </p>
          {!searchQuery && (
            <Link 
              href="/admin/departments/new" 
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Department
            </Link>
          )}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((department) => (
            <div 
              key={department._id} 
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{department.name}</h3>
                    {department.code && (
                      <div className="inline-block px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium mb-2">
                        Code: {department.code}
                      </div>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-gray-600 text-sm line-clamp-3">{department.description}</p>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
                <Link
                  href={`/admin/departments/edit/${department._id}`}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-colors duration-200"
                >
                  <Edit className="h-4 w-4 mr-1.5" />
                  Edit
                </Link>
                <button
                  onClick={() => confirmDelete(department._id)}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 transition-colors duration-200"
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
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
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Department</h3>
                    <div className="mt-2">
                      {departmentToDelete && (
                        <p className="text-sm text-gray-800 font-medium mb-2">
                          Are you sure you want to delete &quot;{departmentToDelete.name}&quot;?
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        This action cannot be undone. This will permanently delete the department and remove all associated data.
                      </p>
                      {deleteError && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-700 flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-1.5 flex-shrink-0" />
                            {deleteError}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                  onClick={handleDelete}
                >
                  Delete
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                  onClick={cancelDelete}
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