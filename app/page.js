import Link from 'next/link';
import { BookOpen, Users, FileText, Building, GraduationCap, UserSquare2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-bold">College Portal</div>
          <div className="space-x-4">
            <Link href="/auth/login" className="hover:text-blue-200">Staff Login</Link>
            <Link href="/student" className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50">
              Student Portal
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
            <div className="space-x-4">
              <Link href="/student" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50">
                Browse Resources
              </Link>
              <Link href="/auth/login" className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10">
                Staff Portal
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
          <div className="grid md:grid-cols-3 gap-8">
            <UserTypeCard
              icon={<GraduationCap className="h-8 w-8" />}
              title="Students"
              description="Access course materials, assignments, and educational resources."
              link="/student"
              linkText="Student Portal"
            />
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
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">College Portal</h3>
              <p className="text-gray-400">
                Your comprehensive platform for academic resource management and learning.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/student" className="hover:text-white">Student Portal</Link></li>
                <li><Link href="/auth/login" className="hover:text-white">Staff Login</Link></li>
              </ul>
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

// Feature Card Component
function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="text-blue-600 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

// User Type Card Component
function UserTypeCard({ icon, title, description, link, linkText }) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors">
      <div className="text-blue-600 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <Link href={link} className="text-blue-600 hover:text-blue-700 font-medium">
        {linkText} →
      </Link>
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
