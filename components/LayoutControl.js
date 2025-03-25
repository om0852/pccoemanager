'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import Navbar from './Navbar';

export default function LayoutControl({ children }) {
  const pathname = usePathname();
  const { user, status } = useAuth();
  
  // Routes where the navbar should not be displayed
  const excludedRoutes = ['/', '/auth/login'];
  const shouldShowNavbar = !excludedRoutes.includes(pathname) && status === 'authenticated';

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      {children}
    </>
  );
} 