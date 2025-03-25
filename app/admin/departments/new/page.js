'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewAdminDepartment() {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    headId: '',
  });

  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if user is admin
    if (!loading) {
      if (!user) {
        router.push('/');
      } else if (!isAdmin()) {
        router.push('/dashboard');
      } else {
        fetchUsers();
      }
    }
  }, [user, loading, router, isAdmin]);

  const fetchUsers = async () => {
    try {
      // Only fetch teachers that the admin can manage
      const response = await fetch('/api/admin/users?role=teacher');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setErrorMessage('Error loading users: ' + err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear field-specific error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Department name is required';
    }
    
    if (!formData.code.trim()) {
      newErrors.code = 'Department code is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    // HeadId is optional, no validation needed
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create department');
      }
      
      setSuccessMessage('Department created successfully!');
      setFormData({
        name: '',
        code: '',
        description: '',
        headId: '',
      });
      
      // Navigate back to departments list after a delay
      setTimeout(() => {
        router.push('/admin/departments');
      }, 2000);
      
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || !isAdmin()) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">Add New Department</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create a new department for your administration
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/admin/departments" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Back to Departments
            </Link>
          </div>
        </div>

        {successMessage && (
          <div className="mb-4 p-4 text-sm text-green-700 bg-green-100 rounded-lg">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {errorMessage}
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Department Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.name ? 'border-red-300' : ''
                }`}
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Department Code
              </label>
              <input
                type="text"
                name="code"
                id="code"
                maxLength="10"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.code ? 'border-red-300' : ''
                }`}
                value={formData.code}
                onChange={handleChange}
              />
              {errors.code && (
                <p className="mt-2 text-sm text-red-600">{errors.code}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                A unique code for the department (max 10 characters)
              </p>
            </div>

            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows="3"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.description ? 'border-red-300' : ''
                }`}
                value={formData.description}
                onChange={handleChange}
              ></textarea>
              {errors.description && (
                <p className="mt-2 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="headId" className="block text-sm font-medium text-gray-700">
                Department Head (Optional)
              </label>
              <select
                name="headId"
                id="headId"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.headId}
                onChange={handleChange}
              >
                <option value="">-- Select a Head --</option>
                {users.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.name} (Teacher)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Department'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 