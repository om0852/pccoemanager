'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { ChevronDown, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [contentDropdownOpen, setContentDropdownOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isActive = (path) => {
    if (path === '/dashboard' && pathname === '/dashboard') return true;
    return pathname.startsWith(path) && path !== '/dashboard';
  };

  // Get role-specific navigation items
  const getNavItems = () => {
    if (!user) return [];

    // Common items for all roles
    const commonItems = [
      { name: 'Dashboard', href: '/dashboard' }
    ];

    // Additional items based on role
    if (user.role === 'master-admin') {
      return [
        ...commonItems,
        { 
          name: 'Admin', 
          href: '#',
          dropdown: true,
          items: [
            { name: 'Departments', href: '/admin/departments' },
            { name: 'Subjects', href: '/admin/subjects' },
            { name: 'Users', href: '/admin/users' },
            { name: 'Chapters', href: '/admin/chapters' }
          ]
        },
        { 
          name: 'Content', 
          href: '#',
          dropdown: true,
          items: [
            { name: 'All Content', href: '/content' },
            { name: 'Add New', href: '/content/new' },
            { name: 'Manage', href: '/content/manage' }
          ]
        }
      ];
    } else if (user.role === 'admin') {
      return [
        ...commonItems,
        { 
          name: 'Admin', 
          href: '#',
          dropdown: true,
          items: [
            { name: 'Subjects', href: '/admin/subjects' },
            { name: 'Users', href: '/admin/users' },
            { name: 'Chapters', href: '/admin/chapters' }
          ]
        },
        { 
          name: 'Content', 
          href: '#',
          dropdown: true,
          items: [
            { name: 'All Content', href: '/content' },
            { name: 'Add New', href: '/content/new' },
            { name: 'Manage', href: '/content/manage' }
          ]
        }
      ];
    } else if (user.role === 'teacher') {
      return [
        ...commonItems,
        { name: 'My Content', href: '/content' },
        { name: 'Add Content', href: '/content/new' }
      ];
    }

    return commonItems;
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and desktop nav */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link 
                href="/dashboard" 
                className="text-xl font-bold text-blue-600 hover:text-blue-700"
              >
                College Portal
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {navItems.map((item) => (
                !item.dropdown ? (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium ${
                      isActive(item.href)
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <div key={item.name} className="relative inline-block text-left">
                    <button
                      type="button"
                      className={`inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium ${
                        (item.name === 'Admin' && adminDropdownOpen) || (item.name === 'Content' && contentDropdownOpen) || pathname.includes(item.name.toLowerCase())
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                      onClick={() => {
                        if (item.name === 'Admin') {
                          setAdminDropdownOpen(!adminDropdownOpen);
                          setContentDropdownOpen(false);
                        } else {
                          setContentDropdownOpen(!contentDropdownOpen);
                          setAdminDropdownOpen(false);
                        }
                      }}
                    >
                      {item.name}
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </button>
                    
                    {/* Dropdown for Admin or Content */}
                    {((item.name === 'Admin' && adminDropdownOpen) || 
                      (item.name === 'Content' && contentDropdownOpen)) && (
                      <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                        <div className="py-1" role="menu" aria-orientation="vertical">
                          {item.items.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className={`block px-4 py-2 text-sm ${
                                pathname === subItem.href
                                  ? 'bg-gray-100 text-gray-900'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                              role="menuitem"
                              onClick={() => {
                                if (item.name === 'Admin') {
                                  setAdminDropdownOpen(false);
                                } else {
                                  setContentDropdownOpen(false);
                                }
                              }}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              ))}
            </div>
          </div>
          
          {/* User info and logout (desktop) */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user && (
              <>
                <div className="mr-4 text-sm text-gray-700">
                  <span className="font-medium">{user.name}</span>
                  <span className="ml-1 text-gray-500">({user.role})</span>
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Logout
                </button>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={toggleMobileMenu}
            >
              <span className="sr-only">{mobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden" id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              !item.dropdown ? (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive(item.href)
                      ? 'border-blue-500 text-blue-700 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ) : (
                <div key={item.name}>
                  <button
                    type="button"
                    className={`w-full flex justify-between items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                      (item.name === 'Admin' && adminDropdownOpen) || (item.name === 'Content' && contentDropdownOpen) || pathname.includes(item.name.toLowerCase())
                        ? 'border-blue-500 text-blue-700 bg-blue-50'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                    }`}
                    onClick={() => {
                      if (item.name === 'Admin') {
                        setAdminDropdownOpen(!adminDropdownOpen);
                        setContentDropdownOpen(false);
                      } else {
                        setContentDropdownOpen(!contentDropdownOpen);
                        setAdminDropdownOpen(false);
                      }
                    }}
                  >
                    {item.name}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {/* Dropdown for Admin or Content (mobile) */}
                  {((item.name === 'Admin' && adminDropdownOpen) || 
                    (item.name === 'Content' && contentDropdownOpen)) && (
                    <div className="pl-4">
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={`block pl-3 pr-4 py-2 border-l-4 text-sm ${
                            pathname === subItem.href
                              ? 'border-blue-500 text-blue-700 bg-blue-50'
                              : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            ))}
          </div>
          
          {/* User info and logout (mobile) */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-medium">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{user?.name}</div>
                <div className="text-sm font-medium text-gray-500">{user?.role}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 