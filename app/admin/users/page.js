'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, X, AlertTriangle, CheckCircle, Users, UserPlus, Filter, Calendar, Mail, User } from 'lucide-react';
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

export default function AdminUsersPage() {
  const { user, status, isAdmin } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // For deletion functionality
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  // For filtering
  const [selectedRole, setSelectedRole] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Redirect if not admin
  useEffect(() => {
    if (status !== 'loading' && (!user || !isAdmin())) {
      router.push('/dashboard');
    }
  }, [user, status, isAdmin, router]);

  // Fetch teachers and admins
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || !isAdmin()) return;
      
      try {
        setDataLoading(true);
        
        // Fetch all users (the API will handle permissions)
        const response = await fetch('/api/admin/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : []);
        setFilteredUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users. Please try again later.');
      } finally {
        setDataLoading(false);
      }
    };

    if (status === 'authenticated' && isAdmin()) {
      fetchUsers();
    }
  }, [user, status, isAdmin]);

  // Apply filters when they change
  useEffect(() => {
    filterUsers();
  }, [searchQuery, selectedRole, users]);

  // Filter users based on search query and role
  const filterUsers = () => {
    let result = [...users];
    
    // Filter by role
    if (selectedRole) {
      result = result.filter(user => user.role === selectedRole);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(user => 
        user.name?.toLowerCase().includes(query) || 
        user.email?.toLowerCase().includes(query)
      );
    }
    
    setFilteredUsers(result);
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedRole('');
    setSearchQuery('');
    setShowFilters(false);
  };

  // Handle deletion
  const handleDeleteClick = (id) => {
    const selectedUser = users.find(u => u._id === id);
    setUserToDelete(selectedUser);
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteCancel = () => {
    setDeleteId(null);
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    
    try {
      setDeleting(true);
      
      const response = await fetch(`/api/users/${deleteId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }
      
      // Remove user from state
      setUsers(users.filter(u => u._id !== deleteId));
      
      // Show success message
      setSuccessMessage('User deleted successfully.');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error.message || 'Failed to delete user');
      
      // Hide error message after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setDeleteId(null);
      setUserToDelete(null);
    }
  };

  // Get role label for display
  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'teacher':
        return 'Teacher';
      case 'master-admin':
        return 'Master Admin';
      default:
        return role?.charAt(0).toUpperCase() + role?.slice(1) || 'Unknown';
    }
  };

  // Get role color for role badge
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'teacher':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'master-admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get role icon
  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <User className="h-3 w-3" />;
      case 'teacher':
        return <User className="h-3 w-3" />;
      case 'master-admin':
        return <User className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  // If still loading or not an admin, show loading
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
            <Users className="h-8 w-8 text-blue-600 mr-4" />
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          </div>
          <div className="mt-5 md:mt-0">
            <Link 
              href="/admin/users/new" 
              className="inline-flex items-center px-5 py-2.5 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <UserPlus className="h-4 w-4 mr-2.5" />
              Add New User
            </Link>
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-600">
          Create and manage users for your institution
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
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-3 pl-12 pr-4 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                className="inline-flex items-center px-4 py-2.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Filter className="h-4 w-4 mr-2.5" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              <div className="text-sm text-gray-500">
                {dataLoading ? (
                  <span>Loading users...</span>
                ) : (
                  <span>{filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found</span>
                )}
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="pt-5 border-t border-gray-200 mt-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2.5"
                  >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="teacher">Teacher</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex items-end">
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center px-4 py-2.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Users Listing */}
      {dataLoading ? (
        <div className="flex justify-center my-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white shadow-sm border border-dashed border-gray-300 rounded-lg p-16 text-center">
          <Users className="h-14 w-14 text-gray-400 mx-auto mb-5" />
          <h3 className="text-lg font-medium text-gray-900 mb-3">No users found</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            {searchQuery || selectedRole
              ? 'No users match your search criteria. Try different filters.'
              : 'You haven\'t added any users yet. Start by adding your first user.'}
          </p>
          {(!searchQuery && !selectedRole) && (
            <Link 
              href="/admin/users/new" 
              className="inline-flex items-center px-5 py-2.5 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <UserPlus className="h-4 w-4 mr-2.5" />
              Add Your First User
            </Link>
          )}
          {(searchQuery || selectedRole) && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center px-5 py-2.5 rounded-md text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredUsers.map((userData) => (
            <div 
              key={userData._id} 
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-7">
                <div className="flex flex-col mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{userData.name}</h3>
                  <div className="flex items-center mb-4">
                    <Mail className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600">{userData.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(userData.role)} border`}>
                      {getRoleIcon(userData.role)}
                      <span className="ml-1.5">{getRoleLabel(userData.role)}</span>
                    </span>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1.5" />
                      {formatDate(userData.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-7 py-5 bg-gray-50 border-t border-gray-200 flex justify-between">
                <Link
                  href={`/admin/users/edit/${userData._id}`}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-colors duration-200"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
                <button
                  onClick={() => handleDeleteClick(userData._id)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 transition-colors duration-200"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
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
              <div className="bg-white px-6 pt-6 pb-5 sm:p-7 sm:pb-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-5 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete User</h3>
                    <div className="mt-3">
                      {userToDelete && (
                        <p className="text-sm text-gray-800 font-medium mb-3">
                          Are you sure you want to delete "{userToDelete.name}"?
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        This action cannot be undone. This will permanently delete the user, their access permissions, and all associated data.
                      </p>
                      {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-700 flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                            {error}
                          </p>
                        </div>
                      )}
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
                  {deleting ? 'Deleting...' : 'Delete User'}
                </button>
                <button 
                  type="button" 
                  onClick={handleDeleteCancel}
                  disabled={deleting}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-5 py-2.5 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors duration-200"
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