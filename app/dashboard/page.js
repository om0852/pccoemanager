'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import Link from 'next/link';

// Card component for the dashboard
function DashboardCard({ title, count, icon, linkText, linkUrl, color }) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${color}`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{count}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <div className="text-sm">
          <Link href={linkUrl} className="font-medium text-blue-700 hover:text-blue-900">
            {linkText}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, isAdmin, isMasterAdmin } = useAuth();
  const [stats, setStats] = useState({
    departments: 0,
    subjects: 0,
    users: 0,
    content: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Use Promise.all to fetch all stats in parallel
        const [departmentsRes, subjectsRes, usersRes, contentRes] = await Promise.all([
          fetch('/api/departments'),
          fetch('/api/subjects'),
          isAdmin() ? fetch('/api/users') : Promise.resolve({ json: () => Promise.resolve([]) }),
          fetch('/api/content')
        ]);

        const departments = await departmentsRes.json();
        const subjects = await subjectsRes.json();
        const users = isAdmin() ? await usersRes.json() : [];
        const content = await contentRes.json();

        setStats({
          departments: Array.isArray(departments) ? departments.length : 0,
          subjects: Array.isArray(subjects) ? subjects.length : 0,
          users: Array.isArray(users) ? users.length : 0,
          content: Array.isArray(content) ? content.length : 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAdmin]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user?.name}! Here's what's happening in your college portal.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {isAdmin() && (
              <>
                <DashboardCard
                  title="Departments"
                  count={stats.departments}
                  icon={
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  }
                  linkText="View all departments"
                  linkUrl="/admin/departments"
                  color="bg-blue-500"
                />

                <DashboardCard
                  title="Subjects"
                  count={stats.subjects}
                  icon={
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  }
                  linkText="View all subjects"
                  linkUrl="/admin/subjects"
                  color="bg-green-500"
                />

                <DashboardCard
                  title="Users"
                  count={stats.users}
                  icon={
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  }
                  linkText="Manage users"
                  linkUrl="/admin/users"
                  color="bg-purple-500"
                />
              </>
            )}

            <DashboardCard
              title="Content Items"
              count={stats.content}
              icon={
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              }
              linkText="View content library"
              linkUrl="/content"
              color="bg-yellow-500"
            />
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {isAdmin() && (
                <>
                  <div className="relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="text-base font-medium text-gray-900">Add New Department</h3>
                    <p className="mt-1 text-sm text-gray-500">Create a new department for your institution.</p>
                    <Link
                      href="/admin/departments/new"
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Create Department
                    </Link>
                  </div>

                  <div className="relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="text-base font-medium text-gray-900">Add New Subject</h3>
                    <p className="mt-1 text-sm text-gray-500">Add a new subject to a department.</p>
                    <Link
                      href="/admin/subjects/new"
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Create Subject
                    </Link>
                  </div>
                </>
              )}

              <div className="relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-medium text-gray-900">Upload Content</h3>
                <p className="mt-1 text-sm text-gray-500">Upload new educational content for students.</p>
                <Link
                  href="/content/new"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Upload Content
                </Link>
              </div>

              <div className="relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-medium text-gray-900">View My Content</h3>
                <p className="mt-1 text-sm text-gray-500">Browse and manage your uploaded content.</p>
                <Link
                  href="/content/my-content"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  My Content
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 