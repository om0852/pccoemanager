'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewSubjectPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    department: '',
    semester: '',
    year: '',
    teachers: []
  });
  
  // State for departments and teachers
  const [departments, setDepartments] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  
  // Loading states
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [teachersLoading, setTeachersLoading] = useState(true);
  
  // Form submission states
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');
  
  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin())) {
      router.push('/dashboard');
    }
  }, [user, loading, isAdmin, router]);
  
  // Fetch departments and teachers
  useEffect(() => {
    if (user && isAdmin()) {
      fetchDepartments();
      fetchTeachers();
    }
  }, [user, isAdmin]);
  
  // Fetch departments
  const fetchDepartments = async () => {
    try {
      setDepartmentsLoading(true);
      const response = await fetch('/api/admin/departments');
      
      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }
      
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setFormError('Failed to load departments. Please try again later.');
    } finally {
      setDepartmentsLoading(false);
    }
  };
  
  // Fetch teachers
  const fetchTeachers = async () => {
    try {
      setTeachersLoading(true);
      const response = await fetch('/api/admin/users?role=teacher');
      
      if (!response.ok) {
        throw new Error('Failed to fetch teachers');
      }
      
      const data = await response.json();
      setAvailableTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setFormError('Failed to load teachers. Please try again later.');
    } finally {
      setTeachersLoading(false);
    }
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors for the field being changed
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle teacher selection
  const handleTeacherSelection = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, teachers: selectedOptions }));
    
    // Clear teacher selection errors
    if (errors.teachers) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.teachers;
        return newErrors;
      });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Subject name is required';
    else if (formData.name.length > 100) newErrors.name = 'Name cannot be more than 100 characters';
    
    if (!formData.code.trim()) newErrors.code = 'Subject code is required';
    else if (formData.code.length > 20) newErrors.code = 'Code cannot be more than 20 characters';
    
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    else if (formData.description.length > 500) newErrors.description = 'Description cannot be more than 500 characters';
    
    if (!formData.department) newErrors.department = 'Department is required';
    
    if (!formData.semester) newErrors.semester = 'Semester is required';
    else if (parseInt(formData.semester) < 1 || parseInt(formData.semester) > 8) 
      newErrors.semester = 'Semester must be between 1 and 8';
    
    if (!formData.year) newErrors.year = 'Year is required';
    else if (parseInt(formData.year) < 1 || parseInt(formData.year) > 4) 
      newErrors.year = 'Year must be between 1 and 4';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setFormError('');
    
    try {
      // Convert semester and year to numbers
      const dataToSend = {
        ...formData,
        semester: parseInt(formData.semester),
        year: parseInt(formData.year)
      };
      
      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create subject');
      }
      
      // Show success message
      setSuccessMessage('Subject created successfully!');
      
      // Reset form
      setFormData({
        name: '',
        code: '',
        description: '',
        department: '',
        semester: '',
        year: '',
        teachers: []
      });
      
      // Redirect to subjects list after a delay
      setTimeout(() => {
        router.push('/admin/subjects');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating subject:', error);
      setFormError(error.message || 'Failed to create subject. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Generate semester options (1-8)
  const semesterOptions = [1, 2, 3, 4, 5, 6, 7, 8];
  
  // Generate year options (1-4)
  const yearOptions = [1, 2, 3, 4];
  
  // Loading state
  if (loading || !user) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Subject</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add a new subject to your department
          </p>
        </div>
        <Link
          href="/admin/subjects"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back to Subjects
        </Link>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form Error */}
      {formError && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-8.414l2.293-2.293a1 1 0 011.414 1.414L11.414 10l2.293 2.293a1 1 0 11-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 011.414-1.414L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{formError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Subject Form */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Subject Name */}
              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Subject Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="e.g. Introduction to Computer Science"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Subject Code */}
              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  Subject Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  id="code"
                  value={formData.code}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${errors.code ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="e.g. CS101"
                />
                {errors.code && (
                  <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                )}
              </div>

              {/* Department */}
              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${errors.department ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  disabled={departmentsLoading}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {errors.department && (
                  <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                )}
                {departmentsLoading && (
                  <p className="mt-1 text-sm text-gray-500">Loading departments...</p>
                )}
              </div>

              {/* Year and Semester Wrapper */}
              <div className="col-span-2 sm:col-span-1 grid grid-cols-2 gap-4">
                {/* Year */}
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className={`mt-1 block w-full border ${errors.year ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  >
                    <option value="">Select Year</option>
                    {yearOptions.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  {errors.year && (
                    <p className="mt-1 text-sm text-red-600">{errors.year}</p>
                  )}
                </div>

                {/* Semester */}
                <div>
                  <label htmlFor="semester" className="block text-sm font-medium text-gray-700">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="semester"
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className={`mt-1 block w-full border ${errors.semester ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  >
                    <option value="">Select Semester</option>
                    {semesterOptions.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.semester && (
                    <p className="mt-1 text-sm text-red-600">{errors.semester}</p>
                  )}
                </div>
              </div>

              {/* Teachers */}
              <div className="col-span-2">
                <label htmlFor="teachers" className="block text-sm font-medium text-gray-700">
                  Assign Teachers <span className="text-gray-400">(Optional)</span>
                </label>
                <select
                  id="teachers"
                  multiple
                  value={formData.teachers}
                  onChange={handleTeacherSelection}
                  className={`mt-1 block w-full border ${errors.teachers ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  disabled={teachersLoading}
                  size={4}
                >
                  {availableTeachers.map(teacher => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name} ({teacher.email})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Hold Ctrl (or Cmd on Mac) to select multiple teachers
                </p>
                {teachersLoading && (
                  <p className="mt-1 text-sm text-gray-500">Loading teachers...</p>
                )}
                {errors.teachers && (
                  <p className="mt-1 text-sm text-red-600">{errors.teachers}</p>
                )}
              </div>

              {/* Description */}
              <div className="col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${errors.description ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="Brief description of the subject..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.description.length}/500 characters
                </p>
              </div>

              {/* Submit Button */}
              <div className="col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => router.push('/admin/subjects')}
                  className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Creating...' : 'Create Subject'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 