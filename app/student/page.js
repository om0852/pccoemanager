'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Download, ArrowLeft, FileText, Video, BookOpen, Play } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const contentTypeIcons = {
  'Notes': FileText,
  'Video': Video,
  'Assignment': BookOpen
};

const contentTypeColors = {
  'Notes': 'bg-green-100 text-green-800',
  'Video': 'bg-blue-100 text-blue-800',
  'Assignment': 'bg-purple-100 text-purple-800'
};

// Get content type badge color
const getContentTypeColor = (type) => {
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

export default function StudentPortal() {
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [years, setYears] = useState([]);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedContentType, setSelectedContentType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStudentData();
    fetchContent();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      // Update subjects when department changes
      const dept = departments.find(d => d._id === selectedDepartment);
      setSubjects(dept ? dept.subjects : []);
      setTeachers(dept ? dept.teachers : []);
    } else {
      setSubjects([]);
      setTeachers([]);
      setSelectedSubject('');
    }
  }, [selectedDepartment, departments]);

  useEffect(() => {
    if (selectedSubject) {
      // Update chapters when subject changes
      const dept = departments.find(d => d._id === selectedDepartment);
      const subject = dept?.subjects.find(s => s._id === selectedSubject);
      setChapters(subject ? subject.chapters : []);
    } else {
      setChapters([]);
    }
  }, [selectedSubject, selectedDepartment, departments]);

  const fetchStudentData = async () => {
    try {
      setError('');
      setLoading(true);
      const response = await fetch('/api/student/data');
      
      if (!response.ok) {
        throw new Error('Failed to fetch student data');
      }
      
      const data = await response.json();
      setDepartments(data.departments);
      setSemesters(data.semesters);
      setYears(data.years);
    } catch (err) {
      console.error('Error loading student data:', err);
      setError('Unable to load student data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/content/public');
      
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }
      
      const data = await response.json();
      setContent(data);
    } catch (err) {
      console.error('Error loading content:', err);
      setError('Error loading content. Please try again later.');
    }
  };

  const filteredContent = content.filter(item => {
    const matchesDepartment = !selectedDepartment || item.subject?.department === selectedDepartment;
    const matchesSubject = !selectedSubject || item.subject?._id === selectedSubject;
    const matchesSemester = !selectedSemester || item.subject?.semester === parseInt(selectedSemester);
    const matchesYear = !selectedYear || item.subject?.year === parseInt(selectedYear);
    const matchesContentType = !selectedContentType || item.contentType === selectedContentType;
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDepartment && matchesSubject && matchesSemester && 
           matchesYear && matchesContentType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Student Resources</h1>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">All Departments</option>
          {departments.map(dept => (
            <option key={dept._id} value={dept._id}>{dept.name}</option>
          ))}
        </select>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          disabled={!selectedDepartment}
        >
          <option value="">All Subjects</option>
          {subjects.map(subject => (
            <option key={subject._id} value={subject._id}>{subject.name}</option>
          ))}
        </select>

        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">All Semesters</option>
          {semesters.map(semester => (
            <option key={semester} value={semester}>Semester {semester}</option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">All Years</option>
          {years.map(year => (
            <option key={year} value={year}>Year {year}</option>
          ))}
        </select>

        <select
          value={selectedContentType}
          onChange={(e) => setSelectedContentType(e.target.value)}
          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          <option value="notes">Notes</option>
          <option value="video">Video</option>
          <option value="assignment">Assignment</option>
          <option value="questionPaper">Question Paper</option>
          <option value="answerPaper">Answer Paper</option>
        </select>

        <div className="relative">
          <input
            type="text"
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-lg border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center text-red-600 p-4">{error}</div>
      ) : filteredContent.length === 0 ? (
        <div className="text-center text-gray-500 p-8">
          No content found matching your criteria
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getContentTypeColor(item.contentType)}`}>
                      {formatContentType(item.contentType)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(item.createdAt)}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>

                {item.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {item.description}
                  </p>
                )}

                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    {item.subject?.name}
                    {item.subject?.semester && (
                      <span className="ml-1 text-gray-400">
                        • Sem {item.subject.semester}
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {item.contentType === 'video' ? (
                      <>
                        <Link
                          href={`/content/view/${item._id}`}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <Play className="h-4 w-4 mr-1.5" />
                          Watch
                        </Link>
                        <a
                          href={item.fileUrl}
                          download
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Download className="h-4 w-4 mr-1.5" />
                          Download
                        </a>
                      </>
                    ) : (
                      <a
                        href={item.fileUrl}
                        download
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Download className="h-4 w-4 mr-1.5" />
                        Download
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 