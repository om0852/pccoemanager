'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MasterAdminDashboard() {
  const { user, loading, isMasterAdmin } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    departments: 0,
    subjects: 0,
    users: { total: 0, admins: 0, teachers: 0 },
    content: 0,
  });
  const [dataLoading, setDataLoading] = useState(true);

  // Redirect if not master admin
  useEffect(() => {
    if (!loading && (!user || !isMasterAdmin())) {
      router.push('/dashboard');
    }
  }, [user, loading, isMasterAdmin, router]);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        setDataLoading(true);
        
        // Fetch stats using Promise.all for parallel requests
        const [departmentsRes, subjectsRes, usersRes, contentRes] = await Promise.all([
          fetch('/api/departments'),
          fetch('/api/subjects'),
          fetch('/api/users'),
          fetch('/api/content')
        ]);

        const departments = await departmentsRes.json();
        const subjects = await subjectsRes.json();
        const users = await usersRes.json();
        const content = await contentRes.json();

        // Count users by role
        const admins = users.filter(u => u.role === 'admin').length;
        const teachers = users.filter(u => u.role === 'teacher').length;

        setStats({
          departments: Array.isArray(departments) ? departments.length : 0,
          subjects: Array.isArray(subjects) ? subjects.length : 0,
          users: { 
            total: Array.isArray(users) ? users.length : 0,
            admins,
            teachers
          },
          content: Array.isArray(content) ? content.length : 0,
        });
      } catch (error) {
        console.error('Error fetching master admin stats:', error);
      } finally {
        setDataLoading(false);
      }
    };

    if (user && isMasterAdmin()) {
      fetchStats();
    }
  }, [user, isMasterAdmin]);

  // If still loading or not a master admin, show loading
  if (loading || !user || !isMasterAdmin()) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Check if we need to add the specified email as a master admin
  const shouldHighlightEmail = user.email !== 'salunkeom474@gmail.com';

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Master Admin Dashboard</h1>
        <p className="mt-2 text-lg text-gray-600">
          Manage all aspects of your college portal
        </p>
        
        {shouldHighlightEmail && (
          <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Note: The account <strong>salunkeom474@gmail.com</strong> is not currently set as a master admin. 
                  You can add this account using the &quot;Admin Users&quot; section.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {dataLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Departments</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stats.departments}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link href="/master-admin/departments" className="font-medium text-blue-600 hover:text-blue-500">
                    View all departments
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Subjects</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stats.subjects}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link href="/master-admin/subjects" className="font-medium text-blue-600 hover:text-blue-500">
                    View all subjects
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Users</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {stats.users.total} 
                          <span className="ml-2 text-sm text-gray-500">({stats.users.admins} admins, {stats.users.teachers} teachers)</span>
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link href="/master-admin/users" className="font-medium text-blue-600 hover:text-blue-500">
                    View all users
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Content Items</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stats.content}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link href="/content" className="font-medium text-blue-600 hover:text-blue-500">
                    View content library
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Main Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                <div className="p-5">
                  <h3 className="text-lg font-medium text-gray-900">Create Admin User</h3>
                  <p className="mt-1 text-sm text-gray-500">Add a new administrator to help manage the system.</p>
                  <Link
                    href="/master-admin/users/new"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add Admin
                  </Link>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                <div className="p-5">
                  <h3 className="text-lg font-medium text-gray-900">Create Department</h3>
                  <p className="mt-1 text-sm text-gray-500">Add a new department to your institution.</p>
                  <Link
                    href="/master-admin/departments/new"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add Department
                  </Link>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                <div className="p-5">
                  <h3 className="text-lg font-medium text-gray-900">Create Subject</h3>
                  <p className="mt-1 text-sm text-gray-500">Add a new subject to a department.</p>
                  <Link
                    href="/master-admin/subjects/new"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add Subject
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* System Management */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">System Management</h2>
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">User Management</h3>
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-sm text-gray-500">
                      <p>Manage administrative users and teaching staff.</p>
                    </div>
                    <div className="mt-3 space-y-2">
                      <Link
                        href="/master-admin/users"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        View All Users
                      </Link>
                      <Link
                        href="/master-admin/users/new"
                        className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Add New User
                      </Link>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">
                      <p>Manage departments, subjects and academic structure.</p>
                    </div>
                    <div className="mt-3 space-y-2">
                      <Link
                        href="/master-admin/departments"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Departments
                      </Link>
                      <Link
                        href="/master-admin/subjects" 
                        className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Subjects
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Management */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Content Management</h2>
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Content Library</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>Manage all educational content across the platform.</p>
                </div>
                <div className="mt-5 space-x-3">
                  <Link
                    href="/content"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Browse Content Library
                  </Link>
                  <Link
                    href="/content/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Upload Content
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 