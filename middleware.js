import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  // Check if user is authenticated
  if (!token) {
    if (req.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
  
  // Admin-only routes
  if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/api/admin')) {
    if (token.role !== 'master-admin' && token.role !== 'admin') {
      if (req.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
      
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }
  
  // Master admin only routes
  if (req.nextUrl.pathname.startsWith('/master-admin') || req.nextUrl.pathname.startsWith('/api/master-admin')) {
    if (token.role !== 'master-admin') {
      if (req.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
      
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/admin/:path*', 
    '/master-admin/:path*',
    '/api/users/:path*',
    '/api/departments/:path*',
    '/api/subjects/:path*',
    '/api/content/:path*',
    '/api/chapters/:path*',
    '/api/dashboard/:path*',
    '/api/admin/:path*',
    '/api/master-admin/:path*'
  ],
}; 