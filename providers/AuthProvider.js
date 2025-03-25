'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export function AuthProvider({ children }) {
  const { data: session, status: sessionStatus } = useSession();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');
  const router = useRouter();

  // Update user state when session changes
  useEffect(() => {
    if (sessionStatus === 'loading') {
      setStatus('loading');
      return;
    }

    if (session && session.user) {
      setUser(session.user);
      setStatus('authenticated');
    } else {
      setUser(null);
      setStatus('unauthenticated');
    }
  }, [session, sessionStatus]);

  // Login function
  const login = async (email, password) => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result.error) {
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Failed to login' };
    }
  };

  // Logout function
  const logout = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  // Check if user has a specific role
  const hasRole = (roles) => {
    if (!user) return false;
    
    if (typeof roles === 'string') {
      return user.role === roles;
    }
    
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    
    return false;
  };

  // Check if user is master admin
  const isMasterAdmin = () => hasRole('master-admin');
  
  // Check if user is admin
  const isAdmin = () => hasRole(['admin', 'master-admin']);
  
  // Check if user is teacher
  const isTeacher = () => hasRole('teacher');

  // The context value
  const value = {
    user,
    status,
    login,
    logout,
    hasRole,
    isMasterAdmin,
    isAdmin,
    isTeacher,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 