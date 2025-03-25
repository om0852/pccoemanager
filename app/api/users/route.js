import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// @desc    Register user
// @route   POST /api/users
// @access  Private (Admin/Master Admin only)
export async function POST(request) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and has proper role
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'master-admin')) {
      return NextResponse.json(
        { error: 'Not authorized to register users' },
        { status: 403 }
      );
    }
    
    const data = await request.json();
    
    // Check if email already exists
    const userExists = await User.findOne({ email: data.email });
    if (userExists) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Validate role permissions
    // Only master-admin can create master-admin users
    if (data.role === 'master-admin') {
      return NextResponse.json(
        { error: 'Cannot create master admin users' },
        { status: 403 }
      );
    }
    
    // Add the user who created this account
    data.createdBy = session.user.id;
    
    const user = await User.create(data);
    
    // Remove password from response
    const response = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };
    
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user', details: error.message },
      { status: 500 }
    );
  }
}

// @desc    Get all users (with filtering)
// @route   GET /api/users
// @access  Private (Admin/Master Admin only)
export async function GET(request) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and has proper role
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'master-admin')) {
      return NextResponse.json(
        { error: 'Not authorized to view all users' },
        { status: 403 }
      );
    }
    
    // Get search params
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const query = {};
    
    // Apply role filter if provided
    if (role) {
      query.role = role;
    }
    
    // Admins can only see users they created (except master-admin)
    if (session.user.role === 'admin') {
      query.createdBy = session.user.id;
    }
    
    // Find users
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error.message },
      { status: 500 }
    );
  }
} 