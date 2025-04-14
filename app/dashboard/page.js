'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { User, FileText, BookOpen, Users, Briefcase, PlusCircle, Settings, BarChart2 } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

// Enhanced dashboard card with icon
function DashboardCard({ title, count, icon, bgColor, textColor, linkTo }) {
  const Icon = icon;
  
  return (
    <Link 
      href={linkTo}
      className="block transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
    >
      <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
        <div className="p-6">
          <div className="flex items-center">
            <div className={`flex-shrink-0 rounded-md p-3 ${bgColor}`}>
              <Icon className={`h-6 w-6 ${textColor}`} />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                <dd>
                  <div className="text-2xl font-semibold text-gray-900">{count}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Quick action card
function QuickActionCard({ title, description, icon, linkTo, primary = false }) {
  const Icon = icon;
  
  return (
    <Link
      href={linkTo}
      className="block transition-transform duration-200 hover:scale-105"
    >
      <div className={`h-full rounded-lg shadow-sm p-6 border ${primary ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
        <div className={`inline-flex rounded-md p-3 ${primary ? 'bg-blue-100' : 'bg-gray-100'} mb-4`}>
          <Icon className={`h-6 w-6 ${primary ? 'text-blue-600' : 'text-gray-600'}`} />
        </div>
        <h3 className={`text-lg font-medium ${primary ? 'text-blue-900' : 'text-gray-900'}`}>{title}</h3>
        <p className={`mt-2 text-sm ${primary ? 'text-blue-700' : 'text-gray-600'}`}>{description}</p>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { user, status } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    // Skip if no user or if stats are already loaded
    if (!user || stats) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard', {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Could not load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, router, status, stats]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderAdminDashboard = () => (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">System Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard 
            title="Total Departments" 
            count={stats?.departments || 0} 
            icon={Briefcase}
            bgColor="bg-purple-100" 
            textColor="text-purple-600"
            linkTo="/admin/departments"
          />
          <DashboardCard 
            title="Total Subjects" 
            count={stats?.subjects || 0} 
            icon={BookOpen}
            bgColor="bg-blue-100" 
            textColor="text-blue-600"
            linkTo="/admin/subjects"
          />
          <DashboardCard 
            title="Total Users" 
            count={stats?.users || 0} 
            icon={User}
            bgColor="bg-green-100" 
            textColor="text-green-600" 
            linkTo="/admin/users"
          />
          <DashboardCard 
            title="Content Items" 
            count={stats?.contentItems || 0} 
            icon={FileText}
            bgColor="bg-amber-100" 
            textColor="text-amber-600"
            linkTo="/content"
          />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
            title="Add New Content"
            description="Upload lectures, notes, or other course materials"
            icon={PlusCircle}
            linkTo="/content/new"
            primary={true}
          />
          <QuickActionCard
            title="Manage Users"
            description="Add, edit, or manage user accounts"
            icon={Users}
            linkTo="/admin/users"
          />
          <QuickActionCard
            title="Content Analytics"
            description="View usage statistics and analytics"
            icon={BarChart2}
            linkTo="/content/analytics"
          />
        </div>
      </div>
    </>
  );

  const renderTeacherDashboard = () => (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Content</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
          <DashboardCard 
            title="My Content Items" 
            count={stats?.teacherContent || 0} 
            icon={FileText}
            bgColor="bg-blue-100" 
            textColor="text-blue-600"
            linkTo="/content"
          />
          <DashboardCard 
            title="My Subjects" 
            count={stats?.teacherSubjects || 0} 
            icon={BookOpen}
            bgColor="bg-green-100" 
            textColor="text-green-600"
            linkTo="/content"
          />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuickActionCard
            title="Add New Content"
            description="Upload lectures, notes, or other course materials"
            icon={PlusCircle}
            linkTo="/content/new"
            primary={true}
          />
          <QuickActionCard
            title="Manage Your Profile"
            description="Update your profile information and preferences"
            icon={Settings}
            linkTo="/profile"
          />
        </div>
      </div>
    </>
  );

  const renderStudentDashboard = () => (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuickActionCard
            title="Access Student Portal"
            description="View and download course materials, notes, and assignments"
            icon={BookOpen}
            linkTo="/student"
            primary={true}
          />
          <QuickActionCard
            title="Manage Your Profile"
            description="Update your profile information and preferences"
            icon={Settings}
            linkTo="/profile"
          />
        </div>
      </div>
    </>
  );

  return (
    <div>
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}</h1>
        <p className="mt-1 text-gray-600">
          {user?.role === 'master-admin' && 'You have access to all administrative features of the College Portal.'}
          {user?.role === 'admin' && 'You have access to your department\'s administrative features.'}
          {user?.role === 'teacher' && 'You can manage your course content and view your assigned subjects.'}
          {user?.role === 'student' && 'Welcome to your student dashboard. Access your course materials and resources here.'}
        </p>
      </div>

      {(user?.role === 'master-admin' || user?.role === 'admin') && renderAdminDashboard()}
      {user?.role === 'teacher' && renderTeacherDashboard()}
      {user?.role === 'student' && renderStudentDashboard()}
    </div>
  );
} 