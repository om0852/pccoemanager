'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UploadContent() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    subject: '',
    chapter: '',
    semester: '',
    year: '',
    contentType: 'notes',
  });
  const [file, setFile] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);
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
        fetchDepartments();
      }
    }
  }, [user, loading, router]);

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }
      const data = await response.json();
      setDepartments(data);
    } catch (err) {
      setError('Error loading departments: ' + err.message);
    }
  };

  // Fetch subjects when department changes
  useEffect(() => {
    if (formData.department) {
      fetchSubjects(formData.department);
    } else {
      setSubjects([]);
      setFormData(prev => ({ ...prev, subject: '', chapter: '' }));
    }
  }, [formData.department]);

  // Fetch chapters when subject changes
  useEffect(() => {
    if (formData.subject) {
      fetchChapters(formData.subject);
    } else {
      setChapters([]);
      setFormData(prev => ({ ...prev, chapter: '' }));
    }
  }, [formData.subject]);

  const fetchSubjects = async (departmentId) => {
    try {
      setIsLoadingSubjects(true);
      setError(''); // Clear any previous errors
      console.log('Fetching subjects for department:', departmentId);
      
      if (!departmentId) {
        console.warn('No department ID provided for subject fetch');
        setSubjects([]);
        setIsLoadingSubjects(false);
        return;
      }
      
      // Find department name for better logs
      const selectedDept = departments.find(d => d._id === departmentId);
      if (selectedDept) {
        console.log(`Selected department: ${selectedDept.name} (${selectedDept.code})`);
      }
      
      // Check if ENTC department and handle specially
      const isEntcDept = selectedDept && (selectedDept.code === 'ENTC' || selectedDept.name.includes('ENTC'));
      if (isEntcDept) {
        console.log('ENTC department detected - watching for potential issues');
      }
      
      // Add header to indicate this is for content upload
      const response = await fetch(`/api/subjects?department=${departmentId}`, {
        headers: {
          'x-content-upload': 'true'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`Failed to fetch subjects: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`Fetched ${data.length} subjects for department ID ${departmentId}`);
      
      if (!data || !Array.isArray(data)) {
        console.warn('Subjects data is not an array:', data);
        setSubjects([]);
        setIsLoadingSubjects(false);
        return;
      }
      
      // Special handling for ENTC subjects - common issue area
      if (data.length === 0 && isEntcDept) {
        console.warn('No subjects returned for ENTC department, but we expect some - this may be an issue');
        setError(`No subjects found for ${selectedDept.name} department. Use the debug button below to try a different approach.`);
      }
      
      // Log each subject for debugging
      data.forEach((subject, index) => {
        console.log(`Subject ${index}:`, {
          id: subject._id || 'No ID',
          name: subject.name || 'No name',
          code: subject.code || 'No code',
          department: subject.department || 'No department'
        });
      });
      
      setSubjects(data);
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setError('Error loading subjects: ' + (err.message || 'Unknown error'));
      setSubjects([]); // Reset subjects on error
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const fetchChapters = async (subjectId) => {
    try {
      setIsLoadingChapters(true);
      const response = await fetch(`/api/chapters?subject=${subjectId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chapters');
      }
      const data = await response.json();
      setChapters(data);
      setIsLoadingChapters(false);
    } catch (err) {
      setError('Error loading chapters: ' + err.message);
      setIsLoadingChapters(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setValidationErrors({ ...validationErrors, [name]: '' });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setValidationErrors({ ...validationErrors, file: '' });
    }
  };

  const validateContentType = (file, contentType) => {
    if (!file) return false;
    
    const fileType = file.type;
    
    switch (contentType) {
      case 'notes':
        return fileType.includes('pdf') || fileType.includes('word') || fileType.includes('text');
      case 'video':
        return fileType.includes('video');
      case 'assignment':
      case 'question-paper':
      case 'answer-paper':
        return fileType.includes('pdf') || fileType.includes('word') || fileType.includes('text');
      default:
        return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.department) errors.department = 'Department is required';
    if (!formData.subject) errors.subject = 'Subject is required';
    // Chapter, semester, and year are optional
    if (!file) errors.file = 'File is required';
    
    // Validate file type
    if (file && !validateContentType(file, formData.contentType)) {
      errors.file = 'Invalid file type for the selected content type';
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // First upload the file
      const fileData = new FormData();
      fileData.append('file', file);
      fileData.append('contentType', formData.contentType);
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: fileData,
      });
      
      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json();
        throw new Error(uploadError.error || 'Failed to upload file');
      }
      
      const uploadResult = await uploadResponse.json();
      
      // Now create the content entry
      const contentResponse = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          department: formData.department,
          subject: formData.subject,
          chapter: formData.chapter || undefined,
          semester: formData.semester || undefined,
          year: formData.year || undefined,
          contentType: formData.contentType,
          fileUrl: uploadResult.fileUrl,
        }),
      });
      
      if (!contentResponse.ok) {
        const contentError = await contentResponse.json();
        throw new Error(contentError.error || 'Failed to create content entry');
      }
      
      // Success - reset form
      setSuccessMessage('Content uploaded successfully!');
      setFormData({
        title: '',
        description: '',
        department: '',
        subject: '',
        chapter: '',
        semester: '',
        year: '',
        contentType: 'notes',
      });
      setFile(null);
      
      // Clear file input
      const fileInput = document.getElementById('file-upload');
      if (fileInput) fileInput.value = '';
      
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

  // Add a button to debug subjects for ENTC department
  const debugFetchSubjects = async () => {
    try {
      setError('');
      console.log('DEBUG: Attempting direct fetch of all subjects');
      
      const response = await fetch('/api/subjects', {
        headers: {
          'x-content-upload': 'true'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch all subjects: ${response.status}`);
      }
      
      const allSubjects = await response.json();
      console.log('DEBUG: Total subjects in system:', allSubjects.length);
      
      // Find ENTC department ID
      const entcDept = departments.find(d => d.code === 'ENTC' || d.name.includes('ENTC'));
      if (entcDept) {
        console.log('DEBUG: Found ENTC department:', entcDept);
        
        // Find all subjects for ENTC department
        const entcSubjects = allSubjects.filter(s => {
          const deptId = typeof s.department === 'object' ? s.department?._id : s.department;
          return deptId === entcDept._id;
        });
        
        console.log(`DEBUG: Found ${entcSubjects.length} subjects for ENTC department:`, entcSubjects);
        
        if (entcSubjects.length > 0) {
          // Use these subjects directly
          setSubjects(entcSubjects);
          setSuccessMessage(`Found ${entcSubjects.length} subjects for ENTC department through direct query`);
        } else {
          setError('No subjects found for ENTC department in the entire database');
        }
      } else {
        setError('Could not find ENTC department in the departments list');
      }
    } catch (err) {
      console.error('DEBUG ERROR:', err);
      setError('Debug fetch failed: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Arrays for semester and year options
  const semesterOptions = [1, 2, 3, 4, 5, 6, 7, 8];
  const yearOptions = [1, 2, 3, 4];

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upload Content</h1>
          <p className="mt-1 text-sm text-gray-500">
            Share educational materials with your students
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link href="/content" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Back to Content Library
          </Link>
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

            {/* Department Selection */}
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                Department
              </label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${validationErrors.department ? 'border-red-300' : ''}`}
              >
                <option value="">Select a department</option>
                {departments.map((department) => (
                  <option key={department._id} value={department._id}>
                    {department.name} ({department.code})
                  </option>
                ))}
              </select>
              {validationErrors.department && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.department}</p>
              )}
            </div>

            {/* Subject Selection */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                disabled={!formData.department || isLoadingSubjects}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${validationErrors.subject ? 'border-red-300' : ''} ${(!formData.department || isLoadingSubjects) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="">
                  {isLoadingSubjects ? 'Loading subjects...' : 'Select a subject'}
                </option>
                {subjects && subjects.length > 0 ? (
                  subjects.map((subject) => {
                    // Ensure we have valid data to display
                    const subjectName = typeof subject.name === 'string' ? subject.name : 'Unnamed subject';
                    const subjectCode = typeof subject.code === 'string' ? subject.code : '';
                    const displayName = subjectCode 
                      ? `${subjectName} (${subjectCode})` 
                      : subjectName;
                      
                    return (
                      <option key={subject._id} value={subject._id}>
                        {displayName}
                      </option>
                    );
                  })
                ) : (
                  <option value="" disabled>No subjects available for this department</option>
                )}
              </select>
              {validationErrors.subject && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.subject}</p>
              )}
              {/* Display the number of subjects for debugging */}
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500">
                  {subjects.length > 0 ? `${subjects.length} subjects available` : ''}
                </p>
                {formData.department && subjects.length === 0 && (
                  <button 
                    type="button"
                    onClick={debugFetchSubjects}
                    className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200"
                  >
                    Debug: Try direct fetch
                  </button>
                )}
              </div>
            </div>

            {/* Chapter Selection */}
            <div>
              <label htmlFor="chapter" className="block text-sm font-medium text-gray-700">
                Chapter (optional)
              </label>
              <select
                id="chapter"
                name="chapter"
                value={formData.chapter}
                onChange={handleChange}
                disabled={!formData.subject || isLoadingChapters}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${(!formData.subject || isLoadingChapters) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="">
                  {isLoadingChapters ? 'Loading chapters...' : 'Select a chapter (optional)'}
                </option>
                {chapters.map((chapter) => (
                  <option key={chapter._id} value={chapter._id}>
                    {chapter.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Selection */}
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                Year (optional)
              </label>
              <select
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Select a year (optional)</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    Year {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester Selection */}
            <div>
              <label htmlFor="semester" className="block text-sm font-medium text-gray-700">
                Semester (optional)
              </label>
              <select
                id="semester"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Select a semester (optional)</option>
                {semesterOptions.map((semester) => (
                  <option key={semester} value={semester}>
                    Semester {semester}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="contentType" className="block text-sm font-medium text-gray-700">
                Content Type
              </label>
              <select
                id="contentType"
                name="contentType"
                value={formData.contentType}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="notes">Notes</option>
                <option value="video">Video</option>
                <option value="assignment">Assignment</option>
                <option value="question-paper">Question Paper</option>
                <option value="answer-paper">Answer Paper</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Upload File
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a file</span>
                      <input 
                        id="file-upload" 
                        name="file-upload" 
                        type="file" 
                        className="sr-only" 
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {formData.contentType === 'video' ? 'MP4, WebM up to 100MB' : 'PDF, DOC, DOCX up to 10MB'}
                  </p>
                </div>
              </div>
              {file && (
                <p className="mt-2 text-sm text-gray-500">
                  Selected file: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
              {validationErrors.file && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.file}</p>
              )}
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
                  Uploading...
                </>
              ) : (
                'Upload Content'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 