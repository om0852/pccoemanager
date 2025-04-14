import Link from 'next/link';
import { BookOpen, Users, FileText, Building, GraduationCap, UserSquare2 } from 'lucide-react';

// Helper component for feature cards
function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="bg-blue-100 rounded-lg p-3 inline-block mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

// Helper component for user type cards
function UserTypeCard({ icon, title, description, link, linkText }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="bg-blue-100 rounded-lg p-3 inline-block mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <Link
        href={link}
        className="inline-flex items-center text-blue-600 hover:text-blue-800"
      >
        {linkText}
        <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </Link>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-bold">College Portal</div>
          <div>
            <Link href="/auth/login" className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50">
              Login
            </Link>
          </div>
        </nav>
        
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Welcome to Your Digital Learning Hub
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Access educational resources, course materials, and stay connected with your academic journey.
            </p>
            <div>
              <Link href="/auth/login" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50">
                Login to Portal
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Platform Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BookOpen className="h-8 w-8" />}
              title="Educational Content"
              description="Access notes, assignments, and learning materials organized by subject and department."
            />
            <FeatureCard
              icon={<FileText className="h-8 w-8" />}
              title="Study Materials"
              description="Download lecture notes, assignments, and reference materials for your courses."
            />
            <FeatureCard
              icon={<Building className="h-8 w-8" />}
              title="Department Resources"
              description="Find resources specific to your department and academic programs."
            />
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Who It&apos;s For</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <UserTypeCard
              icon={<UserSquare2 className="h-8 w-8" />}
              title="Teachers"
              description="Upload and manage course content, track student progress."
              link="/auth/login"
              linkText="Teacher Login"
            />
            <UserTypeCard
              icon={<Users className="h-8 w-8" />}
              title="Administrators"
              description="Manage departments, subjects, and user access."
              link="/auth/login"
              linkText="Admin Login"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">College Portal</h3>
              <p className="text-gray-400">
                Your comprehensive platform for academic resource management and learning.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Contact</h3>
              <p className="text-gray-400">
                Email: support@collegeportal.com<br />
                Phone: (123) 456-7890
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} College Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Example of how to upload a file
const uploadFile = async (file, contentType) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('contentType', contentType);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  return data.fileUrl; // This URL can be saved in your content database
};
