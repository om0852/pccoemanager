import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Check if user is admin
    const userEmail = session.user.email;
    await connectToDatabase();
    
    const adminUser = await User.findOne({ email: userEmail });
    
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const roleParam = searchParams.get('role');
    
    // Build query
    let query = {};
    
    // Filter by role if specified
    if (roleParam) {
      // Handle multiple roles (comma-separated)
      const roles = roleParam.split(',');
      query.role = { $in: roles };
    }
    
    // In a real application, you would add additional filters based on admin's access
    // For example, only teachers in departments the admin manages
    // For simplicity, we're returning all users matching the role filter
    
    const users = await User.find(query)
      .select('name email role')
      .sort({ name: 1 });
    
    return NextResponse.json(users);
    
  } catch (error) {
    console.error('Error fetching users for admin:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
} 